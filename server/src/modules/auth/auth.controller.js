import { asyncHandler } from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/respond.js';
import * as authService from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return created(res, result, 'Registered successfully');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return ok(res, result, 'Logged in successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  return ok(res, req.user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return ok(res, result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  return ok(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.revokeUserSessions(req.user._id);
  return ok(res, result);
});
