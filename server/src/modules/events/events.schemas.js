import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other']),
  venue: z.string().trim().min(2).max(160),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  capacity: z.coerce.number().int().min(1).max(10000),
  organizerClub: z.string().trim().max(100).optional(),
  posterUrl: z.string().trim().max(1000).optional()
}).refine((data) => data.endsAt > data.startsAt, {
  message: 'endsAt must be after startsAt',
  path: ['endsAt']
});

export const updateEventSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  category: z.enum(['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other']).optional(),
  venue: z.string().trim().min(2).max(160).optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  capacity: z.coerce.number().int().min(1).max(10000).optional(),
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
  organizerClub: z.string().trim().max(100).optional(),
  posterUrl: z.string().trim().max(1000).optional()
});
