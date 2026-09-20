# Removes Really Responsive Tabs. Run elevated:  .\uninstall.ps1 "C:\Program Files\Mozilla Firefox"
param([Parameter(Mandatory=$true)][string]$App)
$loader = Join-Path $App "defaults\pref\autoconfig.js"
if ((Test-Path $loader) -and (Select-String -Quiet "really-responsive-tabs.cfg" $loader)) { Remove-Item $loader -Force }
Remove-Item (Join-Path $App "really-responsive-tabs") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item (Join-Path $App "really-responsive-tabs.cfg") -Force -ErrorAction SilentlyContinue
Write-Host "Removed from $App."
