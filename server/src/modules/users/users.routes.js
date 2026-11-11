import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  getUsers,
  verifyUser,
  resubmitVerification,
  getMyProfile,
  updateMyProfile,
  deactivateMyAccount
} from './users.controller.js';
import { userListQuerySchema } from './users.schemas.js';

const router = Router();

const verifyUserSchema = z.object({
  status: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  role: z.enum(['student', 'faculty', 'organizer', 'admin', 'super_admin']).optional(),
  rejectionReason: z.string().trim().max(500).optional()
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  department: z.string().trim().max(100).optional(),
  rollNumber: z.string().trim().max(20).optional(),
  clubName: z.string().trim().max(100).optional()
});

const resubmitSchema = z.object({
  usn: z.string().trim().min(8).max(20),
  department: z.string().trim().max(100).optional(),
  idCardDocumentUrl: z.string().trim().max(1000).optional()
});

// Self-service account management
router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMyProfile);
router.post('/me/deactivate', authenticate, deactivateMyAccount);
router.patch('/resubmit/me', authenticate, authorize('student'), validate(resubmitSchema), resubmitVerification);

// Administrative User Management
router.get('/', authenticate, authorize('admin', 'super_admin'), validate(userListQuerySchema, 'query'), getUsers);
router.patch('/:id/verify', authenticate, authorize('admin', 'super_admin'), validate(verifyUserSchema), verifyUser);

export default router;
