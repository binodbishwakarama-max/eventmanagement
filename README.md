# Campus Events — DSU-context demo

An independent campus event-management concept using Dayananda Sagar University (DSU) as context. It is not an official DSU service. All seeded accounts, events, attendance and analytics are fictional local demo data.

## What is included

- Event discovery with title search, category and date filters, sorting, pagination, responsive event cards and shareable filter URLs.
- Event detail and registration flows, student registration history, cancellation before an event starts, and sample ticket codes.
- Organizer-owned event management, registration rosters and attendance marking after an event starts.
- Administrator event and account oversight, plus organizer-scoped and platform-level demo analytics.
- Express API validation, JWT authentication, bcrypt password hashing, server-side role checks and atomic event-capacity updates.

## Architecture

- Client: React 18, Vite, React Router, Tailwind CSS, Axios and Lucide.
- Server: Node.js, Express, Mongoose, MongoDB, Zod, JWT and bcryptjs.
- Persistence: MongoDB. The student, organizer and administrator screens use the API; the application does not provide an offline/localStorage registration mode.
- Authentication: one-day bearer JWT stored in browser `localStorage`, matching the playbook. This is a demo trade-off, not a production security recommendation.

## Prerequisites

- Node.js 20 or newer and npm.
- MongoDB running locally, or a MongoDB Atlas database.

## Install and configure (PowerShell, from the project root)

```powershell
if (-not (Test-Path server\.env)) { Copy-Item server\.env.example server\.env }
if (-not (Test-Path client\.env)) { Copy-Item client\.env.example client\.env }
npm install
```

Edit `server\.env` before starting the API:

- Set `MONGODB_URI` to your local or Atlas database.
- Replace `JWT_SECRET` with a random value of at least 32 characters.
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for a local demo administrator.
- Keep `CLIENT_ORIGIN=http://localhost:5173` for the default development URL.

`client\.env` defaults to `VITE_API_URL=http://localhost:5000/api`.

## Seed and run

Start MongoDB, then from the repository root:

```powershell
npm run seed
npm run provision-admin
npm run dev
```

Open the client at **http://localhost:5173**. The API is at **http://localhost:5000/api** and its health endpoint is **http://localhost:5000/api/health**.

The seed creates one administrator using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`, one fictional organizer, six fictional students, ten fictional events, and sample attendance. Use `npm run seed -w server -- --reset` only against a local, non-production MongoDB; the seed script refuses `--reset` for non-local or production databases.

### Local demo accounts

- Administrator: values configured in `server/.env` (the checked-in example uses `admin@example.test` / `DemoAdminOnly123`).
- Organizer: `organizer@example.test` / `Organizer@123`.
- Students: `student1@example.test` through `student6@example.test` / `Student@123`.

These are fictional, local-only credentials. Change the administrator password before seeding if needed. Do not reuse these credentials or demo records in a real deployment.

## Commands

Run these from the project root:

```powershell
npm install
npm run dev
npm run build
npm test
npm run seed
```

`npm run build` builds the React client into `client/dist`. `npm test` runs server service-level unit tests. Those tests mock Mongoose models; they do not prove behavior against a running MongoDB server or under real database concurrency. The repository has no lint script.

`npm run provision-admin` creates only the configured administrator and is intended for a trusted production provisioning step; it requires an `ADMIN_PASSWORD` of at least 12 characters. Unlike the local `seed` command, it does not create fictional sample data.

## Documentation

- [DSU requirements and verified sources](docs/DSU_REQUIREMENTS.md)
- [Playbook traceability](docs/PLAYBOOK_TRACEABILITY.md)
- [Current implementation summary](docs/SPEC.md)
- [Demo presentation guide](docs/VIVA_PRESENTATION_GUIDE.md)
- [API reference](docs/API.md)
- [Data model](docs/DATA_MODEL.md)
- [Local demo script](docs/DEMO.md)
- [Deployment guidance](docs/DEPLOY.md)
- [Limitations and institutional confirmations](docs/LIMITATIONS.md)
- [Security notes](security.md)

## Troubleshooting

- **API exits before it starts:** check that `server/.env` exists, `JWT_SECRET` is at least 32 characters, and MongoDB is reachable at `MONGODB_URI`.
- **Client reports a network error:** confirm both workspaces are running and `VITE_API_URL` points to the API's `/api` base URL.
- **Demo sign-in fails:** run `npm run seed` against the same MongoDB URI used by the API. Confirm the administrator password against your local `server/.env`; organizer and student accounts are created by the seed.
- **A seeded dataset looks stale:** use the reset command only with a disposable local database. It deletes all data in that database.

## Production boundary

This repository is a working demo, not a production-ready DSU platform. Before any real use, confirm DSU authorization, official identity and design requirements, account provisioning and eligibility rules, event policies and locations, privacy and retention requirements, and hosting/security controls. See [docs/LIMITATIONS.md](docs/LIMITATIONS.md) and [docs/DEPLOY.md](docs/DEPLOY.md).
