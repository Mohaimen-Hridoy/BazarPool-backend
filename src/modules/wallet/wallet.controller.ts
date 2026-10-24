import { Request, Response, NextFunction } from 'express';
import { WalletService } from './wallet.service.js';
import { sendResponse } from '../../utils/response.js';

export class WalletController {
  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wallet = await WalletService.getWalletDetails(userId);
      sendResponse(res, {
        statusCode: 200,
        message: 'Wallet details and ledger retrieved successfully.',
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }

  static async topUp(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;
      const wallet = await WalletService.simulateTopUp(userId, Number(amount));
      sendResponse(res, {
        statusCode: 200,
        message: 'Simulated wallet top-up successful.',
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }

  static async mfsCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { method, amount, trxId } = req.body;
      const data = await WalletService.mfsCheckout(userId, {
        method: method || 'BKASH',
        amount: Number(amount),
        trxId,
      });
      sendResponse(res, {
        statusCode: 200,
        message: `${method || 'MFS'} payment processed and wallet credited successfully.`,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
