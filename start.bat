@echo off
title Campus Events - Independent Local Demo
color 0A

echo.
echo  ============================================================
echo     Campus Events - Independent DSU-context concept
echo     Independent local demo (fictional data)
echo  ============================================================
echo.

:: Navigate to project root
cd /d "%~dp0"

:: Check if node_modules exist
if not exist "node_modules" (
    echo [SETUP] Installing dependencies for the first time...
    echo         This may take 1-2 minutes. Please wait...
    echo.
    call npm install
    echo.
    echo [SETUP] Dependencies installed successfully!
    echo.
)

echo [INFO] Starting the local demo...
echo.
echo    Frontend UI  :  http://localhost:5173
echo    Backend API  :  http://localhost:5000/api
echo    Health Check :  http://localhost:5000/api/health
echo.
echo  ------------------------------------------------------------
echo    Local Demo Credentials:
echo    Admin     :  use values in server\.env
echo    Organizer :  organizer@example.test / Organizer@123
echo    Student   :  student1@example.test  / Student@123
echo  ------------------------------------------------------------
echo.
echo [INFO] Press Ctrl+C in this window to stop.
echo.

:: Start backend server in background window
start "Campus Events Demo API (Port 5000)" /min cmd /c "cd /d "%~dp0" && node server/src/server.js"

:: Wait 2 seconds for backend to start
timeout /t 2 /nobreak >nul

:: Open browser automatically
start "" http://localhost:5173

:: Start frontend Vite from inside client folder for proper Tailwind CSS resolution
cd /d "%~dp0client"
npx vite --port 5173
