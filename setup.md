# Local setup

The macOS setup, required environment values, root commands, demo credentials, and troubleshooting steps are maintained in [README.md](README.md).

Quick reference from the repository root:

```sh
cp -n server/.env.example server/.env
cp -n client/.env.example client/.env
npm install
npm run dev
```

The API uses a temporary in-memory database if MongoDB is unavailable; for persistent data and the full demo seed, configure MongoDB as described in [README.md](README.md) and run `npm run seed` before starting the app. Open <http://localhost:5173> for the client and <http://localhost:5000/api/health> for the API health response.
