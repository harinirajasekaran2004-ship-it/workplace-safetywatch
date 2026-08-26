@echo off
title Workplace SafetyWatch - Full Stack Launcher
echo ========================================================
echo   Launching Workplace SafetyWatch (Backend + Frontend)
echo ========================================================

start "" "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "" "%~dp0start_frontend.bat"

echo.
echo Both servers launched in separate windows!
echo - Backend:  http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
timeout /t 5
