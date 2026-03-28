import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Type is required'),
    date: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
    notes: z.string().optional(),
    lapInterval: z.number().int().positive().optional(),
  }),
});

export const updateMaintenanceSchema = z.object({
  body: z.object({
    type: z.string().min(1, 'Type is required').optional(),
    date: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
    notes: z.string().optional(),
    lapInterval: z.number().int().positive().optional(),
  }),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema.shape.body>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema.shape.body>;
