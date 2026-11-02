# Current implementation summary

This note describes the code currently in this repository. The supplied **College Event Management System Build Playbook.pdf** remains the baseline for the original architecture and business rules. See [playbook traceability](./PLAYBOOK_TRACEABILITY.md) for what is implemented and adapted.

## Product boundary

Campus Events is an independent DSU-context demo, not an official Dayananda Sagar University service. The university name is used as context only. No official identity, events, venues, eligibility policies, email domain, or login provider are claimed. Seed accounts, events, registrations, attendance, ticket codes, and analytics are fictional local demo data.

## Architecture

- **Client:** React 18, Vite, React Router, Tailwind CSS, Axios, and Lucide.
- **API:** Node.js, Express, Mongoose, MongoDB, Zod, JWT, and bcryptjs.
- **Tests:** Vitest service tests with mocked Mongoose model methods; no MongoDB-backed integration test is currently configured.
- **Persistence:** MongoDB. Configure `MONGODB_URI` in `server/.env`; there is no offline registration mode.
- **Authentication:** bearer JWT stored in browser `localStorage`, retained from the playbook for this demo. Production token handling needs a separate security review.

## Roles and behavior

- **Guest:** browse published events and open public event details.
- **Student:** register for published events before their start, cancel before start, and view their registration history.
- **Organizer:** create and manage owned events, view owned-event registrations, and record attendance after event start.
- **Administrator:** manage all events, view limited account profiles, and access platform-level demo analytics.

Public registration always creates a student-role account; it does not verify university identity. Organizer attendance and administrator read-only account oversight are product-request extensions to the playbook. Attendance check-in is available after the event starts; demo UI records a check-in once. A ticket code is a demo identifier, not an entry credential or credential of attendance.

## Business-rule implementation

- Registration uses a conditional atomic capacity reservation and a unique `(event, student)` index. Service tests simulate duplicate attempts and a capacity-one race.
- Cancellation is allowed before event start and uses a conditional state transition before decrementing the event count.
- Re-registration reuses the unique registration record and clears prior attendance.
- Event capacity cannot be lowered below active registrations; events with registration history cannot be deleted.
- Attendance is scoped to an administrator or owning organizer and is accepted only after event start for an active registration. Duplicate check-ins are rejected.
- Discovery and management API behavior, response envelopes, and endpoint paths are documented in [API reference](./API.md).

## Configuration and local demo

Copy `server/.env.example` and `client/.env.example` to their `.env` counterparts, configure MongoDB and a unique JWT secret, and use the root commands in [README](../README.md). The seed script is restricted to local MongoDB. Never run its reset option against data that must be retained.

## Institutional confirmations

Before any real deployment, DSU authorization, approved product name and assets, identity and eligibility rules, event review and cancellation rules, venue data, privacy/retention, timezone, operational ownership, and production security requirements must be confirmed. See [DSU requirements](./DSU_REQUIREMENTS.md), [limitations](./LIMITATIONS.md), and [deployment guidance](./DEPLOY.md).
