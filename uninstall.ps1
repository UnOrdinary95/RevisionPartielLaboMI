# Désinstalle la commande « labomi » (Windows).
# Usage : powershell -ExecutionPolicy Bypass -File uninstall.ps1
# Le dossier du projet n'est pas supprimé : efface-le toi-même si tu veux tout enlever.
$ErrorActionPreference = 'Stop'
$Root = Join-Path $env:LOCALAPPDATA 'labomi'
$Bin = Join-Path $Root 'bin'

# 1. Lanceur labomi.cmd
if (Test-Path $Root) {
  Remove-Item -Recurse -Force $Root
  Write-Host "✓ Commande supprimée : $Bin\labomi.cmd"
} else {
  Write-Host "La commande labomi n'était pas installée."
}

# 2. Entrée du PATH utilisateur
$UserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($UserPath -and (($UserPath -split ';') -contains $Bin)) {
  $NewPath = ($UserPath -split ';' | Where-Object { $_ -ne $Bin }) -join ';'
  [Environment]::SetEnvironmentVariable('Path', $NewPath, 'User')
  Write-Host "✓ $Bin retiré du PATH utilisateur"
}

Write-Host ''
Write-Host "Désinstallation terminée. Pour tout supprimer, efface le dossier : $PSScriptRoot"
