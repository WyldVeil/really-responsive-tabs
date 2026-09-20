# Installs Auto Tab Orientation into a Firefox-family install on Windows.
# Run from an elevated PowerShell:  .\install.ps1 ["C:\Program Files\Mozilla Firefox"]
param([string]$App)
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $App) {
  $candidates = @(
    "$env:ProgramFiles\Waterfox", "$env:ProgramFiles\Mozilla Firefox",
    "$env:ProgramFiles\LibreWolf", "${env:ProgramFiles(x86)}\Mozilla Firefox",
    "$env:LOCALAPPDATA\Waterfox", "$env:LOCALAPPDATA\Mozilla Firefox"
  ) | Where-Object { Test-Path (Join-Path $_ "omni.ja") }
  if ($candidates.Count -eq 0) { throw "No Firefox-family install found. Pass the application directory as an argument." }
  if ($candidates.Count -eq 1) { $App = $candidates[0] }
  else {
    for ($i = 0; $i -lt $candidates.Count; $i++) { Write-Host "[$i] $($candidates[$i])" }
    $App = $candidates[[int](Read-Host "Which one")]
  }
}
if (-not (Test-Path (Join-Path $App "omni.ja"))) { throw "$App does not look like an application directory (no omni.ja)." }

$loader = Join-Path $App "defaults\pref\autoconfig.js"
if ((Test-Path $loader) -and -not (Select-String -Quiet "auto-tab-orientation.cfg" $loader)) {
  throw "There is already an autoconfig loader at $loader pointing somewhere else. See README, section 'Already using autoconfig'."
}

New-Item -ItemType Directory -Force (Join-Path $App "defaults\pref") | Out-Null
New-Item -ItemType Directory -Force (Join-Path $App "auto-tab-orientation") | Out-Null
Copy-Item (Join-Path $here "autoconfig.js") $loader -Force
Copy-Item (Join-Path $here "auto-tab-orientation.cfg") (Join-Path $App "auto-tab-orientation.cfg") -Force
Copy-Item (Join-Path $here "auto-tab-orientation\*") (Join-Path $App "auto-tab-orientation") -Force
Write-Host "Installed into $App. Restart the browser; the settings are behind the new toolbar button or Tools > Auto Tab Orientation."
