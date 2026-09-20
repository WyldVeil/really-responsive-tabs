// Auto Tab Orientation, main script. Runs once at browser startup with full
// chrome privileges (loaded by auto-tab-orientation.cfg). It watches every
// browser window and flips sidebar.verticalTabs to suit the window's size.
//
// Two modes:
//   horizontal-when-narrow  vertical tabs normally, horizontal tabs when the
//                           window is at or under N% of the screen's width
//   vertical-when-short     horizontal tabs normally, vertical tabs when the
//                           window is at or under N% of the screen's height
//
// If you flip the orientation by hand the script backs off until the window
// next crosses the threshold, so a manual choice sticks for as long as the
// window stays on the same side of it.

"use strict";

const VERSION = "1.0.0";
const HOMEPAGE = "https://github.com/WyldVeil/really-responsive-tabs";
const CHROME = "chrome://auto-tab-orientation/content/";

const BRANCH = "autoTabOrientation.";
const P = {
  enabled: BRANCH + "enabled",
  mode: BRANCH + "mode",
  widthPercent: BRANCH + "widthPercent",
  heightPercent: BRANCH + "heightPercent",
  slack: BRANCH + "slack",
  showButton: BRANCH + "showToolbarButton",
};
const VERTICAL = "sidebar.verticalTabs";
const REVAMP = "sidebar.revamp";

const BROWSER_URL = "chrome://browser/content/browser.xhtml";
const BUTTON_ID = "auto-tab-orientation-button";
const MENU_ID = "auto-tab-orientation-menuitem";

// Register defaults so the prefs show up in about:config with sane values.
{
  const d = Services.prefs.getDefaultBranch("");
  d.setBoolPref(P.enabled, true);
  d.setStringPref(P.mode, "horizontal-when-narrow");
  d.setIntPref(P.widthPercent, 50);
  d.setIntPref(P.heightPercent, 50);
  d.setIntPref(P.slack, 8);
  d.setBoolPref(P.showButton, true);
}

const settings = {
  get enabled() { return Services.prefs.getBoolPref(P.enabled); },
  get mode() { return Services.prefs.getStringPref(P.mode); },
  get widthPercent() { return clamp(Services.prefs.getIntPref(P.widthPercent), 1, 100); },
  get heightPercent() { return clamp(Services.prefs.getIntPref(P.heightPercent), 1, 100); },
  get slack() { return clamp(Services.prefs.getIntPref(P.slack), 0, 500); },
  get showButton() { return Services.prefs.getBoolPref(P.showButton); },
};

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

// What orientation this window's size calls for.
function wantVertical(win) {
  if (settings.mode === "vertical-when-short") {
    const limit = win.screen.availHeight * settings.heightPercent / 100;
    return win.outerHeight <= limit + settings.slack;
  }
  const limit = win.screen.availWidth * settings.widthPercent / 100;
  return win.outerWidth > limit + settings.slack;
}

function isVertical() {
  return Services.prefs.getBoolPref(VERTICAL, false);
}

// Set by us while we change the pref, so the observer can tell our writes
// from the user's.
let writing = false;
// When the user flips orientation by hand: the value wantVertical() had at
// that moment. We stay quiet until it changes.
let overrideSide = null;

function setVertical(v) {
  writing = true;
  try {
    if (v && !Services.prefs.getBoolPref(REVAMP, false)) {
      Services.prefs.setBoolPref(REVAMP, true);
    }
    Services.prefs.setBoolPref(VERTICAL, v);
  } finally {
    writing = false;
  }
}

function apply(win) {
  if (!settings.enabled || !win || win.closed) return;
  const want = wantVertical(win);
  if (overrideSide !== null) {
    if (want === overrideSide) return;
    overrideSide = null;
  }
  if (want !== isVertical()) setVertical(want);
}

function focusedWindow() {
  return Services.wm.getMostRecentWindow("navigator:browser");
}

Services.prefs.addObserver(VERTICAL, () => {
  if (writing) return;
  const win = focusedWindow();
  overrideSide = win ? wantVertical(win) : null;
});

Services.prefs.addObserver(BRANCH, () => {
  overrideSide = null;
  updateButton();
  apply(focusedWindow());
});

// ---- UI: toolbar button and Tools menu entry --------------------------------

// Imported on first use rather than at startup. The module moved from
// resource:/// to moz-src:/// during 2025, so try both.
let CustomizableUI = null;
function cui() {
  if (CustomizableUI) return CustomizableUI;
  for (const url of [
    "moz-src:///browser/components/customizableui/CustomizableUI.sys.mjs",
    "resource:///modules/CustomizableUI.sys.mjs",
  ]) {
    try {
      ({ CustomizableUI } = ChromeUtils.importESModule(url));
      return CustomizableUI;
    } catch (e) {
      // try the next one
    }
  }
  Cu.reportError("auto-tab-orientation: CustomizableUI not found, no toolbar button");
  return null;
}

