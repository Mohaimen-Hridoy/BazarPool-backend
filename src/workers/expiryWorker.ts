import cron from 'node-cron';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { broadcastLiveEvent } from '../utils/eventStream.js';

export const processExpiredCampaigns = async () => {
  try {
    const now = new Date();

    // Find all active OPEN campaigns whose deadline has passed and target wasn't met
    const expiredCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'OPEN',
        deadline: { lt: now },
      },
      include: {
        commitments: {
          where: { status: 'COMMITTED' },
        },
      },
    });

    if (expiredCampaigns.length === 0) return;

    console.log(`[Expiry Worker] Found ${expiredCampaigns.length} expired campaign(s). Initiating refund engine...`);

    for (const campaign of expiredCampaigns) {
      await prisma.$transaction(async (tx) => {
        // Mark campaign as EXPIRED
        await tx.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'EXPIRED',
            expiredAt: now,
          },
        });

        console.log(`[Expiry Worker] Campaign #${campaign.id} (${campaign.title}) expired. Processing ${campaign.commitments.length} refunds...`);

        // Process each commitment refund idempotently
        for (const comm of campaign.commitments) {
          // Check if wallet exists
          const wallet = await tx.walletAccount.findUnique({
            where: { userId: comm.consumerId },
          });

          if (wallet) {
            // Restore funds from reserved back to available balance
            const updatedWallet = await tx.walletAccount.update({
              where: { id: wallet.id },
              data: {
                reservedBalance: { decrement: comm.totalAmount },
                availableBalance: { increment: comm.totalAmount },
              },
            });

            // Create auditable refund ledger entry
            await tx.walletLedgerEntry.create({
              data: {
                walletAccountId: wallet.id,
                type: 'REFUND',
                amount: comm.totalAmount,
                balanceAfter: updatedWallet.availableBalance,
                referenceId: comm.id,
                notes: `Auto-refund for expired campaign: ${campaign.title}`,
                idempotencyKey: `REFUND-${comm.id}`,
              },
            });
          }

          // Mark commitment as REFUNDED
          await tx.commitment.update({
            where: { id: comm.id },
            data: { status: 'REFUNDED' },
          });

          // Create notification for consumer
          await tx.notification.create({
            data: {
              userId: comm.consumerId,
              title: 'Campaign Expired - Full Refund Credited',
              message: `The group-buying target for "${campaign.title}" was not reached before deadline. ৳${comm.totalAmount.toFixed(2)} has been credited back to your wallet.`,
              type: 'REFUND',
            },
          });
        }

        // Finalize campaign state to REFUNDED
        await tx.campaign.update({
          where: { id: campaign.id },
          data: { status: 'REFUNDED' },
        });

        console.log(`[Expiry Worker] Successfully finalized refunds for Campaign #${campaign.id}`);
      });

      broadcastLiveEvent('POOL_EXPIRED', {
        campaignId: campaign.id,
        title: campaign.title,
        status: 'REFUNDED',
      });
    }
  } catch (error) {
    console.error('[Expiry Worker] Error processing campaign expirations:', error);
  }
};

export const startExpiryWorker = () => {
  console.log(`[Expiry Worker] Initializing cron job on schedule: ${config.expiryCronSchedule}`);
  cron.schedule(config.expiryCronSchedule, async () => {
    await processExpiredCampaigns();
  });
};
