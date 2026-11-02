# Local setup

The supported PowerShell setup, required environment values, root commands, demo credentials, and troubleshooting steps are maintained in [README.md](README.md).

Quick reference from the repository root:

```powershell
if (-not (Test-Path server\.env)) { Copy-Item server\.env.example server\.env }
if (-not (Test-Path client\.env)) { Copy-Item client\.env.example client\.env }
npm install
npm run seed
npm run dev
```

The API requires a reachable MongoDB instance. Open <http://localhost:5173> for the client and <http://localhost:5000/api/health> for the API health response.
