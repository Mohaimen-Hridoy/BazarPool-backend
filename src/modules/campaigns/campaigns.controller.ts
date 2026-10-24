import { Request, Response, NextFunction } from 'express';
import { CampaignService } from './campaigns.service.js';
import { sendResponse } from '../../utils/response.js';
import { CampaignStatus } from '@prisma/client';

export class CampaignController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const supplierId = req.user!.id;
      const campaign = await CampaignService.createCampaign(supplierId, req.body);
      sendResponse(res, {
        statusCode: 201,
        message: 'Group-buying wholesale campaign launched successfully.',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, category, city, supplierId } = req.query as {
        status?: CampaignStatus;
        category?: string;
        city?: string;
        supplierId?: string;
      };

      const campaigns = await CampaignService.getAllCampaigns({
        status,
        category,
        city,
        supplierId,
      });

      sendResponse(res, {
        statusCode: 200,
        message: 'Campaigns retrieved successfully.',
        data: campaigns,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const campaign = await CampaignService.getCampaignById(id);
      sendResponse(res, {
        statusCode: 200,
        message: 'Campaign details retrieved successfully.',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }
}
