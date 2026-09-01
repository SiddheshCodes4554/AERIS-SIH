@echo off
title AERIS Backend Server
cd /d "%~dp0"
echo Starting AERIS Command Center Backend...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    python main.py
) else (
    python main.py
)
pause
