import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const createCarSchema = z.object({
  body: z.object({
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().int().min(1900).max(currentYear + 1),
    color: z.string().optional(),
    vin: z.string().optional(),
  }),
});

export const updateCarSchema = z.object({
  body: z.object({
    make: z.string().min(1, 'Make is required').optional(),
    model: z.string().min(1, 'Model is required').optional(),
    year: z.number().int().min(1900).max(currentYear + 1).optional(),
    color: z.string().optional(),
    vin: z.string().optional(),
  }),
});

export type CreateCarInput = z.infer<typeof createCarSchema.shape.body>;
export type UpdateCarInput = z.infer<typeof updateCarSchema.shape.body>;
