@echo off
title AERIS Backend Server
cd /d "%~dp0"
echo Starting AERIS Command Center Backend on port 8000...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    python -m uvicorn main:app --host 0.0.0.0 --port 8000
) else (
    python -m uvicorn main:app --host 0.0.0.0 --port 8000
)
pause
