@echo off
title Workplace SafetyWatch - Backend API (Port 8000)
echo ========================================================
echo   Starting Workplace SafetyWatch Backend Server (FastAPI)
echo ========================================================

echo [1/2] Clearing any old lingering processes on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/2] Launching Backend on http://localhost:8000 ...
.\backend\.venv\Scripts\uvicorn app.main:app --app-dir backend --reload --port 8000
pause
