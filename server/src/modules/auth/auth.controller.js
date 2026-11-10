import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { created, ok } from '../../utils/respond.js';
import * as authService from './auth.service.js';

function setAuthCookie(res, token) {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  setAuthCookie(res, result.token);
  return created(res, result, 'Registered successfully');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  setAuthCookie(res, result.token);
  return ok(res, result, 'Logged in successfully');
});

export const googleAuth = asyncHandler(async (req, res) => {
  const result = await authService.googleLoginOrRegister(req.body);
  setAuthCookie(res, result.token);
  return ok(res, result, result.isNew ? 'Account created and logged in via Google SSO' : 'Logged in via Google SSO');
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
  setAuthCookie(res, result.token);
  return ok(res, result);
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.revokeUserSessions(req.user._id);
  res.clearCookie('token');
  return ok(res, result);
});
