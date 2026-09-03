# Cross-Platform PowerShell One-Command Launcher (run_app.ps1)
# AI-Powered Underwater Marine Debris Detection System

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🌊 MarineSight AI — Underwater Marine Debris Detection System" -ForegroundColor Green
Write-Host "🚀 Full-Stack & ML Architecture Launcher (run_app.ps1)" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "• Frontend: React 18, Vite, Tailwind CSS, Leaflet & React-Leaflet" -ForegroundColor White
Write-Host "• Backend : FastAPI, Uvicorn, Pydantic, SQLAlchemy Async, aiosqlite" -ForegroundColor White
Write-Host "• AI / ML : PyTorch, TorchVision, Albumentations, OpenCV, NumPy, SciPy" -ForegroundColor White
Write-Host "• Ingest  : SSS Waterfall Slicer, Lee Filter, CLAHE, EXIF GPS Parser" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $CurrentDir

Write-Host "`n[1/2] Checking dependencies..." -ForegroundColor Gray
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not detected. Please install Node.js (>=18)."
    exit 1
}

Write-Host "[2/2] Launching Full-Stack Application..." -ForegroundColor Cyan
Write-Host "Application accessible at http://localhost:3000" -ForegroundColor Green

npm run dev
