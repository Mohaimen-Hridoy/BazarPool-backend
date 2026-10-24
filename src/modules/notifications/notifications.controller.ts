import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notifications.service.js';
import { sendResponse } from '../../utils/response.js';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationService.getUserNotifications(req.user!.id);
      sendResponse(res, {
        statusCode: 200,
        message: 'Notifications fetched successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationService.markAsRead(req.user!.id, req.params.id);
      sendResponse(res, {
        statusCode: 200,
        message: 'Notification marked as read.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationService.markAllAsRead(req.user!.id);
      sendResponse(res, {
        statusCode: 200,
        message: 'All notifications marked as read.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
