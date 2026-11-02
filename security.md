# Security notes

## What the demo implements

- Password hashes use bcryptjs. Authenticated requests use short-lived JWT bearer tokens.
- Authentication endpoints are rate-limited; Helmet headers are enabled; CORS is restricted to `CLIENT_ORIGIN`.
- Request payloads use Zod validation. Event discovery escapes user search text before building regular expressions.
- Roles and organizer event ownership are enforced on the API. Public registration always creates a student.
- User JSON serialization omits password hashes. The administrator user-list query selects only limited profile fields.
- Error responses do not include stack traces in production mode.

## Important limitations

- JWTs are stored in browser `localStorage`, so an XSS defect could expose a token. The production hardening step is secure, same-site, httpOnly cookies with an appropriate CSRF strategy.
- No formal penetration test, dependency audit, rate-limit load test, privacy review, or deployment security validation has been completed.
- The seed contains fictional sample accounts/events and is restricted to local MongoDB. Never seed or reuse its data in a production database.
- Event/registration consistency uses compensating MongoDB updates rather than transactions. Exercise the exact behavior against the intended MongoDB topology before production.
- Admin user oversight is read-only. The public registration endpoint does not confirm email ownership or DSU identity.

See [docs/DEPLOY.md](docs/DEPLOY.md) for a production preparation checklist and [docs/LIMITATIONS.md](docs/LIMITATIONS.md) for outstanding institutional decisions.
