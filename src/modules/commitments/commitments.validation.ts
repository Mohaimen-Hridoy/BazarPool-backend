import { z } from 'zod';

export const createCommitmentSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive('Quantity must be an integer greater than 0'),
    idempotencyKey: z.string().optional(),
  }),
});