let widgetCreated = false;
function ensureWidget() {
  if (!cui() || widgetCreated) return;
  widgetCreated = true;
  CustomizableUI.createWidget({
    id: BUTTON_ID,
    type: "button",
    label: "Auto Tab Orientation",
    tooltiptext: "Auto Tab Orientation settings",
    defaultArea: CustomizableUI.AREA_NAVBAR,
    onCommand(event) {
      openOptions(event.target.ownerGlobal);
    },
  });
}

function updateButton() {
  if (!cui()) return;
  const placement = CustomizableUI.getPlacementOfWidget(BUTTON_ID);
  if (settings.showButton) {
    ensureWidget();
    if (!placement) CustomizableUI.addWidgetToArea(BUTTON_ID, CustomizableUI.AREA_NAVBAR);
  } else if (placement) {
    CustomizableUI.removeWidgetFromArea(BUTTON_ID);
  }
}

const STYLE = `
  #${BUTTON_ID} .toolbarbutton-icon {
    list-style-image: url("${CHROME}icon.svg");
  }
`;
try {
  const sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
  const uri = Services.io.newURI("data:text/css;charset=utf-8," + encodeURIComponent(STYLE));
  if (!sss.sheetRegistered(uri, sss.AUTHOR_SHEET)) sss.loadAndRegisterSheet(uri, sss.AUTHOR_SHEET);
} catch (e) {
  Cu.reportError("auto-tab-orientation: stylesheet failed: " + e);
}

function addMenuItem(win) {
  const doc = win.document;
  const popup = doc.getElementById("menu_ToolsPopup");
  if (!popup || doc.getElementById(MENU_ID)) return;
  const item = doc.createXULElement("menuitem");
  item.id = MENU_ID;
  item.setAttribute("label", "Auto Tab Orientation…");
  item.addEventListener("command", () => openOptions(win));
  // On Windows and macOS the Tools menu ends with a separator and Settings;
  // put the entry just above them. On Linux those live in Edit, so append.
  const anchor = doc.getElementById("prefSep");
  popup.insertBefore(item, anchor && anchor.parentNode === popup ? anchor : null);
}

// ---- options dialog ----------------------------------------------------------

const api = {
  VERSION,
  HOMEPAGE,
  prefs: P,
  get: () => ({
    enabled: settings.enabled,
    mode: settings.mode,
    widthPercent: settings.widthPercent,
    heightPercent: settings.heightPercent,
    slack: settings.slack,
    showButton: settings.showButton,
  }),
  set(key, value) {
    const name = P[key];
    if (!name) return;
    if (typeof value === "boolean") Services.prefs.setBoolPref(name, value);
    else if (typeof value === "number") Services.prefs.setIntPref(name, value);
    else Services.prefs.setStringPref(name, String(value));
  },
  reset() {
    for (const name of Object.values(P)) Services.prefs.clearUserPref(name);
  },
  // Live readout for the settings page.
  status(win) {
    if (!win || win.closed) return null;
    return {
      width: win.outerWidth,
      height: win.outerHeight,
      screenWidth: win.screen.availWidth,
      screenHeight: win.screen.availHeight,
      wantVertical: wantVertical(win),
      isVertical: isVertical(),
      overridden: overrideSide !== null,
    };
  },
  openHomepage(win) {
    win.switchToTabHavingURI(HOMEPAGE, true);
  },
};

function openOptions(win) {
  const existing = Services.wm.getMostRecentWindow("auto-tab-orientation:options");
  if (existing) {
    existing.focus();
    return;
  }
  win.openDialog(CHROME + "options.html", "auto-tab-orientation-options",
    "chrome,dialog=no,centerscreen,resizable=yes,width=520,height=560", api);
}

// ---- per-window wiring ------------------------------------------------------

function attach(win) {
  let timer = null;
  const later = () => {
    win.clearTimeout(timer);
    timer = win.setTimeout(() => apply(win), 150);
  };
  win.addEventListener("resize", later);
  win.addEventListener("sizemodechange", later);
  win.addEventListener("activate", later);
  win.addEventListener("unload", () => win.clearTimeout(timer), { once: true });

  try {
    addMenuItem(win);
    updateButton();
  } catch (e) {
    Cu.reportError("auto-tab-orientation: UI setup failed: " + e);
  }
  win.setTimeout(() => apply(win), 500);
}

Services.obs.addObserver({
  observe(subject) {
    const win = subject;
    win.addEventListener("DOMContentLoaded", () => {
      if (win.location.href === BROWSER_URL) attach(win);
    }, { once: true });
  },
}, "chrome-document-global-created");

for (const win of Services.wm.getEnumerator("navigator:browser")) {
  if (win.document.readyState === "complete") attach(win);
}
