Write-Host "Starting Eleven Labs Wrap..." -ForegroundColor Green
Write-Host ""

# Start backend API in a new window
Write-Host "Starting Backend API (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\api'; npm start"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start frontend in a new window
Write-Host "Starting Frontend Web (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\web'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Backend API: http://127.0.0.1:3001" -ForegroundColor White
Write-Host "Frontend:    http://localhost:3000/#login" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers." -ForegroundColor Green
