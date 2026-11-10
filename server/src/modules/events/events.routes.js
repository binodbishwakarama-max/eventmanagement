import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import * as eventsController from './events.controller.js';
import { createEventSchema, updateEventSchema } from './events.schemas.js';

const router = Router();

// Admin / Organizer routes
router.get('/admin/list', authenticate, authorize('admin', 'organizer'), eventsController.getAdminEvents);
router.post('/', authenticate, authorize('admin', 'organizer'), validate(createEventSchema), eventsController.createEvent);
router.put('/:id', authenticate, authorize('admin', 'organizer'), validate(updateEventSchema), eventsController.updateEvent);
router.delete('/:id', authenticate, authorize('admin', 'organizer'), eventsController.deleteEvent);

// Public routes
router.get('/', eventsController.getEvents);
router.get('/:id', optionalAuthenticate, eventsController.getEvent);

export default router;

