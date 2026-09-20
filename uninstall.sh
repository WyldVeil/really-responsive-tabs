#!/usr/bin/env bash
# Removes Auto Tab Orientation from an application directory.
# Usage: ./uninstall.sh <app dir>
set -euo pipefail
app="${1:?usage: $0 <app dir, e.g. /opt/waterfox>}"
sudo=""
[ -w "$app" ] || sudo="sudo"
loader="$app/defaults/pref/autoconfig.js"
if [ -f "$loader" ] && grep -q "auto-tab-orientation.cfg" "$loader"; then
  $sudo rm -f "$loader"
fi
$sudo rm -rf "$app/auto-tab-orientation" "$app/auto-tab-orientation.cfg"
echo "Removed from $app. The autoTabOrientation.* prefs stay in your profile; clear them in about:config if you want."
