import { z } from 'zod';

export const userListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(['student', 'organizer', 'admin']).optional(),
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25)
});
