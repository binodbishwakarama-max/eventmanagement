import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { checkDatabaseHealth } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import { ok } from './utils/respond.js';

import authRoutes from './modules/auth/auth.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import registrationsRoutes from './modules/registrations/registrations.routes.js';
import { getStats } from './modules/stats/stats.controller.js';
import { authenticate, authorize } from './middleware/auth.js';
import usersRoutes from './modules/users/users.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Priority 7: Request Correlation ID Middleware
app.use((req, res, next) => {
  const correlationId =
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (env.NODE_ENV !== 'test') {
      const logEntry = {
        time: new Date().toISOString(),
        correlationId,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: duration,
        ip: req.ip
      };
      if (res.statusCode >= 500) {
        console.error('[HTTP 5XX]', JSON.stringify(logEntry));
      } else if (res.statusCode >= 400) {
        console.warn('[HTTP 4XX]', JSON.stringify(logEntry));
      }
    }
  });
  next();
});

// Priority 4: Production CORS Whitelist Enforcement
const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new ApiError(403, `CORS policy violation: Origin '${origin}' is not authorized.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id']
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(express.json({ limit: '100kb' }));

// Priority 1: Database Write Gatekeeper Middleware
// Never allow writes if the authoritative database is disconnected
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (req.path.startsWith('/api/health')) return next();
    if (mongoose.connection.readyState !== 1) {
      res.setHeader('Retry-After', '5');
      return next(
        new ApiError(
          503,
          'Authoritative database is temporarily unavailable. Mutating operation blocked to prevent data loss. Please retry shortly.'
        )
      );
    }
  }
  next();
});

// Static serving for uploaded event posters
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '../uploads'), {
    maxAge: '7d',
    immutable: true
  })
);

// Priority 4: Tiered Production Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' }
});

const registrationWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 registrations per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'High registration frequency detected. Please wait a moment before trying again.' }
});

// Priority 7: Observability & Production Health Probes
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const memory = process.memoryUsage();
  const payload = {
    status: dbHealth.status === 'healthy' ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbHealth,
    memory: {
      rssMb: Math.round(memory.rss / 1024 / 1024),
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024)
    }
  };
  return ok(res, payload);
});

app.get('/api/health/live', (req, res) => {
  return res.status(200).json({ status: 'live' });
});

app.get('/api/health/ready', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.connected) {
    return res.status(200).json({ status: 'ready', db: dbHealth });
  }
  return res.status(503).json({ status: 'not_ready', db: dbHealth });
});

// Mount module routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events/:id/register', registrationWriteLimiter);
app.use('/api/events', eventsRoutes);
app.use('/api', registrationsRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/api/admin/stats', authenticate, authorize('admin', 'organizer'), getStats);
app.use('/api/admin/users', usersRoutes);

// 404 handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Central error handler
app.use(errorHandler);
