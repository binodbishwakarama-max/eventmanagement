# Limitations and confirmations needed

## Institutional confirmation

- This is an independent demo concept, not an official or approved DSU service.
- No official logo, brand palette, campus address/room, contact detail, login provider, event listing, eligibility rule, policy, or email domain is included.
- DSU must confirm authorization, naming/identity, SSO or account verification, organizer onboarding, student eligibility, publication/cancellation rules, attendance and privacy policy, data retention, event categories, venue directory, timezone convention and operational support.
- Seed accounts, events, attendance, ticket codes and analytics are fictional local-only data. Do not use them as real people, events, credentials, entry passes, certificates or reports.

## Implemented scope

- JWT bearer tokens are stored in browser `localStorage`; this matches the playbook but increases exposure if a script injection vulnerability occurs.
- No waitlist, SSO, email verification, built-in calendar view, or WebSockets.
- QR ticket display and camera check-in are demo-only; no real gate credential or university attendance record is issued.
- Email transport defaults to mock mode. Production email delivery, templates, domain authorization, and operational handling need separate configuration and review.
- The passbook can display read-only cached records while offline. Writes require the API; cached data is not authoritative.
- A one-way Google Calendar compose link is present, but there is no calendar synchronization.
- The API models a single event time range, not a structured multi-session schedule. Eligibility appears as explanatory copy; there is no configurable eligibility engine.
- Administrator account oversight is read-only. There is no user suspension, role-change, or account-deletion interface.
- Public registration creates a student account without verifying institutional identity. The admin profile-review queue checks only submitted demo data; it is not connected to a registrar or identity provider.
- The demo UI uses generic branding and fictional sample venues; it does not provide a verified campus map, venue directory, or booking availability.
- Event edits use ownership and capacity-floor checks, but there is no event approval workflow.
- Counter rollback uses compensating MongoDB updates rather than multi-document transactions. Test coverage currently mocks model methods; no real MongoDB concurrency/integration suite is included.
- Accessibility improvements and responsive layouts are implemented, but no formal Lighthouse, keyboard-only, screen-reader, or measured contrast audit has been completed.
- User-editable event content is escaped by React; CSV export and any production data-handling path still require security/privacy review before real use.
