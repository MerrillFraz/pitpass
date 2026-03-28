import { z } from 'zod';

const sessionTypeEnum = z.enum(['HOT_LAPS', 'QUALIFYING', 'HEAT_RACE', 'FEATURE']);

export const createRaceResultSchema = z.object({
  body: z.object({
    carId: z.string().cuid('Invalid Car ID format'),
    sessionType: sessionTypeEnum.optional(),
    startPosition: z.number().int().positive('Start position must be a positive integer').optional(),
    laps: z.number().int().positive('Laps must be a positive integer').optional(),
    bestLapTime: z.number().positive('Best lap time must be a positive number').optional(),
    position: z.number().int().positive('Position must be a positive integer').optional(),
    notes: z.string().optional(),
  }),
});

export const updateRaceResultSchema = z.object({
  body: z.object({
    carId: z.string().cuid('Invalid Car ID format').optional(),
    sessionType: sessionTypeEnum.optional(),
    startPosition: z.number().int().positive('Start position must be a positive integer').optional(),
    laps: z.number().int().positive('Laps must be a positive integer').optional(),
    bestLapTime: z.number().positive('Best lap time must be a positive number').optional(),
    position: z.number().int().positive('Position must be a positive integer').optional(),
    notes: z.string().optional(),
  }),
});

export type CreateRaceResultInput = z.infer<typeof createRaceResultSchema.shape.body>;
export type UpdateRaceResultInput = z.infer<typeof updateRaceResultSchema.shape.body>;
