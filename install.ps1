# Installe la commande « labomi » (Windows) : dépendances + labomi.cmd dans le PATH utilisateur.
# Usage : powershell -ExecutionPolicy Bypass -File install.ps1
$ErrorActionPreference = 'Stop'
$Dir = $PSScriptRoot

if ($Dir -like '*#*') {
  Write-Error 'Le chemin du projet contient « # », Vite ne fonctionnera pas : déplace le dossier.'
  exit 1
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error "pnpm est introuvable. Installe-le d'abord : npm install -g pnpm"
  exit 1
}

Push-Location $Dir
pnpm install
Pop-Location

# Petit lanceur labomi.cmd dans %LOCALAPPDATA%\labomi\bin
$Bin = Join-Path $env:LOCALAPPDATA 'labomi\bin'
New-Item -ItemType Directory -Force -Path $Bin | Out-Null
$Launcher = Join-Path $Dir 'bin\labomi.ps1'
$Cmd = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `"$Launcher`" %*`r`n"
Set-Content -Path (Join-Path $Bin 'labomi.cmd') -Value $Cmd -Encoding ASCII -NoNewline

# Ajout au PATH utilisateur (permanent)
$UserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (-not $UserPath) { $UserPath = '' }
if (($UserPath -split ';') -notcontains $Bin) {
  $NewPath = if ($UserPath) { "$UserPath;$Bin" } else { $Bin }
  [Environment]::SetEnvironmentVariable('Path', $NewPath, 'User')
  Write-Host "✓ $Bin ajouté au PATH utilisateur"
}

Write-Host ''
Write-Host "✓ Commande installée : $Bin\labomi.cmd"
Write-Host 'Ouvre un nouveau terminal, puis lance : labomi'
