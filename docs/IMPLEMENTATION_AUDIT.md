# Implementation audit and requirement mapping

Historical review of the repository as it existed on 2026-10-29. It is not a description of the current UI or a certification of institutional policy or production readiness; see [current implementation summary](./SPEC.md) and [limitations](./LIMITATIONS.md).

## Current architecture

- React/Vite client and Express/Node/Mongoose API are already present.
- MongoDB models cover users, events, and registrations; no migration framework is configured.
- Registration capacity, cancellation, ownership, and attendance logic have service tests, but these tests mock Mongoose and do not exercise live MongoDB races.
- Authentication currently uses bearer JWTs in `localStorage`; server authorization is enforced, but the client-held token is exposed to JavaScript.
- Events currently use `draft | published | cancelled`; organizer/admin event edit accepts `published` directly. No approval queue, venue directory, campus model, club model, or audit trail exists.
- Registration opens based on event publication/start/capacity; no registration-window fields or waitlist exist.

## Brief mapping

| Requirement area | Starting state | Work needed / boundary |
|---|---|---|
| Accurate DSU campus context | Existing UI is an independent demo; Main Campus address was not stored | Official contact page confirms the Harohalli Main Campus address and separately lists City Innovation Campus. Any campus records should retain source/retrieval metadata. |
| Facilities and venues | Events accept free-text venue; no venue records | Facility types are not currently treated as verified bookable venues. Candidate records must remain unverified and unavailable until authorized verification. |
| Clubs | Event has a free-text organizer label | The supplied clubs page did not return machine-readable club-list content during this review; do not seed its names until content can be checked. |
| Branding | Independent Campus Events identity; no DSU logo | Keep neutral identity; no official asset or palette is used and no endorsement is implied. |
| OIDC/SSO | No provider integration | No tenant/provider is assumed; credentials and identity claims require DSU authorization. |
| Secure sessions | JWT in `localStorage`; bearer middleware | Replace with server-managed cookie sessions, CSRF defenses, logout invalidation, and topology-configured cookie settings. |
| Faculty approval | No faculty role or approval state | Add server-side lifecycle transitions and reviewer authorization; approval policy and authorized reviewers require institutional configuration. |
| Event lifecycle | Draft/published/cancelled; direct publish update | Enforce proposal/review/publish transitions and record review history. |
| Venue conflicts | No venue IDs or conflict checks | Require verified active venue and server-side interval conflict validation before publication. |
| Other event features | Basic registration, attendance, CSV, search | Waitlists, QR scanning, notifications, attachments, announcements, and certificates are not implemented and need prioritization/integration decisions. |

## Public-source check

- The DSU official contact page was fetched on 2026-10-29 and lists the Main Campus as Devarakaggalahalli, Harohalli, Kanakapura Road, Bengaluru South District – 562 112. It separately lists the City Innovation Campus at Kudlu Gate. The two locations must not be conflated.
- The supplied official clubs-page URL was fetched, but the returned text contained only the shared footer and did not expose a club list. Club names remain unverified in this implementation.
- No venue names, capacities, booking rules, or official brand assets are treated as verified by this review.

## Compatibility and migration concerns

MongoDB documents have no migration runner in this repository. Before adding required fields or changing status enums, provide an idempotent migration/backfill and decide how existing published demo events are represented. Existing JWT clients and API callers also need a coordinated session-auth transition; do not silently preserve bearer-token auth as a production fallback.
