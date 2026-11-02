# Playbook traceability

The baseline is the supplied 15-page **College Event Management System Build Playbook.pdf**. This document maps its main requirements to the current implementation.

- **MERN foundation and environment** — root npm workspaces; `client/`; `server/`; `.env.example` files; `server/src/app.js`; `server/src/config/`.
- **Authentication and roles** — `server/src/modules/auth/`; `server/src/middleware/auth.js`; client `AuthContext`; route guards in `client/src/App.jsx`. Public signup only creates students. JWT is stored in localStorage as specified by the playbook.
- **Event discovery and details** — `server/src/modules/events/`; `client/src/pages/EventsPage.jsx`; `client/src/pages/EventDetailPage.jsx`. Discovery supports search, category/date filters, sorting, pagination, and published-only visibility.
- **Atomic capacity, duplicate protection and cancellation** — `server/src/modules/registrations/registrations.service.js`; unique `(event, student)` index in `server/src/models/Registration.js`; `server/tests/registrations.service.test.js`.
- **Student registration history** — `GET /api/registrations/me`; `client/src/pages/StudentDashboard.jsx`.
- **Organizer and administrator management** — event ownership checks in `server/src/modules/events/events.service.js` and `server/src/modules/registrations/registrations.service.js`; `client/src/pages/AdminDashboard.jsx`; read-only admin user listing in `server/src/modules/users/`.
- **Attendance** — attendance routes and conditional update in `server/src/modules/registrations/`; `client/src/pages/AttendancePage.jsx`. Check-in is permitted only after the event starts and active duplicates are rejected.
- **Analytics** — `server/src/modules/stats/stats.controller.js`; administrator and organizer views are scoped by event ownership. Seed analytics are visibly demo data.
- **Accessibility and responsive UI** — semantic labels, focus-visible styling, reduced-motion support, mobile navigation, responsive event cards and scrollable admin tables in the client. A formal keyboard, screen-reader, contrast or Lighthouse audit has not been run.
- **No WebSockets** — clients fetch on page load and refetch after mutations, as the playbook requires.
- **API, data and demo documentation** — `docs/API.md`, `docs/DATA_MODEL.md`, `docs/DEMO.md`, `docs/LIMITATIONS.md` and `docs/DEPLOY.md`.

## Intentional adaptations and limits

- The product request includes organizers; organizer event ownership and attendance are added beyond the playbook's administrator-only role.
- The product request includes account oversight; a read-only administrator endpoint returns limited profile fields.
- Seed entries are fictional `DEMO:` events with generic venues, not real DSU activities or locations.
- A one-way Google Calendar compose link exists on the event detail view; there is no built-in calendar view or calendar synchronization.
- Current tests mock the data models. They verify service branching and atomic update filters, but do not replace integration tests against MongoDB or a true multi-client race test.
