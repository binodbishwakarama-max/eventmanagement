import { asyncHandler } from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/respond.js';
import * as eventsService from './events.service.js';

export const getEvents = asyncHandler(async (req, res) => {
  const result = await eventsService.getPublicEvents(req.query);
  return ok(res, result);
});

export const getEvent = asyncHandler(async (req, res) => {
  const result = await eventsService.getEventById(req.params.id, req.user);
  return ok(res, result);
});

export const getAdminEvents = asyncHandler(async (req, res) => {
  const result = await eventsService.getAdminEvents(req.query, req.user);
  return ok(res, result);
});

export const createEvent = asyncHandler(async (req, res) => {
  const result = await eventsService.createEvent(req.body, req.user);
  return created(res, result, 'Event created successfully');
});

export const updateEvent = asyncHandler(async (req, res) => {
  const result = await eventsService.updateEvent(req.params.id, req.body, req.user);
  return ok(res, result, 'Event updated successfully');
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventsService.deleteEvent(req.params.id, req.user);
  return ok(res, result);
});

