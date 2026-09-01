# AERIS Backend PowerShell Runner
Set-Location $PSScriptRoot
Write-Host "Starting AERIS Command Center Backend..." -ForegroundColor Cyan

if (Test-Path ".\venv\Scripts\Activate.ps1") {
    & .\venv\Scripts\Activate.ps1
    python main.py
} else {
    python main.py
}
