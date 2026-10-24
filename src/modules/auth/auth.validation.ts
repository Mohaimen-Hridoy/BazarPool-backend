import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().optional(),
    role: z.enum(['CONSUMER', 'SUPPLIER', 'ADMIN', 'HUB_COORDINATOR']).optional().default('CONSUMER'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email address is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});
