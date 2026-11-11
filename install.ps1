# Installe la commande « labomi » (Windows) : dépendances + labomi.cmd dans le PATH utilisateur.
# Usage : powershell -ExecutionPolicy Bypass -File install.ps1
$ErrorActionPreference = 'Stop'
$Dir = $PSScriptRoot

# Lit / écrit le PATH utilisateur SANS développer les %VARIABLES% (ex. %USERPROFILE%),
# pour ne pas abîmer les entrées existantes ([Environment]::SetEnvironmentVariable les figerait).
function Get-UserPathRaw {
  $Key = Get-Item -Path 'HKCU:\Environment'
  return [string]$Key.GetValue('Path', '', 'DoNotExpandEnvironmentNames')
}
function Set-UserPathRaw([string]$Value) {
  Set-ItemProperty -Path 'HKCU:\Environment' -Name 'Path' -Value $Value -Type ExpandString
  # Prévient Windows du changement (sinon visible seulement après reconnexion)
  [Environment]::SetEnvironmentVariable('LABOMI_TMP', '1', 'User')
  [Environment]::SetEnvironmentVariable('LABOMI_TMP', $null, 'User')
}

if ($Dir -like '*#*') {
  Write-Error 'Le chemin du projet contient « # », Vite ne fonctionnera pas : déplace le dossier.'
  exit 1
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error "pnpm est introuvable. Installe-le d'abord : npm install -g pnpm"
  exit 1
}

Push-Location $Dir
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { pnpm install }
Pop-Location

# Petit lanceur labomi.cmd dans %LOCALAPPDATA%\labomi\bin
if (-not $env:LOCALAPPDATA) { Write-Error 'Variable LOCALAPPDATA introuvable : installation annulée.'; exit 1 }
$Bin = Join-Path $env:LOCALAPPDATA 'labomi\bin'
New-Item -ItemType Directory -Force -Path $Bin | Out-Null
$Launcher = Join-Path $Dir 'bin\labomi.ps1'
$Cmd = "@echo off`r`npowershell -NoProfile -ExecutionPolicy Bypass -File `"$Launcher`" %*`r`n"
Set-Content -Path (Join-Path $Bin 'labomi.cmd') -Value $Cmd -Encoding ASCII -NoNewline

# Ajout au PATH utilisateur (permanent)
$UserPath = Get-UserPathRaw
if (($UserPath -split ';') -notcontains $Bin) {
  $NewPath = if ($UserPath) { $UserPath.TrimEnd(';') + ";$Bin" } else { $Bin }
  Set-UserPathRaw $NewPath
  Write-Host "✓ $Bin ajouté au PATH utilisateur"
}

Write-Host ''
Write-Host "✓ Commande installée : $Bin\labomi.cmd"
Write-Host 'Ouvre un nouveau terminal, puis lance : labomi'
