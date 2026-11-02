import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getUsers, verifyUser, resubmitVerification } from './users.controller.js';
import { userListQuerySchema } from './users.schemas.js';

const router = Router();

const verifyUserSchema = z.object({
  status: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  role: z.enum(['student', 'organizer', 'admin']).optional(),
  rejectionReason: z.string().trim().max(500).optional()
});

const resubmitSchema = z.object({
  usn: z.string().trim().min(8).max(20),
  department: z.string().trim().max(100).optional(),
  idCardDocumentUrl: z.string().trim().max(1000).optional()
});

router.get('/', authenticate, authorize('admin'), validate(userListQuerySchema, 'query'), getUsers);
router.patch('/:id/verify', authenticate, authorize('admin'), validate(verifyUserSchema), verifyUser);
router.patch('/resubmit/me', authenticate, authorize('student'), validate(resubmitSchema), resubmitVerification);

export default router;
