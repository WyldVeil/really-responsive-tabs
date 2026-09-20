// Auto Tab Orientation loader. Installed to <app dir>/defaults/pref/autoconfig.js
// Tells Firefox to run auto-tab-orientation.cfg from the application directory
// at startup. The sandbox has to be off for the script to reach the browser UI.
pref("general.config.filename", "auto-tab-orientation.cfg");
pref("general.config.obscure_value", 0);
pref("general.config.sandbox_enabled", false);
