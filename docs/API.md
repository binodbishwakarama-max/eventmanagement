# API reference

Base URL: `http://localhost:5000/api`

Successful responses use `{ "success": true, "data": ..., "message": "..." }`. Errors use `{ "success": false, "message": "...", "errors": [...] }`. Authenticated requests send `Authorization: Bearer <JWT>`.

## Authentication

- `POST /auth/register` — public. Body: `name`, `email`, `password`; optional `department`, `rollNumber`, and `usn`. The server always assigns the `student` role. Returns a JWT and safe user profile.
- `POST /auth/login` — public. Body: `email`, `password`. Returns a JWT and safe user profile.
- `GET /auth/me` — authenticated. Returns the current safe user profile.

## Event discovery and management

- `GET /events` — public. Query: `search`, `category`, `from`, `to`, `sort` (`soonest`, `latest`, `popular`), `page` (default 1), `limit` (default 9, max 50). Returns published events.
- `GET /events/:id` — public with optional authentication. Guests and students see published events only. An administrator or the owning organizer may also view non-published events. Returns the event and the caller's registration when authenticated.
- `GET /events/admin/list` — administrator or organizer. Query: `search`, `status`, `page`, `limit` (max 100). Organizers see only events they own; administrators see all.
- `POST /events` — administrator or organizer. Body: `title`, `description`, `category`, `venue`, `startsAt`, `endsAt`, `capacity`, and optional `organizerClub`. New events are always created as drafts.
- `PUT /events/:id` — administrator or owning organizer. Accepts any validated event fields, including `status`. Capacity cannot be lowered below active registrations.
- `DELETE /events/:id` — administrator or owning organizer. Returns 409 if any registration record exists; cancel the event instead.

## Registrations and attendance

- `POST /events/:id/register` — student. Reserves one seat for a published event before its start; duplicate active registrations and full events return 409.
- `DELETE /events/:id/register` — student. Cancels the active registration before the event starts.
- `GET /registrations/me` — student. Returns the caller's registrations with populated events.
- `GET /events/:id/registrations` — administrator or owning organizer. Returns active registrations with limited student profile fields.
- `PATCH /events/:id/registrations/:registrationId/attendance` — administrator or owning organizer, after event start. Body: `{ "attended": true | false }`. A second check-in returns 409 `Already checked in`.

## Administration and health

- `GET /admin/stats` — administrator or organizer. Organizers receive analytics scoped to their events. Includes event totals, active registration count, attendance rate and the next five published events.
- `GET /admin/users` — administrator only. Query: `search`, `role`, `page` (default 1), `limit` (default 25, max 100). Returns `name`, `email`, `role`, `department`, `clubName` and `createdAt`; no password hash is selected. This is read-only account oversight.
- `GET /health` — public API health response.

## Relevant status codes

- 400: input validation failure or registration/cancellation timing rule.
- 401: missing or invalid authentication.
- 403: wrong role or an organizer acting on an event they do not own.
- 404: missing resource or an unpublished event hidden from a non-privileged caller.
- 409: active duplicate registration, full event, duplicate check-in, or deletion blocked by registration history.
- 500: unexpected server error.

The route implementation is the source of truth. This reference describes the current code, not an external DSU service contract.
