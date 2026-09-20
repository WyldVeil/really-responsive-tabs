# Removes Auto Tab Orientation. Run elevated:  .\uninstall.ps1 "C:\Program Files\Mozilla Firefox"
param([Parameter(Mandatory=$true)][string]$App)
$loader = Join-Path $App "defaults\pref\autoconfig.js"
if ((Test-Path $loader) -and (Select-String -Quiet "auto-tab-orientation.cfg" $loader)) { Remove-Item $loader -Force }
Remove-Item (Join-Path $App "auto-tab-orientation") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $App "auto-tab-orientation.cfg") -Force -ErrorAction SilentlyContinue
Write-Host "Removed from $App."
