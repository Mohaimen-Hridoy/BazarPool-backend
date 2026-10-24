import { prisma } from '../../config/prisma.js';
import { CampaignStatus } from '@prisma/client';

export class CampaignService {
  static async createCampaign(
    supplierId: string,
    data: {
      productId: string;
      pickupHubId: string;
      title: string;
      description?: string;
      unitPrice: number;
      targetQuantity: number;
      minCommitmentQty?: number;
      maxCommitmentQty: number;
      deadline: string;
    }
  ) {
    // Validate product ownership
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || product.supplierId !== supplierId) {
      const error: any = new Error('Product not found or does not belong to you.');
      error.statusCode = 403;
      throw error;
    }

    // Validate pickup hub existence
    const hub = await prisma.pickupHub.findUnique({
      where: { id: data.pickupHubId },
    });

    if (!hub || !hub.isActive) {
      const error: any = new Error('Designated Pickup Hub not found or inactive.');
      error.statusCode = 404;
      throw error;
    }

    const deadlineDate = new Date(data.deadline);
    if (deadlineDate <= new Date()) {
      const error: any = new Error('Campaign deadline must be in the future.');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.campaign.create({
      data: {
        supplierId,
        productId: data.productId,
        pickupHubId: data.pickupHubId,
        title: data.title,
        description: data.description,
        unitPrice: data.unitPrice,
        targetQuantity: data.targetQuantity,
        minCommitmentQty: data.minCommitmentQty || 1,
        maxCommitmentQty: data.maxCommitmentQty,
        deadline: deadlineDate,
      },
      include: {
        product: true,
        pickupHub: true,
      },
    });
  }

  static async getAllCampaigns(filters?: {
    status?: CampaignStatus;
    category?: string;
    city?: string;
    supplierId?: string;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.supplierId) where.supplierId = filters.supplierId;
    if (filters?.category) {
      where.product = { category: filters.category };
    }
    if (filters?.city) {
      where.pickupHub = { city: filters.city };
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        product: true,
        pickupHub: true,
        supplier: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { commitments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((c) => {
      const progressPercent = Math.min(
        100,
        Math.round((c.committedQuantity / c.targetQuantity) * 100)
      );
      const remainingQuantity = Math.max(0, c.targetQuantity - c.committedQuantity);

      return {
        ...c,
        progressPercent,
        remainingQuantity,
      };
    });
  }

  static async getCampaignById(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        product: true,
        pickupHub: true,
        supplier: {
          select: { id: true, fullName: true, email: true },
        },
        commitments: {
          include: {
            consumer: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!campaign) {
      const error: any = new Error('Campaign not found.');
      error.statusCode = 404;
      throw error;
    }

    const progressPercent = Math.min(
      100,
      Math.round((campaign.committedQuantity / campaign.targetQuantity) * 100)
    );
    const remainingQuantity = Math.max(0, campaign.targetQuantity - campaign.committedQuantity);

    return {
      ...campaign,
      progressPercent,
      remainingQuantity,
    };
  }
}
