import { z } from 'zod';

const setupBodyShape = {
  tripStopId: z.string().cuid().optional(),
  tireCompound: z.string().optional(),
  tireSizeFront: z.string().optional(),
  tireSizeRear: z.string().optional(),
  offset: z.number().optional(),
  springRateFront: z.number().optional(),
  springRateRear: z.number().optional(),
  rideHeightFront: z.number().optional(),
  rideHeightRear: z.number().optional(),
  shockRateFront: z.string().optional(),
  shockRateRear: z.string().optional(),
  gearRatio: z.string().optional(),
  notes: z.string().optional(),
};

export const createCarSetupSchema = z.object({
  body: z.object(setupBodyShape),
});

export const updateCarSetupSchema = z.object({
  body: z.object(setupBodyShape),
});

export type CreateCarSetupInput = z.infer<typeof createCarSetupSchema.shape.body>;
export type UpdateCarSetupInput = z.infer<typeof updateCarSetupSchema.shape.body>;
