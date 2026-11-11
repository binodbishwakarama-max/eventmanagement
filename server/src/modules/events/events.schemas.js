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

export const publicEventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(50).optional(),
  venue: z.string().trim().max(160).optional(),
  organizerClub: z.string().trim().max(100).optional(),
  school: z.string().trim().max(100).optional(),
  upcoming: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  sort: z.enum(['soonest', 'latest', 'popular']).default('soonest')
}).passthrough();

export const adminEventQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(['draft', 'published', 'cancelled']).optional(),
  category: z.string().trim().max(50).optional()
}).passthrough();

