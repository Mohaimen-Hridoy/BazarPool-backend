import { prisma } from '../../config/prisma.js';

export class NotificationService {
  static async getUserNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      const error: any = new Error('Notification not found.');
      error.statusCode = 404;
      throw error;
    }

    if (notification.userId !== userId) {
      const error: any = new Error('Unauthorized to modify this notification.');
      error.statusCode = 403;
      throw error;
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

