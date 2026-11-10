# DSU-context requirements and assumptions

## Verified institutional context

Official public pages reviewed on 2026-10-28:

- [Dayananda Sagar University official website](https://www.dsu.edu.in/) uses the name **Dayananda Sagar University** and presents academic schools and disciplines.
- [Official School of Engineering page](https://www.dsu.edu.in/academics/schools/engineering) identifies a School of Engineering under Dayananda Sagar University and describes science and technology-based education.

The implementation uses only the verified institution name as contextual copy. It does not reproduce an official logo or claim to be operated, approved, or supported by DSU. No official visual identity, event, policy, campus location, contact information, email domain, or login provider was inferred from these pages.

## Product and audience

Campus Events is an independent student-facing event-management concept for exploring a possible campus events workflow. The audience and roles are guests, students, event organizers, and administrators. Authentication creates a generic student account; it does not verify DSU identity.

## Requirements retained from the playbook

- MERN architecture: React/Vite client, Express/Node API, Mongoose models and MongoDB persistence.
- Published-event discovery; title, category and date filters; capacity and event details.
- Student registration and pre-start cancellation, duplicate prevention, capacity enforcement and reactivation of a cancelled registration.
- Student registration history; organizer ownership checks; administrator event and user oversight.
- Attendance after the event starts, scoped to an event's organizer or an administrator.
- Role-protected analytics and event management; responsive layouts, accessible labels/focus treatment, and explicit load/error/empty states on discovery.
- No waitlist or WebSockets; clients refetch after writes.

Organizer attendance is an intentional extension of the playbook's administrator-only rule to satisfy the product requirement for organizer operations. The exact permitted organizer scope still requires institutional confirmation.

## Conservative assumptions

- Categories are taken from the supplied playbook; they are not represented as DSU-approved taxonomy.
- Event venue, organizer name, capacity, dates, eligibility and descriptions are organizer-entered values. Sample entries are fictional, prefixed `DEMO:`, and use no asserted DSU room or campus names.
- Registration currently requires a signed-in account with the `student` role. It does not enforce a university email domain, identity provider, department, year, student number, faculty eligibility, or approval workflow.
- Dates are stored as instants and rendered using the browser's locale/time zone. The production time-zone convention remains to be confirmed.
- The slate/navy and amber visual system is an independent design choice, not a DSU brand palette.
- QR ticket display and camera check-in are implemented as demo workflows only. They are not official passes, certificates, or real-world entry/attendance entitlements.

## Confirm before real deployment

DSU authorization to operate the service; approved product naming and visual assets; identity/SSO and account provisioning; student and organizer eligibility; event review/publication and cancellation policies; approved event fields/categories and venue directory; accessibility requirements; data privacy, retention and reporting rules; event time-zone convention; security review; production hosting and support contacts.
