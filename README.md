# Dayananda Sagar University (DSU) — Campus Event Management Platform

A production-grade, full-stack campus event management and digital admission system built for **Dayananda Sagar University (DSU)**. Serves university departments, student clubs (IEEE, ACM, GDSC), administrative desks, and students across the Harohalli Main Campus and Kudlu Gate Innovation Campus.

---

## Architecture Overview

```
                                      ┌────────────────────────────────────────┐
                                      │   Client: React 18 + Vite + Tailwind   │
                                      │  Code-Split Dynamic Routes + UI Tokens │
                                      └──────────────────┬─────────────────────┘
                                                         │ (HTTPS / REST API)
                                                         ▼
                                      ┌────────────────────────────────────────┐
                                      │   Server: Node.js + Express (ESM)      │
                                      │  RBAC Auth, Rate Limiter, Helmet, CORS │
                                      └──────────────────┬─────────────────────┘
                                                         │
                                ┌────────────────────────┼────────────────────────┐
                                ▼                        ▼                        ▼
                     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
                     │ MongoDB Mongoose │     │ Redacted Logger  │     │ Email / Ticket   │
                     │  Atomic Quotas   │     │ Structured Audit │     │ QR Cryptographic │
                     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

- **Frontend (`client/`)**: React 18, Vite, React Router 6, Tailwind CSS, Zod schema validation, accessible design tokens & primitives (`<Button>`, `<Input>`, `<Select>`, `<Card>`, `<Modal>`, `<Skeleton>`, `<EmptyState>`, `<ErrorState>`).
- **Backend (`server/`)**: Express REST API, Mongoose 8 (MongoDB), JWT authentication with token invalidation, bcrypt password hashing (work factor 12), Helmet HTTP security headers, CORS origin verification, express-rate-limit.
- **Security & Integrity**: 
  - Institutional USN validation matching DSU format (`^1DS\d{2}[A-Z]{2,3}\d{3}$`).
  - Academic identity review queue: self-submitted student accounts undergo administrative verification before granting active pass issuance.
  - Cryptographically hashed QR admission passes with single-use check-in enforcement (Rule R9 prevents duplicate entry).
  - Atomic MongoDB capacity counters and quota protection (Rules R6 & R7: prevent capacity reductions below registered count and prevent deletion of active events).
  - Automated structured logger redacting sensitive credentials and tokens in production.

---

## Quick Setup (Under 5 Commands)

```bash
# 1. Clone & install dependencies
git clone https://github.com/dsu-dev/campus-events.git && cd campus-events && npm install

# 2. Configure environment variables
cp server/.env.example server/.env && cp client/.env.example client/.env

# 3. Provision administrative credentials & seed baseline campus data
npm run seed

# 4. Run full test suite & typecheck
npm test && npm run typecheck

# 5. Launch development services (client on :5173, server on :5001)
npm run dev
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | API server listen port | `5001` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/dsu_events` |
| `JWT_SECRET` | 256-bit cryptographic key for session tokens | `64-char hex string` |
| `JWT_EXPIRES_IN` | Token lifespan | `1d` |
| `CLIENT_ORIGIN` | Allowed web origin for CORS | `http://localhost:5173` |
| `ADMIN_EMAIL` | Official administrator email address | `admin@dsu.edu.in` |
| `ADMIN_PASSWORD` | Administrator initial password (min 12 chars) | `DSUAdmin2026!` |
| `ALLOWED_EMAIL_DOMAINS` | Permitted institutional student email domains | `dsu.edu.in,example.test` |
| `EMAIL_PROVIDER` | Transactional email provider (`mock`, `smtp`, `sendgrid`)| `mock` |
| `STORAGE_PROVIDER` | Poster/file storage provider (`local`, `cloudinary`, `s3`) | `local` |

### Client (`client/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base API route endpoint | `/api` |
| `VITE_DEMO_MODE` | Institutional operation mode (`false` for live university) | `false` |

---

## Scripts Reference

```bash
# Development & Build
npm run dev             # Concurrently runs backend (:5001) and frontend (:5173)
npm run build           # Production bundle with code-split chunks (Vite)
npm run start           # Production server start

# Quality, Linting & Typecheck
npm run typecheck       # TypeScript strict compiler check across repository
npm run lint            # ESLint flat config audit
npm run lint:fix        # ESLint automatic fixer
npm run format:check    # Prettier formatting verification
npm run format          # Prettier code formatting

# Automated Testing
npm test                # Executes full unit test suite (server + client)
npm run test:concurrency # Stress-tests atomic concurrency on event quotas
npm run test:load       # High-volume API load simulation
npm run test:uat        # User acceptance verification script

# Database & Administration
npm run provision-admin # Securely creates root university admin account
npm run seed            # Seeds baseline clubs, verified venues, and symposiums
npm run backup          # Generates cryptographic database snapshot
npm run restore         # Validates and restores database from backup snapshot
```

---

## Key University Features

1. **Campus Event Catalog**: Real-time faceted search by category, date range, and venue across the 130-acre Harohalli Main Campus.
2. **Student Passbook**: Live admission voucher display with QR code, offline caching, and instant calendar export (Apple iCal / Outlook .ics / Google Calendar).
3. **Operations Console**: Organizer event authoring, seat quota controls, and attendance check-in desk.
4. **Administrative Review Desk**: Student ID (USN) approval queue with audit trail, unpublishing controls, and attendance CSV export.
5. **Gate Entry Desk**: Camera-enabled QR barcode scanning and instant audio feedback (positive chime / warning buzzer).

---

## Institutional Contacts

- **Dayananda Sagar University — Harohalli Main Campus**: Kanakapura Road, Bengaluru South - 562112
- **Office of Student Affairs & Campus Life**: events@dsu.edu.in
