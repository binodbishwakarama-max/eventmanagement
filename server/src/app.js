import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { checkDatabaseHealth } from './config/db.js';
import { sanitize } from './middleware/sanitize.js';
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
import venuesRoutes from './modules/venues/venues.routes.js';
import clubsRoutes from './modules/clubs/clubs.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Trust reverse proxy (Nginx, AWS ALB, Render, Cloudflare) when configured
if (env.TRUST_PROXY || env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Production Gzip & Deflate Compression
app.use(compression());

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
const configuredOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''));
const corsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;
  const reqHost = req.headers.host;
  const reqOrigin = origin ? origin.replace(/\/$/, '') : origin;

  const baseCorsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id']
  };

  // 1. Static assets and non-API requests never fail CORS
  if (!req.path.startsWith('/api')) {
    return callback(null, { origin: true });
  }

  // 2. Allow if origin matches current host (monolith same-host request)
  if (reqHost && reqOrigin && reqOrigin.includes(reqHost)) {
    return callback(null, { ...baseCorsOptions, origin: true });
  }

  // 3. Allow if origin is onrender.com or render.com (Render cloud deployments)
  if (reqOrigin && (reqOrigin.includes('.onrender.com') || reqOrigin.includes('.render.com'))) {
    return callback(null, { ...baseCorsOptions, origin: true });
  }

  // 4. Allow requests with no origin (mobile apps, server-to-server, curl)
  if (!origin) {
    return callback(null, { ...baseCorsOptions, origin: true });
  }

  // 5. Configured origins or local dev
  if (
    configuredOrigins.includes(reqOrigin) ||
    configuredOrigins.includes('*') ||
    (env.NODE_ENV !== 'production' && (reqOrigin.includes('localhost') || reqOrigin.includes('127.0.0.1')))
  ) {
    return callback(null, { ...baseCorsOptions, origin: true });
  }

  callback(new ApiError(403, `CORS policy violation: Origin '${origin}' is not authorized.`));
};

app.use(cors(corsOptionsDelegate));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.cloudinary.com', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", 'https://*', 'http://localhost:*'],
        upgradeInsecureRequests: null
      }
    }
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '20kb' }));
app.use(sanitize);

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

// Priority 4: High-Concurrency Tiered Production Rate Limiters (1000+ Concurrent Requests Scale)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Accommodate classroom / computer lab cohort batch logins
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' }
});

const registrationWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests/min per student/client to handle campus Wi-Fi shared IP gracefully
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.headers['authorization'] || req.ip,
  skip: (req) => req.method === 'OPTIONS' || env.NODE_ENV === 'test',
  message: { success: false, message: 'High registration frequency detected. Please wait a moment before trying again.' }
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 poster uploads per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload rate limit reached. Please wait before uploading more posters.' }
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

// High-Concurrency API rate limiter for production (20,000 requests per 15 min - handles 1000+ concurrent users)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.NODE_ENV === 'test' || req.path.startsWith('/health'),
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Mount module routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events/:id/register', registrationWriteLimiter);
app.use('/api/events', eventsRoutes);
app.use('/api', registrationsRoutes);
app.use('/api/venues', venuesRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.get('/api/admin/stats', authenticate, authorize('admin', 'organizer'), getStats);
app.use('/api/admin/users', usersRoutes);
app.use('/api/users', usersRoutes);

// Production Single-Port Deployment: Serve React client build if dist directory exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(
    express.static(clientDistPath, {
      maxAge: '1h',
      setHeaders: (res, assetPath) => {
        if (assetPath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (
          assetPath.endsWith('.jpg') ||
          assetPath.endsWith('.png') ||
          assetPath.endsWith('.webp') ||
          assetPath.endsWith('.woff2')
        ) {
          res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        }
      }
    })
  );
  // SPA fallback for frontend client routing (non-API / non-uploads)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 handler for unmatched API requests
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Central error handler
app.use(errorHandler);
