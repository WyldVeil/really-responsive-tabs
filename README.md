# Really Responsive Tabs

Firefox and Waterfox tabs that respond to the window size: vertical tabs when
the window is wide, horizontal tabs when it is narrow. Switches automatically
as you resize, snap or maximise the window.
Works in Firefox, Waterfox and LibreWolf on Linux, Windows and macOS.

## Why

I noticed that when using half screen for Firefox/Waterfox, web page real
estate becomes quite tight when using vertical tabs. You may think switching
to horizontal tabs in this situation sounds counter intuitive, but it kind of
works better for me because the web page I'm on is more important in the
moment than the tabs. While if I'm using fullscreen, vertical tabs work best
for organisation, they squeeze too much of the web page's space when using
half screen or less.

Neither browser offers this, so this project does it. It also includes other
options, e.g. for switching to vertical tabs at certain dimensions if your
default is horizontal tabs. And different triggers can be set.

## What it does

Two modes, picked in the settings:

- **Vertical tabs, horizontal when the window is narrow.** For people who
  normally run vertical tabs. When the window takes up a set percentage of
  the screen's width or less (default 50%, so a half-screen snap), tabs go
  horizontal. Widen the window again and they go back.
- **Horizontal tabs, vertical when the window is short.** For people who
  normally run horizontal tabs. When the window takes up a set percentage of
  the screen's height or less, tabs move to the side to free up rows.

Plus:

- The percentage for each mode, with a live readout of the current window's
  size so you can see which side of the line it is on.
- A tolerance in pixels, so a window snapped to exactly half the screen still
  counts as half once the window manager's borders and gaps are taken off.
- If you flip the orientation by hand it stays that way until the window next
  crosses the threshold, so a manual choice is respected instead of fought.
- A toolbar button (can be hidden) and a Tools menu entry that open the
  settings. All settings apply immediately.
- Multiple monitors are fine: each window is measured against the screen it
  is on.

## Install

This is not a WebExtension. Firefox gives extensions no way to change the tab
orientation (the `sidebar.verticalTabs` setting is not exposed to the
extension API, and userChrome.css cannot do it either because vertical mode
moves the tab strip into the sidebar in the DOM). The only supported way to
run code that can is Mozilla's autoconfig mechanism, which is what enterprise
deployments use. So this installs into the browser's application directory,
not into a profile, and needs admin rights once.

Nothing here touches your profile beyond a handful of `reallyResponsiveTabs.*`
preferences.

**Linux and macOS**

```
git clone https://github.com/WyldVeil/really-responsive-tabs
cd really-responsive-tabs
./install.sh            # finds the browser, or pass the directory: ./install.sh /opt/waterfox
```

**Windows** (elevated PowerShell)

```
git clone https://github.com/WyldVeil/really-responsive-tabs
cd really-responsive-tabs
.\install.ps1           # or: .\install.ps1 "C:\Program Files\Mozilla Firefox"
```

Restart the browser. The settings are behind the new toolbar button or under
Tools > Really Responsive Tabs.

The application directory is the one containing `omni.ja`: for example
`/opt/waterfox`, `/usr/lib/firefox`, `C:\Program Files\Mozilla Firefox` or
`/Applications/Firefox.app/Contents/Resources`.

### After a browser update

Package managers and the built-in updater leave the extra files in place, so
normally nothing needs doing. If a browser update does remove them (a full
reinstall will), run the install script again.

### Already using autoconfig

Firefox loads a single `.cfg` file, named in `defaults/pref/autoconfig.js`.
If you already have one (fx-autoconfig, a userChrome.js loader, a corporate
policy file) the installer stops rather than replace it. To use both, copy
the `really-responsive-tabs/` directory into the application directory and add
the `try { ... }` block from `really-responsive-tabs.cfg` to the end of your
existing `.cfg`.

## Uninstall

```
./uninstall.sh /opt/waterfox
.\uninstall.ps1 "C:\Program Files\Mozilla Firefox"
```

## Settings reference

All of these live in `about:config` under `reallyResponsiveTabs.` and can be
edited there as well as in the settings window.

| Preference | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Master switch. |
| `mode` | `horizontal-when-narrow` | Or `vertical-when-short`. |
| `widthPercent` | `50` | Narrow mode: go horizontal at or below this share of the screen's width. |
| `heightPercent` | `50` | Short mode: go vertical at or below this share of the screen's height. |
| `slack` | `8` | Pixels of tolerance added to the threshold. |
| `showToolbarButton` | `true` | Show the toolbar button. |

## How it works

`really-responsive-tabs.cfg` runs once at startup. It registers the
`really-responsive-tabs/` directory as `chrome://really-responsive-tabs/` and
loads `main.js`, which listens for resize, maximise and focus events on
every browser window and sets `sidebar.verticalTabs` to suit. The setting is
global to the browser, so with several windows open the layout follows the
window you are working in. The settings page is plain HTML in the same
directory and talks to `main.js` through an object handed over when the
dialog is opened.

## Files

```
autoconfig.js                 -> <app>/defaults/pref/autoconfig.js   tells Firefox to run the .cfg
really-responsive-tabs.cfg      -> <app>/really-responsive-tabs.cfg      loader
really-responsive-tabs/main.js  the logic, toolbar button and menu entry
really-responsive-tabs/options.html, options.js, icon.svg, chrome.manifest
install.sh / uninstall.sh     Linux and macOS
install.ps1 / uninstall.ps1   Windows
```

## A note for Mozilla

This really belongs in the browser as a third choice next to Horizontal and
Vertical under Settings > Tab layout: **Automatic**, with the threshold
defaulting to half the screen width. The hard part is already there; all it
needs is a resize listener choosing the orientation per window. If you would
use it, say so on Mozilla Connect, that is where the Firefox UX team looks.

## Licence

MIT, see [LICENSE](LICENSE).
