# Lance la plateforme de révision Labo MI (Windows) et l'ouvre dans le navigateur.
#
#   labomi              met à jour (si possible) puis lance le site
#   labomi update       met à jour sans lancer
#   labomi --no-update  lance sans chercher de mise à jour (ou $env:LABOMI_NO_UPDATE=1)
#   labomi help         affiche cette aide
$ErrorActionPreference = 'Stop'
$Dir = Split-Path -Parent $PSScriptRoot
$Port = if ($env:LABOMI_PORT) { $env:LABOMI_PORT } else { '5173' }
$Url = "http://localhost:$Port"
$Cmd = if ($args.Count -gt 0) { $args[0] } else { '' }

function Need-Pnpm {
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host 'pnpm est introuvable. Installe-le : npm install -g pnpm'
    exit 1
  }
}

function Install-Deps {
  pnpm install --frozen-lockfile | Out-Host
  if ($LASTEXITCODE -ne 0) { pnpm install | Out-Host }
}

# Met à jour depuis GitHub (avance rapide uniquement). Ne bloque jamais le lancement.
function Update-Labomi {
  Set-Location $Dir
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Write-Host 'git introuvable : pas de mise à jour.'; return $false }
  git rev-parse --is-inside-work-tree 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { return $false }
  git rev-parse --abbrev-ref '@{u}' 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host 'Pas de branche distante suivie : pas de mise à jour.'; return $false }

  Write-Host 'Recherche de mises à jour…'
  git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=5 fetch --quiet 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Host 'Hors ligne ou GitHub injoignable : on garde la version actuelle.'; return $false }

  $Behind = [int](git rev-list --count 'HEAD..@{u}')
  $Ahead = [int](git rev-list --count '@{u}..HEAD')
  if ($Behind -eq 0) { Write-Host '✓ Déjà à jour.'; return $false }

  git diff --quiet; $Dirty = $LASTEXITCODE -ne 0
  git diff --cached --quiet; $Dirty = $Dirty -or ($LASTEXITCODE -ne 0)
  if ($Ahead -ne 0 -or $Dirty) {
    Write-Host "⚠ $Behind mise(s) à jour disponible(s), mais tu as des modifications locales : mise à jour ignorée."
    Write-Host '  (git stash puis labomi update pour la récupérer)'
    return $false
  }

  $Old = git rev-parse HEAD
  git merge --ff-only --quiet '@{u}'
  if ($LASTEXITCODE -ne 0) { Write-Host '⚠ La mise à jour a échoué : on garde la version actuelle.'; return $false }
  Write-Host "✓ Mis à jour ($Behind commit(s)) :"
  git log --format='  • %s' "$Old..HEAD" | Out-Host

  git diff --quiet $Old HEAD -- package.json pnpm-lock.yaml
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Les dépendances ont changé, installation…'
    Need-Pnpm
    Install-Deps
  }
  return $true
}

switch ($Cmd) {
  { $_ -in 'help', '-h', '--help' } {
    Get-Content $PSCommandPath -Encoding UTF8 | Select-Object -Skip 1 -First 6 | ForEach-Object { $_ -replace '^# ?', '' }
    exit 0
  }
  'update' { Update-Labomi | Out-Null; exit 0 }
  '--no-update' { $env:LABOMI_NO_UPDATE = '1' }
}

if (-not $env:LABOMI_NO_UPDATE) {
  $Updated = Update-Labomi
  if ($Updated) {
    # Le lanceur lui-même a pu changer : on relance la nouvelle version.
    $env:LABOMI_NO_UPDATE = '1'
    & powershell -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath
    exit $LASTEXITCODE
  }
}

# Déjà lancé ? On ouvre juste le navigateur (Vite recharge tout seul le code mis à jour).
try {
  $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
  if ($r.Content -match 'Labo MI') {
    Write-Host "Labo MI tourne déjà sur $Url"
    Start-Process $Url
    exit 0
  }
} catch { }

Need-Pnpm
Set-Location $Dir
if (-not (Test-Path (Join-Path $Dir 'node_modules'))) { Install-Deps }
pnpm dev --port $Port --strictPort --open
