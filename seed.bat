@echo off
title DSU Campus Events - Database Seeder
color 0E

echo.
echo  ============================================================
echo     DSU Campus Events - Database Seed Script
echo     Fictional local demo data only
echo  ============================================================
echo.

cd /d "%~dp0"

echo [INFO] Seeding fictional demo data into local MongoDB...
echo        (Make sure local MongoDB is running and server\.env points to localhost)
echo.

node server/src/scripts/seed.js
if errorlevel 1 (
    echo [ERROR] Local demo seeding failed. Check server\.env and the MongoDB service.
    pause
    exit /b 1
)

echo.
echo [DONE] Seed complete. You can now run start.bat to launch the app.
echo.
pause
