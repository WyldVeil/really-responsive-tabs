#!/usr/bin/env bash
# Installs Really Responsive Tabs into a Firefox-family application directory.
# Usage: ./install.sh [app dir]      e.g. ./install.sh /opt/waterfox
# With no argument it looks in the usual places and asks if it finds several.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

candidates=(
  /opt/waterfox /opt/firefox /opt/librewolf
  /usr/lib/waterfox /usr/lib/firefox /usr/lib64/firefox /usr/lib/firefox-esr
  /usr/lib/librewolf /usr/lib64/librewolf
  /Applications/Waterfox.app/Contents/Resources
  /Applications/Firefox.app/Contents/Resources
  /Applications/LibreWolf.app/Contents/Resources
)

if [ $# -ge 1 ]; then
  app="$1"
else
  found=()
  for c in "${candidates[@]}"; do
    [ -f "$c/omni.ja" ] && found+=("$c")
  done
  if [ ${#found[@]} -eq 0 ]; then
    echo "No Firefox-family install found. Pass the application directory (the one with omni.ja) as an argument." >&2
    exit 1
  elif [ ${#found[@]} -eq 1 ]; then
    app="${found[0]}"
  else
    echo "Several installs found:"
    select app in "${found[@]}"; do [ -n "$app" ] && break; done
  fi
fi

[ -f "$app/omni.ja" ] || { echo "$app does not look like an application directory (no omni.ja)." >&2; exit 1; }

sudo=""
[ -w "$app" ] || sudo="sudo"

existing="$app/defaults/pref/autoconfig.js"
if [ -f "$existing" ] && ! grep -q "really-responsive-tabs.cfg" "$existing"; then
  echo "There is already an autoconfig loader at $existing pointing somewhere else." >&2
  echo "Only one general.config.filename can be active. To keep both, add these lines to your existing .cfg:" >&2
  echo >&2
  sed -n '/^try {/,$p' "$here/really-responsive-tabs.cfg" >&2
  echo >&2
  echo "and copy the really-responsive-tabs/ directory into $app yourself. Nothing was changed." >&2
  exit 2
fi

$sudo mkdir -p "$app/defaults/pref" "$app/really-responsive-tabs"
$sudo cp "$here/autoconfig.js" "$app/defaults/pref/autoconfig.js"
$sudo cp "$here/really-responsive-tabs.cfg" "$app/really-responsive-tabs.cfg"
$sudo cp "$here"/really-responsive-tabs/* "$app/really-responsive-tabs/"
$sudo chmod -R a+rX "$app/really-responsive-tabs" "$app/really-responsive-tabs.cfg" "$app/defaults/pref/autoconfig.js"

echo "Installed into $app. Restart the browser; the settings are behind the new toolbar button or Tools > Really Responsive Tabs."
