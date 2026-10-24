import { Request, Response, NextFunction } from 'express';
import { CommitmentService } from './commitments.service.js';
import { sendResponse } from '../../utils/response.js';

export class CommitmentController {
  static async commit(req: Request, res: Response, next: NextFunction) {
    try {
      const consumerId = req.user!.id;
      const { campaignId } = req.params;
      const result = await CommitmentService.commitToCampaign(consumerId, campaignId, req.body);

      sendResponse(res, {
        statusCode: 201,
        message: result.campaignLocked
          ? 'Commitment secured! Target reached — campaign is now LOCKED and proceeding to fulfillment!'
          : 'Commitment placed successfully. Funds reserved in wallet.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCommitments(req: Request, res: Response, next: NextFunction) {
    try {
      const consumerId = req.user!.id;
      const commitments = await CommitmentService.getMyCommitments(consumerId);

      sendResponse(res, {
        statusCode: 200,
        message: 'Consumer commitments retrieved successfully.',
        data: commitments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const consumerId = req.user!.id;
      const { commitmentId } = req.params;
      const cancelled = await CommitmentService.cancelCommitment(consumerId, commitmentId);

      sendResponse(res, {
        statusCode: 200,
        message: 'Commitment cancelled successfully and funds released.',
        data: cancelled,
      });
    } catch (error) {
      next(error);
    }
  }
}
