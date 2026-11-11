# Désinstalle la commande « labomi » (Windows).
# Usage : powershell -ExecutionPolicy Bypass -File uninstall.ps1
# Le dossier du projet n'est pas supprimé : efface-le toi-même si tu veux tout enlever.
$ErrorActionPreference = 'Stop'

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

if (-not $env:LOCALAPPDATA) { Write-Error 'Variable LOCALAPPDATA introuvable : désinstallation annulée.'; exit 1 }
$Root = Join-Path $env:LOCALAPPDATA 'labomi'
$Bin = Join-Path $Root 'bin'

# 1. Lanceur labomi.cmd : on supprime SEULEMENT ce fichier, puis les dossiers s'ils sont vides
$CmdFile = Join-Path $Bin 'labomi.cmd'
if (Test-Path -LiteralPath $CmdFile) {
  Remove-Item -LiteralPath $CmdFile -Force
  Write-Host "✓ Commande supprimée : $CmdFile"
} else {
  Write-Host "La commande labomi n'était pas installée."
}
foreach ($D in @($Bin, $Root)) {
  if ((Test-Path -LiteralPath $D) -and -not (Get-ChildItem -LiteralPath $D -Force)) {
    Remove-Item -LiteralPath $D -Force
  }
}

# 2. Entrée du PATH utilisateur (seulement la nôtre)
$UserPath = Get-UserPathRaw
if ($UserPath -and (($UserPath -split ';') -contains $Bin)) {
  $NewPath = ($UserPath -split ';' | Where-Object { $_ -ne $Bin }) -join ';'
  Set-UserPathRaw $NewPath
  Write-Host "✓ $Bin retiré du PATH utilisateur"
}

Write-Host ''
Write-Host "Désinstallation terminée. Pour tout supprimer, efface le dossier : $PSScriptRoot"
