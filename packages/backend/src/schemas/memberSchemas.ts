import { z } from 'zod';

const roleEnum = z.enum(['OWNER', 'DRIVER', 'PIT_BOSS', 'CREW', 'GUEST']);

export const addMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: roleEnum,
  }),
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: roleEnum,
  }),
});
