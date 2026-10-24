import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Product title is required'),
    description: z.string().min(5, 'Product description is required'),
    category: z.string().min(2, 'Category is required'),
    unit: z.string().min(1, 'Unit (e.g. kg, liter, bag) is required'),
    images: z.array(z.string().url()).optional().default([]),
  }),
});
