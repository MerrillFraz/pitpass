import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
  date: z.string().datetime('Invalid date format').transform((str) => new Date(str)),
  // tripId will be taken from req.params, not req.body for creation
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty').optional(),
  date: z.string().datetime('Invalid date format').transform((str) => new Date(str)).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
