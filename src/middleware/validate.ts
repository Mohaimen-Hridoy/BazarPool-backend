import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendResponse } from '../utils/response.js';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        sendResponse(res, {
          statusCode: 400,
          message: 'Validation failed for incoming request.',
          errors: formattedErrors,
        });
        return;
      }

      sendResponse(res, {
        statusCode: 400,
        message: 'Invalid request payload.',
        errors: [(error as Error).message],
      });
      return;
    }
  };
};
