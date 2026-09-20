#!/usr/bin/env bash
# Removes Really Responsive Tabs from an application directory.
# Usage: ./uninstall.sh <app dir>
set -euo pipefail
app="${1:?usage: $0 <app dir, e.g. /opt/waterfox>}"
sudo=""
[ -w "$app" ] || sudo="sudo"
loader="$app/defaults/pref/autoconfig.js"
if [ -f "$loader" ] && grep -q "really-responsive-tabs.cfg" "$loader"; then
  $sudo rm -f "$loader"
fi
$sudo rm -rf "$app/really-responsive-tabs" "$app/really-responsive-tabs.cfg"
echo "Removed from $app. The reallyResponsiveTabs.* prefs stay in your profile; clear them in about:config if you want."
