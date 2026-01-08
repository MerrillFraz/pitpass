import { z } from 'zod';

export const createRaceResultSchema = z.object({
  carId: z.string().cuid('Invalid Car ID format'),
  laps: z.number().int().positive('Laps must be a positive integer').optional(),
  bestLapTime: z.number().positive('Best lap time must be a positive number').optional(),
  position: z.number().int().positive('Position must be a positive integer').optional(),
  notes: z.string().optional(),
});

export const updateRaceResultSchema = z.object({
  carId: z.string().cuid('Invalid Car ID format').optional(),
  laps: z.number().int().positive('Laps must be a positive integer').optional(),
  bestLapTime: z.number().positive('Best lap time must be a positive number').optional(),
  position: z.number().int().positive('Position must be a positive integer').optional(),
  notes: z.string().optional(),
});

export type CreateRaceResultInput = z.infer<typeof createRaceResultSchema>;
export type UpdateRaceResultInput = z.infer<typeof updateRaceResultSchema>;
