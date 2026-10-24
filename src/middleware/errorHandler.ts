import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response.js';
import { config } from '../config/index.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled Application Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendResponse(res, {
    statusCode,
    message,
    errors: [err.message || 'INTERNAL_SERVER_ERROR'],
    error: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};
