import { z } from 'zod';

export const createTripStopSchema = z.object({
  trackId: z.string().cuid('Invalid Track ID format'),
  startDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
  endDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
});

export const updateTripStopSchema = z.object({
  trackId: z.string().cuid('Invalid Track ID format').optional(),
  startDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
  endDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
});

export type CreateTripStopInput = z.infer<typeof createTripStopSchema>;
export type UpdateTripStopInput = z.infer<typeof updateTripStopSchema>;
