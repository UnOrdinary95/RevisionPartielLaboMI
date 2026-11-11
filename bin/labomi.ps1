# Lance la plateforme de révision Labo MI (Windows) et l'ouvre dans le navigateur.
$ErrorActionPreference = 'Stop'
$Dir = Split-Path -Parent $PSScriptRoot
$Port = if ($env:LABOMI_PORT) { $env:LABOMI_PORT } else { '5173' }
$Url = "http://localhost:$Port"

# Déjà lancé ? On ouvre juste le navigateur.
try {
  $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
  if ($r.Content -match 'Labo MI') {
    Write-Host "Labo MI tourne déjà sur $Url"
    Start-Process $Url
    exit 0
  }
} catch { }

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error 'pnpm est introuvable. Installe-le : npm install -g pnpm'
  exit 1
}

Set-Location $Dir
if (-not (Test-Path (Join-Path $Dir 'node_modules'))) { pnpm install }
pnpm dev --port $Port --strictPort --open
