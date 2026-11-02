import { asyncHandler } from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/respond.js';
import * as regService from './registrations.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await regService.registerForEvent(req.params.id, req.user._id);
  return created(res, result, 'Registered successfully');
});

export const cancel = asyncHandler(async (req, res) => {
  const result = await regService.cancelRegistration(req.params.id, req.user._id);
  return ok(res, result);
});

export const getMyRegistrations = asyncHandler(async (req, res) => {
  const result = await regService.getStudentRegistrations(req.user._id);
  return ok(res, result);
});

export const getEventRegistrations = asyncHandler(async (req, res) => {
  const result = await regService.getEventRegistrations(req.params.id, req.user);
  return ok(res, result);
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const { attended } = req.body;
  const result = await regService.updateAttendance(req.params.id, req.params.registrationId, attended, req.user);
  return ok(res, result, 'Attendance updated');
});

export const verifyPass = asyncHandler(async (req, res) => {
  const { ticketCode } = req.body;
  const result = await regService.verifyAndCheckInPass(req.params.id, ticketCode, req.user);
  return ok(res, result, 'Pass verified and attendance marked');
});

