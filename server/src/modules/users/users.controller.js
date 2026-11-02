import { asyncHandler } from '../../utils/asyncHandler.js';
import { ok } from '../../utils/respond.js';
import * as usersService from './users.service.js';

export const getUsers = asyncHandler(async (req, res) => {
  const result = await usersService.listUsers(req.validatedQuery || req.query);
  return ok(res, result);
});

export const verifyUser = asyncHandler(async (req, res) => {
  const result = await usersService.updateUserVerification(req.params.id, req.body, req.user);
  return ok(res, result, 'User verification updated');
});

export const resubmitVerification = asyncHandler(async (req, res) => {
  const result = await usersService.resubmitStudentVerification(req.user._id, req.body);
  return ok(res, result, 'Verification details resubmitted for admin review');
});
