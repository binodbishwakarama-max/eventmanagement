# Deployment and Production Operations Guide

This guide details the production architecture, Docker deployment, configuration, and security operations for the **DSU Campus Events Platform**.

---

## 1. Production Architecture Overview

The platform supports two deployment topologies:

### Topology A: Monolithic Single-Port Deployment (Recommended for Docker / Containers)
```
[ Reverse Proxy / Ingress (Caddy / Nginx / Cloudflare) ]
                       │ (TLS Termination)
                       ▼ Port 5001
            [ Node.js Express App ]
             ├── /api/*          ──> REST API Endpoints & Auth Gate
             ├── /uploads/*      ──> Static File Serving (Avatars / Posters)
             └── /*              ──> Serves Vite SPA from client/dist (SPA Fallback)
                       │
                       ▼ Port 27017
            [ MongoDB Database (Atlas or Container) ]
```

### Topology B: Decoupled Multi-Host Deployment
- **Frontend SPA**: Hosted on Cloudflare Pages, Vercel, or Netlify from `client/dist`.
- **Backend API**: Hosted on AWS ECS, Render, Railway, or VPS.
- **Database**: MongoDB Atlas M10+ replica set.
- Set `CLIENT_ORIGIN=https://events.dsu.edu.in` and `VITE_API_URL=https://api.events.dsu.edu.in/api`.

---

## 2. Quickstart with Docker Compose

A complete production multi-stage `Dockerfile` and `docker-compose.yml` are included in the repository.

### Step 1: Clone and Configure Environment
```bash
git clone <repo-url> eventmanagement
cd eventmanagement

# Generate a strong 32+ character JWT secret
openssl rand -hex 32
```

Configure your environment variables in `.env` (or pass via secrets manager):
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://mongo:27017/dsu_events
ALLOW_LOCAL_FALLBACK=false
DEMO_MODE=false
TRUST_PROXY=true
ALLOWED_EMAIL_DOMAINS=dsu.edu.in
JWT_SECRET=<your-generated-jwt-secret>
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@dsu.edu.in
ADMIN_PASSWORD=<StrongAdminPassword123!>
STORAGE_PROVIDER=local
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@dsu.edu.in
SMTP_PASS=<app-specific-password>
SMTP_FROM=DSU Campus Events <no-reply@dsu.edu.in>
```

### Step 2: Build and Run Container Stack
```bash
docker compose up -d --build
```

### Step 3: Verify Health Checks
```bash
# Check container status
docker compose ps

# Test live probe
curl -f http://localhost:5001/api/health/live

# Test database ready probe
curl -f http://localhost:5001/api/health/ready
```

---

## 3. Production Environment Variables Reference

| Variable | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | `string` | `development` | Set to `production` in production. Disables memory-server fallbacks. |
| `PORT` | `number` | `5001` | Port on which the HTTP server listens. |
| `MONGODB_URI` | `string` | — | Connection string to MongoDB (supports Atlas `mongodb+srv://`). |
| `DEMO_MODE` | `boolean` | `false` | When `false`, removes test-prefill buttons and demo disclaimers. |
| `ALLOW_LOCAL_FALLBACK` | `boolean` | `false` | Strictly rejected in production to prevent split-brain state. |
| `TRUST_PROXY` | `boolean` | `true` | Set to `true` when behind Nginx, Caddy, Cloudflare, or AWS ALB. |
| `ALLOWED_EMAIL_DOMAINS` | `string` | `dsu.edu.in` | Restricts student/faculty registrations to university emails. |
| `JWT_SECRET` | `string` | — | Min 32 characters; cryptographic signing key for tokens. |
| `JWT_EXPIRES_IN` | `string` | `1d` | Token lifetime (e.g., `1d`, `7d`, `12h`). |
| `CLIENT_ORIGIN` | `string` | `*` | Comma-separated CORS allowed origins. |
| `ADMIN_EMAIL` | `string` | — | Initial administrator login email. |
| `ADMIN_PASSWORD` | `string` | — | Administrator password (minimum 12 characters in production). |
| `STORAGE_PROVIDER` | `string` | `local` | `local` (filesystem) or `cloudinary`. |
| `EMAIL_PROVIDER` | `string` | `mock` | `smtp` (Nodemailer), `sendgrid`, or `mock` (console). |

---

## 4. Production Security Hardening Included

1. **Dual-Mode Authentication:**
   - Both HTTP-only, secure, `SameSite=lax` cookies and `Authorization: Bearer <token>` headers are supported.
   - Prevents script-based token theft via XSS while supporting mobile/CLI API clients.
2. **Tiered Rate Limiting:**
   - Auth endpoints: Max 100 requests / 15 minutes (`/api/auth/*`).
   - Registration writes: Max 30 writes / minute per IP (`/api/events/:id/register`).
   - General API: Max 1000 requests / 15 minutes across `/api/*`.
3. **Database Concurrency & Write Guard:**
   - Atomic check-in scanning using MongoDB `findOneAndUpdate({ _id, attended: false, status: 'registered' })`.
   - Atomic event registration reservation preventing overselling past maximum capacity under concurrent surges.
   - Database write gatekeeper rejects mutating operations (`POST`, `PUT`, `DELETE`) with HTTP 503 if the database is disconnected.
4. **Helmet CSP & CORS:**
   - Content Security Policy configured for Google Fonts, Cloudinary CDN, Unsplash posters, and local APIs.
   - Clean origin normalization stripping trailing slashes.

---

## 5. Verification & Testing Commands

Run the full automated test and stress verification suites before deploying:

```bash
# 1. Run all server unit & integration test suites
npm test

# 2. Concurrency stress test (500 simultaneous registrations on 50 seats)
npm run test:concurrency

# 3. Sustained throughput load test
npm run test:load

# 4. Production client bundle compilation
npm run build
```

---

## 6. Database Maintenance & Backups

```bash
# Automated database snapshot
npm run backup

# Database restore from snapshot
npm run restore -- --file=backups/dsu_events_<timestamp>.json
```
