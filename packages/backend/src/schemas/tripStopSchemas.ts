import { z } from 'zod';

export const createTripStopSchema = z.object({
  trackId: z.string().cuid('Invalid Track ID format'),
  startDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
  endDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
}).refine(data => data.startDate <= data.endDate, {
  message: 'Start date cannot be after end date',
  path: ['startDate'],
});

export const updateTripStopSchema = z.object({
  trackId: z.string().cuid('Invalid Track ID format').optional(),
  startDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
  endDate: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true; // No validation if one of the dates is missing
}, {
  message: 'Start date cannot be after end date',
  path: ['startDate'],
});

export type CreateTripStopInput = z.infer<typeof createTripStopSchema>;
export type UpdateTripStopInput = z.infer<typeof updateTripStopSchema>;
