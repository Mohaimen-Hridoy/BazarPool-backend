import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { sendResponse } from '../../utils/response.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      sendResponse(res, {
        statusCode: 201,
        message: 'User registered successfully and wallet initialized.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      sendResponse(res, {
        statusCode: 200,
        message: 'Logged in successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getMe(userId);
      sendResponse(res, {
        statusCode: 200,
        message: 'User profile retrieved successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
