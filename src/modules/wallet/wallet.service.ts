import { prisma } from '../../config/prisma.js';

export class WalletService {
  static async getWalletDetails(userId: string) {
    const wallet = await prisma.walletAccount.findUnique({
      where: { userId },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!wallet) {
      const error: any = new Error('Wallet account not found.');
      error.statusCode = 404;
      throw error;
    }

    return wallet;
  }

  static async simulateTopUp(userId: string, amount: number) {
    if (amount <= 0) {
      const error: any = new Error('Top-up amount must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.walletAccount.findUnique({
        where: { userId },
      });

      if (!wallet) {
        const error: any = new Error('Wallet not found.');
        error.statusCode = 404;
        throw error;
      }

      const updatedWallet = await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { increment: amount },
        },
      });

      await tx.walletLedgerEntry.create({
        data: {
          walletAccountId: wallet.id,
          type: 'TOP_UP',
          amount,
          balanceAfter: updatedWallet.availableBalance,
          notes: `Simulated wallet top-up of ৳${amount.toFixed(2)}`,
        },
      });

      return updatedWallet;
    });
  }

  static async mfsCheckout(
    userId: string,
    data: { method: 'BKASH' | 'NAGAD' | 'CARD'; amount: number; trxId?: string }
  ) {
    const { method, amount, trxId } = data;
    if (amount <= 0) {
      const error: any = new Error('Recharge amount must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    const generatedTrxId =
      trxId?.trim() ||
      `${method}-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

    return await prisma.$transaction(async (tx) => {
      const wallet = await tx.walletAccount.findUnique({
        where: { userId },
      });

      if (!wallet) {
        const error: any = new Error('Wallet not found.');
        error.statusCode = 404;
        throw error;
      }

      const updatedWallet = await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { increment: amount },
        },
      });

      const ledger = await tx.walletLedgerEntry.create({
        data: {
          walletAccountId: wallet.id,
          type: 'TOP_UP',
          amount,
          balanceAfter: updatedWallet.availableBalance,
          notes: `${
            method === 'BKASH' ? 'bKash Instant' : method === 'NAGAD' ? 'Nagad Direct' : 'Visa/Mastercard'
          } Recharge (TrxID: ${generatedTrxId})`,
          idempotencyKey: `TRX-${generatedTrxId}`,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: `${method} Top-Up Successful!`,
          message: `৳${amount.toLocaleString()} has been added to your virtual wallet balance. TrxID: ${generatedTrxId}.`,
          type: 'WALLET_TOPUP',
        },
      });

      return {
        wallet: updatedWallet,
        trxId: generatedTrxId,
        ledger,
      };
    });
  }
}
