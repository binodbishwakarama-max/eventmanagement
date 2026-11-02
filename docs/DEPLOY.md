# Deployment and security guidance

## Current status

This repository is suitable for local development and demonstration only. The client can be built for hosting, but no production environment, real DSU integration, operational monitoring, backup policy, or formal security review has been verified.

## Local development

See the exact PowerShell setup and commands in [README.md](../README.md). Run the fictional sample-data seed only against a local, disposable MongoDB database. The seed script intentionally refuses non-local MongoDB URIs.

## Production preparation checklist

Before deploying any adapted system:

- Obtain DSU authorization and confirm the service name, ownership, official identity assets, accessibility requirements, and public messaging.
- Confirm SSO or another approved identity provider, account provisioning, student and organizer eligibility, event approval, cancellation, attendance, and data-retention policies.
- Configure a managed MongoDB deployment with private networking, least-privilege credentials, backups and tested restore procedures.
- Create the first administrator with `npm run provision-admin` after setting a production database URI and a unique administrator email/password in the server environment. The command creates only an admin account and never seeds sample events. Use a password of at least 12 characters; a longer unique secret is recommended.
- Deploy the API as a Node service. Set `PORT`, `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` as secret environment values.
- Build and deploy `client/` as a static SPA with `VITE_API_URL` set to the HTTPS API `/api` base URL and a host rewrite of unknown client paths to `index.html`.
- Restrict CORS to the exact HTTPS client origin, terminate TLS, apply rate limits at the edge, enable structured redacted logs, alerting, backups, dependency review and incident response.
- Replace localStorage bearer-token storage with secure, same-site, httpOnly cookies and a CSRF strategy before production. Review XSS protections and session revocation.
- Re-test atomic registration/cancellation behavior against the actual MongoDB deployment, add API integration tests, load tests, and an independent security review.

## Example hosting outline

The API can run on a Node host such as Render, connected to a private MongoDB Atlas cluster. The built `client/` can be hosted on a static provider such as Vercel or Netlify. Set `CLIENT_ORIGIN` to the exact deployed client origin and `VITE_API_URL` to the HTTPS API origin plus `/api`. Configure an SPA fallback to `index.html`.

These are deployment options, not verified or provisioned services. Do not run `npm run seed` against a production database; it creates fictional sample accounts/events.
