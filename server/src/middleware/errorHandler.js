import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  const errors = err.errors || [];

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid identifier: ${err.value}`;
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Resource already exists with given unique key';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    logger.error(`Server Error: ${message}`, {
      statusCode,
      method: req.method,
      path: req.path,
      stack: err.stack
    });
  } else {
    logger.warn(`Client Request Error: ${message}`, {
      statusCode,
      method: req.method,
      path: req.path
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    code: err.code || `HTTP_${statusCode}`,
    ...(errors.length > 0 ? { errors } : {})
  });
}
