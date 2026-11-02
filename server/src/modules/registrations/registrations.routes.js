import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as regController from './registrations.controller.js';

const router = Router();
const attendanceSchema = z.object({ attended: z.boolean() });
const verifyPassSchema = z.object({ ticketCode: z.string().trim().min(4).max(64) });

// Student self registrations
router.post('/events/:id/register', authenticate, authorize('student'), regController.register);
router.delete('/events/:id/register', authenticate, authorize('student'), regController.cancel);
router.get('/registrations/me', authenticate, authorize('student'), regController.getMyRegistrations);

// Admin & Organizer attendance and list
router.get('/events/:id/registrations', authenticate, authorize('admin', 'organizer'), regController.getEventRegistrations);
router.patch(
  '/events/:id/registrations/:registrationId/attendance',
  authenticate,
  authorize('admin', 'organizer'),
  validate(attendanceSchema),
  regController.updateAttendance
);
router.post(
  '/events/:id/verify-pass',
  authenticate,
  authorize('admin', 'organizer'),
  validate(verifyPassSchema),
  regController.verifyPass
);

export default router;
