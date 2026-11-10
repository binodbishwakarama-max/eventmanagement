# Campus Events demo presentation guide

## Project summary

Campus Events is an independent event-management concept built with React, Express, Node.js, MongoDB, and Mongoose. Dayananda Sagar University is used as institutional context only; this project is not an official or approved DSU service.

The application demonstrates event discovery, registration, capacity handling, organizer event management, attendance check-in, and administrator oversight. All seeded users, events, registrations, attendance, ticket codes, and analytics are fictional local demo data.

## Architecture overview

```text
React + Vite client
       |
       | JSON API and bearer JWT
       v
Express + Node.js API
       |
       | Mongoose
       v
MongoDB
```

The client uses React Router, Tailwind CSS, Axios, and React Context for authentication state. The API validates request bodies and query parameters, hashes passwords with bcryptjs, and checks roles and organizer ownership on protected routes. JWTs are stored in browser `localStorage` to follow the supplied playbook; that is a demo trade-off, not a production recommendation.

## What can be demonstrated

- Browse and filter published events as a guest.
- Sign in with a fictional local account and register for an upcoming sample event.
- Cancel and re-register before the event starts.
- Review fictional attendee registrations in the student dashboard.
- Create, edit, publish, and cancel events as an organizer or administrator.
- Record attendance after the event start time and export a demo attendee CSV.
- Review administrator account oversight and demo analytics.
- Scan a sample QR code with the demo check-in screen and show the duplicate check-in response.

Ticket codes, QR images, and attendance displays are for application walkthroughs only. They are not real entry passes, official certificates, or institutional attendance records. The venue planner is illustrative and not a real campus map.

## Engineering points

- Capacity is reserved using a conditional atomic MongoDB update; the registration model also has a unique event/student index.
- Cancellation uses a conditional transition so concurrent requests do not decrement the count twice.
- Server routes enforce role and organizer ownership checks; hiding a UI control is not the security boundary.
- Attendance is limited to active registrations after an event starts; duplicate check-ins return a conflict.
- Tests use mocked Mongoose methods. They do not prove actual MongoDB concurrency behavior.

## Demo and setup

Use the local-only accounts and event flows in the [demo walkthrough](./DEMO.md), and the root installation, environment, test, and run commands in the [README](../README.md). Do not point the fictional seed at an institutional or production database.

## Do not claim

- That DSU operates, approves, or supports this application.
- That the sample events, people, venues, attendance, or analytics are real.
- That demo tickets or attendance records establish entry, participation, or academic credit.
- That the current tests verify production database concurrency or production security.

Consult [DSU requirements](./DSU_REQUIREMENTS.md) and [limitations](./LIMITATIONS.md) for details requiring institutional confirmation.
