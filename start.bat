@echo off
echo Starting Eleven Labs Wrap...
echo.

REM Start backend API in a new window
start "Backend API (Port 3001)" cmd /k "cd apps\api && npm start"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Frontend Web (Port 3000)" cmd /k "cd apps\web && npm run dev"

echo.
echo ========================================
echo Backend API: http://127.0.0.1:3001
echo Frontend:    http://localhost:3000/#login
echo ========================================
echo.
echo Both servers are starting in separate windows.
echo Close those windows to stop the servers.
