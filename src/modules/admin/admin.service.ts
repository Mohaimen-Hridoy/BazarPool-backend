import { prisma } from '../../config/prisma.js';

export class AdminService {
  static async createPickupHub(data: {
    name: string;
    address: string;
    city: string;
    area: string;
    contactPhone: string;
  }) {
    return await prisma.pickupHub.create({
      data,
    });
  }

  static async getAllPickupHubs() {
    return await prisma.pickupHub.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { campaigns: true, pickupRecords: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getSystemStats() {
    const [
      totalUsers,
      totalCampaigns,
      totalCommitments,
      totalOrders,
      totalHubs,
      campaignsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.commitment.count(),
      prisma.order.count(),
      prisma.pickupHub.count(),
      prisma.campaign.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const totalTransactionVolume = await prisma.commitment.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ['COMMITTED', 'ALLOCATED'] } },
    });

    return {
      totalUsers,
      totalCampaigns,
      totalCommitments,
      totalOrders,
      totalHubs,
      totalVolumeProcessed: totalTransactionVolume._sum.totalAmount || 0,
      campaignsByStatus: campaignsByStatus.map((g) => ({
        status: g.status,
        count: g._count.id,
      })),
    };
  }
}
