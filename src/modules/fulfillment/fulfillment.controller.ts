import { Request, Response, NextFunction } from 'express';
import { FulfillmentService } from './fulfillment.service.js';
import { sendResponse } from '../../utils/response.js';

export class FulfillmentController {
  static async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const supplierId = req.user!.id;
      const { campaignId } = req.params;
      const campaign = await FulfillmentService.dispatchCampaign(supplierId, campaignId);

      sendResponse(res, {
        statusCode: 200,
        message: 'Campaign marked as DISPATCHED to pickup hub.',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  static async arriveAtHub(req: Request, res: Response, next: NextFunction) {
    try {
      const coordinatorId = req.user!.id;
      const { campaignId } = req.params;
      const campaign = await FulfillmentService.markArrivedAtHub(coordinatorId, campaignId);

      sendResponse(res, {
        statusCode: 200,
        message: 'Campaign marked as AT_HUB. Orders are now ready for consumer pickup.',
        data: campaign,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPickup(req: Request, res: Response, next: NextFunction) {
    try {
      const coordinatorId = req.user!.id;
      const result = await FulfillmentService.verifyPickupToken(coordinatorId, req.body);

      sendResponse(res, {
        statusCode: 200,
        message: 'Pickup verification successful. Product handed over.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
