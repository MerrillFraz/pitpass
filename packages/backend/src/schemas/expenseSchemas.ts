import { z } from 'zod';

export const createExpenseSchema = z.object({
  type: z.enum(['DIESEL', 'TOLLS', 'PIT_PASSES', 'RACE_GAS', 'REPAIRS', 'FOOD_BEVERAGE', 'OTHER']),
  amount: z.number().positive('Amount must be a positive number'),
  date: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
  // tripId will be taken from req.params, not req.body for creation
});

export const updateExpenseSchema = z.object({
  type: z.enum(['DIESEL', 'TOLLS', 'PIT_PASSES', 'RACE_GAS', 'REPAIRS', 'FOOD_BEVERAGE', 'OTHER']).optional(),
  amount: z.number().positive('Amount must be a positive number').optional(),
  date: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
