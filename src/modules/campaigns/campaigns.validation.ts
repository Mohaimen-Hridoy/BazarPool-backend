import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    productId: z.string().uuid('Valid product ID is required'),
    pickupHubId: z.string().uuid('Valid pickup hub ID is required'),
    title: z.string().min(3, 'Campaign title is required'),
    description: z.string().optional(),
    unitPrice: z.number().positive('Unit price must be greater than zero'),
    targetQuantity: z.number().int().positive('Target quantity must be at least 1'),
    minCommitmentQty: z.number().int().positive().optional().default(1),
    maxCommitmentQty: z.number().int().positive('Maximum commitment quantity is required'),
    deadline: z.string().datetime('Valid ISO deadline timestamp is required'),
  }),
});
