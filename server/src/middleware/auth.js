import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }
    // Session Revocation & Suspension Validation
    if (decoded.v && user.tokenVersion && decoded.v !== user.tokenVersion) {
      throw ApiError.unauthorized('Session has been revoked across devices or password was changed. Please sign in again.');
    }
    if (user.accountStatus === 'suspended') {
      throw ApiError.forbidden('Your account has been suspended by the university administrator.');
    }
    if (user.accountStatus === 'deactivated') {
      throw ApiError.unauthorized('Account has been deactivated.');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (user && user.accountStatus === 'active') {
      if (!decoded.v || !user.tokenVersion || decoded.v === user.tokenVersion) {
        req.user = user;
      }
    }
  } catch {
    // Continue anonymously if token is invalid
  }
  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    // super_admin inherits administrative and organizer capabilities
    if (req.user.role === 'super_admin') {
      return next();
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Access forbidden: insufficient role permissions'));
    }
    next();
  };
};

