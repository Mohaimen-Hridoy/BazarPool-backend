import { prisma } from '../../config/prisma.js';
import { generateQrCodeDataUrl } from '../../utils/qrcode.js';
import { recordAuditLog } from '../../utils/auditLog.js';
import crypto from 'crypto';

export class CommitmentService {
  static async commitToCampaign(
    consumerId: string,
    campaignId: string,
    data: { quantity: number; idempotencyKey?: string }
  ) {
    const { quantity, idempotencyKey } = data;

    // Concurrency-Safe Transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Check idempotency if key provided
      if (idempotencyKey) {
        const existing = await tx.commitment.findUnique({
          where: { idempotencyKey },
          include: { campaign: true },
        });
        if (existing) {
          return {
            commitment: existing,
            campaignLocked: existing.campaign.status === 'LOCKED',
            isDuplicate: true,
          };
        }
      }

      // 2. Fetch campaign state
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
        include: { product: true },
      });

      if (!campaign) {
        const error: any = new Error('Campaign not found.');
        error.statusCode = 404;
        throw error;
      }

      if (campaign.status !== 'OPEN') {
        const error: any = new Error(
          `Cannot commit to campaign. Current status is ${campaign.status}.`
        );
        error.statusCode = 400;
        throw error;
      }

      if (new Date() > campaign.deadline) {
        const error: any = new Error('This campaign has passed its deadline and is expired.');
        error.statusCode = 400;
        throw error;
      }

      // Quantity rules
      if (quantity < campaign.minCommitmentQty) {
        const error: any = new Error(
          `Minimum commitment quantity for this campaign is ${campaign.minCommitmentQty} ${campaign.product.unit}.`
        );
        error.statusCode = 400;
        throw error;
      }

      if (quantity > campaign.maxCommitmentQty) {
        const error: any = new Error(
          `Maximum commitment quantity per user is ${campaign.maxCommitmentQty} ${campaign.product.unit}.`
        );
        error.statusCode = 400;
        throw error;
      }

      const remainingCapacity = campaign.targetQuantity - campaign.committedQuantity;
      if (quantity > remainingCapacity) {
        const error: any = new Error(
          `Insufficient campaign capacity. Only ${remainingCapacity} ${campaign.product.unit} remaining.`
        );
        error.statusCode = 400;
        throw error;
      }

      const totalCost = quantity * campaign.unitPrice;

      // 3. Check consumer wallet balance
      const wallet = await tx.walletAccount.findUnique({
        where: { userId: consumerId },
      });

      if (!wallet) {
        const error: any = new Error('Wallet account not found for user.');
        error.statusCode = 404;
        throw error;
      }

      if (wallet.availableBalance < totalCost) {
        const error: any = new Error(
          `Insufficient wallet balance. Required: ৳${totalCost.toFixed(
            2
          )}, Available: ৳${wallet.availableBalance.toFixed(2)}. Please top up.`
        );
        error.statusCode = 400;
        throw error;
      }

      // 4. Reserve funds atomically in wallet
      const updatedWallet = await tx.walletAccount.update({
        where: { id: wallet.id },
        data: {
          availableBalance: { decrement: totalCost },
          reservedBalance: { increment: totalCost },
        },
      });

      // 5. Create Commitment
      const commitment = await tx.commitment.create({
        data: {
          campaignId,
          consumerId,
          quantity,
          unitPrice: campaign.unitPrice,
          totalAmount: totalCost,
          idempotencyKey: idempotencyKey || undefined,
        },
      });

      // 6. Record Wallet Ledger Entry
      await tx.walletLedgerEntry.create({
        data: {
          walletAccountId: wallet.id,
          type: 'RESERVATION',
          amount: totalCost,
          balanceAfter: updatedWallet.availableBalance,
          referenceId: commitment.id,
          notes: `Reserved ৳${totalCost} for commitment in campaign: ${campaign.title}`,
        },
      });

      // Audit Log for commitment creation
      await recordAuditLog({
        userId: consumerId,
        action: 'COMMITMENT_CREATED',
        entity: 'Commitment',
        entityId: commitment.id,
        details: { campaignId, quantity, totalCost },
      });

      // 7. Update Campaign committed quantity
      const newCommittedQuantity = campaign.committedQuantity + quantity;
      const willLock = newCommittedQuantity >= campaign.targetQuantity;

      const updatedCampaign = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          committedQuantity: newCommittedQuantity,
          status: willLock ? 'LOCKED' : 'OPEN',
          lockedAt: willLock ? new Date() : undefined,
        },
      });

      // 8. If campaign reaches target quantity and locks, convert all commitments into Orders with QR tokens!
      if (willLock) {
        const allCommitments = await tx.commitment.findMany({
          where: { campaignId, status: 'COMMITTED' },
        });

        for (const comm of allCommitments) {
          const order = await tx.order.create({
            data: {
              campaignId,
              consumerId: comm.consumerId,
              commitmentId: comm.id,
              totalQuantity: comm.quantity,
              totalAmount: comm.totalAmount,
              status: 'PENDING_FULFILLMENT',
            },
          });

          // Generate secure token code (e.g. BP-xxxx-xxxx)
          const tokenCode = `BP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          const qrPayload = JSON.stringify({
            orderId: order.id,
            tokenCode,
            campaignId,
            consumerId: comm.consumerId,
            quantity: comm.quantity,
          });

          const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);

          await tx.pickupToken.create({
            data: {
              orderId: order.id,
              tokenCode,
              qrCodeDataUrl,
              expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days valid
            },
          });

          // Debit reserved balance permanently on lock
          await tx.walletAccount.update({
            where: { userId: comm.consumerId },
            data: {
              reservedBalance: { decrement: comm.totalAmount },
            },
          });

          const commWallet = await tx.walletAccount.findUnique({
            where: { userId: comm.consumerId },
          });

          await tx.walletLedgerEntry.create({
            data: {
              walletAccountId: commWallet!.id,
              type: 'PURCHASE_DEBIT',
              amount: comm.totalAmount,
              balanceAfter: commWallet!.availableBalance,
              referenceId: order.id,
              notes: `Campaign locked! Successfully debited ৳${comm.totalAmount} for Order #${order.id}`,
            },
          });
        }

        await recordAuditLog({
          action: 'CAMPAIGN_LOCKED',
          entity: 'Campaign',
          entityId: campaignId,
          details: { targetQuantity: updatedCampaign.targetQuantity, ordersCount: allCommitments.length },
        });
      }

      return {
        commitment,
        campaign: updatedCampaign,
        campaignLocked: willLock,
        remainingCapacity: Math.max(0, updatedCampaign.targetQuantity - updatedCampaign.committedQuantity),
      };
    });
  }

  static async getMyCommitments(consumerId: string) {
    return await prisma.commitment.findMany({
      where: { consumerId },
      include: {
        campaign: {
          include: {
            product: true,
            pickupHub: true,
          },
        },
        order: {
          include: {
            pickupToken: true,
            pickupRecord: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async cancelCommitment(consumerId: string, commitmentId: string) {
    return await prisma.$transaction(async (tx) => {
      const commitment = await tx.commitment.findUnique({
        where: { id: commitmentId },
        include: { campaign: true },
      });

      if (!commitment) {
        const error: any = new Error('Commitment not found.');
        error.statusCode = 404;
        throw error;
      }

      if (commitment.consumerId !== consumerId) {
        const error: any = new Error('You do not have permission to cancel this commitment.');
        error.statusCode = 403;
        throw error;
      }

      if (commitment.status !== 'COMMITTED') {
        const error: any = new Error(`Cannot cancel commitment with status ${commitment.status}.`);
        error.statusCode = 400;
        throw error;
      }

      if (commitment.campaign.status !== 'OPEN') {
        const error: any = new Error('Cannot cancel commitment once campaign has locked or fulfilled.');
        error.statusCode = 400;
        throw error;
      }

      // 1. Release reserved wallet balance
      const wallet = await tx.walletAccount.update({
        where: { userId: consumerId },
        data: {
          reservedBalance: { decrement: commitment.totalAmount },
          availableBalance: { increment: commitment.totalAmount },
        },
      });

      // 2. Ledger record
      await tx.walletLedgerEntry.create({
        data: {
          walletAccountId: wallet.id,
          type: 'RESERVATION_RELEASE',
          amount: commitment.totalAmount,
          balanceAfter: wallet.availableBalance,
          referenceId: commitment.id,
          notes: `Released reservation of ৳${commitment.totalAmount} for cancelled commitment.`,
        },
      });

      // 3. Mark commitment cancelled
      const updatedCommitment = await tx.commitment.update({
        where: { id: commitmentId },
        data: { status: 'CANCELLED' },
      });

      // 4. Decrement campaign committed quantity
      await tx.campaign.update({
        where: { id: commitment.campaignId },
        data: {
          committedQuantity: { decrement: commitment.quantity },
        },
      });

      await recordAuditLog({
        userId: consumerId,
        action: 'COMMITMENT_CANCELLED',
        entity: 'Commitment',
        entityId: commitmentId,
        details: { campaignId: commitment.campaignId, quantity: commitment.quantity, refundAmount: commitment.totalAmount },
      });

      return updatedCommitment;
    });
  }
}
