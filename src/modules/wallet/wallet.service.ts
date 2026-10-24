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
}
