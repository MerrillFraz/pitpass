import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Trip name is required'),
    date: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
    location: z.string().min(1, 'Location is required'),
    teamId: z.string().cuid('Invalid Team ID format'), // Assuming CUID for Team ID
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Trip name is required').optional(),
    date: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
    location: z.string().min(1, 'Location is required').optional(),
    teamId: z.string().cuid('Invalid Team ID format').optional(),
  }),
});

export type CreateTripInput = z.infer<typeof createTripSchema.shape.body>;
export type UpdateTripInput = z.infer<typeof updateTripSchema.shape.body>;
