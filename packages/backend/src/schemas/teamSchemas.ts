import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Team name is required'),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Team name is required').optional(),
  }),
});
