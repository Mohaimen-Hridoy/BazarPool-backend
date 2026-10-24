import { Response } from 'express';

export interface ApiResponsePayload<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: any[];
  error?: any;
}

export const sendResponse = <T>(
  res: Response,
  data: {
    statusCode: number;
    success?: boolean;
    message: string;
    data?: T | null;
    errors?: any[];
    error?: any;
  }
) => {
  const isSuccess = data.success !== undefined ? data.success : data.statusCode < 400;
  const payload: ApiResponsePayload<T> = {
    success: isSuccess,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data !== undefined ? data.data : null,
    errors: data.errors || [],
    ...(data.error ? { error: data.error } : {}),
  };

  return res.status(data.statusCode).json(payload);
};
