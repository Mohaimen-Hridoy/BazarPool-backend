import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { sendResponse } from '../utils/response.js';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendResponse(res, {
      statusCode: 401,
      message: 'Authentication required. Missing or malformed authorization header.',
      errors: ['NO_TOKEN_PROVIDED'],
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 401,
      message: 'Invalid or expired authentication token.',
      errors: [error.message || 'INVALID_TOKEN'],
    });
    return;
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse(res, {
        statusCode: 401,
        message: 'Unauthorized. User authentication required.',
        errors: ['UNAUTHORIZED'],
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendResponse(res, {
        statusCode: 403,
        message: `Forbidden. You must have one of the following roles: ${roles.join(', ')}.`,
        errors: ['FORBIDDEN_ROLE'],
      });
      return;
    }

    next();
  };
};
