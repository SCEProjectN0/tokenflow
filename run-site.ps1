$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "QA resume site launcher" -ForegroundColor Cyan
Write-Host "Project: $projectRoot"
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js was not found. Install Node.js 20 or newer, then run this file again." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm was not found. Reinstall Node.js with npm enabled, then run this file again." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..."
  npm install
}

$port = 3000
$portBusy = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portBusy) {
  $port = 3001
  Write-Host "Port 3000 is already in use. Using port 3001 instead." -ForegroundColor Yellow
}

$url = "http://localhost:$port"
Write-Host ""
Write-Host "Starting site at $url" -ForegroundColor Green
Write-Host "Keep this window open while using the site."
Write-Host "Wait until you see 'Ready', then open $url"
Write-Host ""

npm run dev -- -p $port

Read-Host "Press Enter to close"
