import { prisma } from '../../config/prisma.js';
import { recordAuditLog } from '../../utils/auditLog.js';

export class FulfillmentService {
  static async dispatchCampaign(supplierId: string, campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      const error: any = new Error('Campaign not found.');
      error.statusCode = 404;
      throw error;
    }

    if (campaign.supplierId !== supplierId) {
      const error: any = new Error('Only the campaign supplier can dispatch orders.');
      error.statusCode = 403;
      throw error;
    }

    if (campaign.status !== 'LOCKED') {
      const error: any = new Error(
        `Campaign cannot be dispatched. Current status is ${campaign.status}. Must be LOCKED.`
      );
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'DISPATCHED',
        dispatchedAt: new Date(),
      },
    });

    await recordAuditLog({
      userId: supplierId,
      action: 'CAMPAIGN_DISPATCHED',
      entity: 'Campaign',
      entityId: campaignId,
      details: { title: campaign.title, pickupHubId: campaign.pickupHubId },
    });

    return updated;
  }

  static async markArrivedAtHub(coordinatorOrSupplierId: string, campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      const error: any = new Error('Campaign not found.');
      error.statusCode = 404;
      throw error;
    }

    if (campaign.status !== 'DISPATCHED') {
      const error: any = new Error(
        `Campaign cannot be marked arrived. Current status is ${campaign.status}. Must be DISPATCHED.`
      );
      error.statusCode = 400;
      throw error;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Update campaign status
      const updatedCampaign = await tx.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'AT_HUB',
          arrivedAtHubAt: new Date(),
        },
      });

      // 2. Update all associated orders to READY_FOR_PICKUP
      await tx.order.updateMany({
        where: { campaignId },
        data: {
          status: 'READY_FOR_PICKUP',
        },
      });

      // 3. Notify all consumers that orders are ready at hub
      const orders = await tx.order.findMany({
        where: { campaignId },
        select: { consumerId: true },
      });

      for (const ord of orders) {
        await tx.notification.create({
          data: {
            userId: ord.consumerId,
            title: 'Order Ready for Pickup!',
            message: `Your group-buying order for "${campaign.title}" has arrived at the designated hub and is ready for collection with your QR pass.`,
            type: 'PICKUP_READY',
          },
        });
      }

      await recordAuditLog({
        userId: coordinatorOrSupplierId,
        action: 'CAMPAIGN_ARRIVED_AT_HUB',
        entity: 'Campaign',
        entityId: campaignId,
      });

      return updatedCampaign;
    });
  }

  static async verifyPickupToken(
    coordinatorId: string,
    data: { tokenCode: string; hubId?: string; notes?: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      const token = await tx.pickupToken.findUnique({
        where: { tokenCode: data.tokenCode.trim() },
        include: {
          order: {
            include: {
              campaign: {
                include: { product: true, pickupHub: true },
              },
              consumer: {
                select: { id: true, fullName: true, phone: true, email: true },
              },
            },
          },
        },
      });

      if (!token) {
        const error: any = new Error('Invalid Pickup Token Code.');
        error.statusCode = 404;
        throw error;
      }

      if (token.status === 'REDEEMED') {
        const error: any = new Error(
          `Security Alert: Token already redeemed on ${token.redeemedAt?.toLocaleString()}. Double redemption prevented.`
        );
        error.statusCode = 409;
        throw error;
      }

      if (token.status === 'EXPIRED' || new Date() > token.expiresAt) {
        const error: any = new Error('This pickup token has expired.');
        error.statusCode = 400;
        throw error;
      }

      const hubIdToUse = data.hubId || token.order.campaign.pickupHubId;

      // Mark token as redeemed
      const updatedToken = await tx.pickupToken.update({
        where: { id: token.id },
        data: {
          status: 'REDEEMED',
          redeemedAt: new Date(),
        },
      });

      // Mark order as collected
      await tx.order.update({
        where: { id: token.orderId },
        data: { status: 'COLLECTED' },
      });

      // Create official audit record of collection
      const record = await tx.pickupRecord.create({
        data: {
          orderId: token.orderId,
          pickupTokenId: token.id,
          coordinatorId,
          hubId: hubIdToUse,
          notes: data.notes || 'Verified and handed over at hub.',
        },
      });

      // Check if all orders in this campaign have been collected
      const remainingUncollectedOrders = await tx.order.count({
        where: {
          campaignId: token.order.campaignId,
          status: { not: 'COLLECTED' },
        },
      });

      if (remainingUncollectedOrders === 0) {
        await tx.campaign.update({
          where: { id: token.order.campaignId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });
      }

      await recordAuditLog({
        userId: coordinatorId,
        action: 'PICKUP_TOKEN_VERIFIED',
        entity: 'PickupToken',
        entityId: token.id,
        details: { orderId: token.orderId, tokenCode: token.tokenCode, hubId: hubIdToUse },
      });

      return {
        message: 'Product pickup verified and authorized successfully!',
        order: token.order,
        pickupRecord: record,
        token: updatedToken,
      };
    });
  }
}
