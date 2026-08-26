@echo off
title Workplace SafetyWatch - Automated Test Suite
echo ========================================================
echo   Running Workplace SafetyWatch Automated Test Suite
echo ========================================================

set PYTHONPATH=backend
.\backend\.venv\Scripts\python -m pytest backend\tests -v

echo.
echo ========================================================
echo   Test Execution Complete!
echo ========================================================
pause
