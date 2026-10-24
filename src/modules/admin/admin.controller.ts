import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { sendResponse } from '../../utils/response.js';

export class AdminController {
  static async createHub(req: Request, res: Response, next: NextFunction) {
    try {
      const hub = await AdminService.createPickupHub(req.body);
      sendResponse(res, {
        statusCode: 201,
        message: 'Pickup Hub created successfully.',
        data: hub,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHubs(_req: Request, res: Response, next: NextFunction) {
    try {
      const hubs = await AdminService.getAllPickupHubs();
      sendResponse(res, {
        statusCode: 200,
        message: 'Pickup hubs retrieved successfully.',
        data: hubs,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getSystemStats();
      sendResponse(res, {
        statusCode: 200,
        message: 'System statistics retrieved successfully.',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
