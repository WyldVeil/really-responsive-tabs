// Auto Tab Orientation settings page. The API object comes from main.js via
// window.arguments; this page does no privileged work of its own.
(function () {
  const $ = (id) => document.getElementById(id);
  const api = window.arguments && window.arguments[0];
  if (!api) {
    $("error").style.display = "block";
    document.body.querySelectorAll(".card").forEach((c) => c.classList.add("disabled"));
    return;
  }
  $("version").textContent = api.VERSION;
  const owner = window.opener;

  function load() {
    const s = api.get();
    $("enabled").checked = s.enabled;
    $("showButton").checked = s.showButton;
    document.querySelector(`input[name=mode][value="${s.mode}"]`).checked = true;
    $("widthRange").value = $("widthPercent").value = s.widthPercent;
    $("heightRange").value = $("heightPercent").value = s.heightPercent;
    $("slack").value = s.slack;
    $("modeCard").classList.toggle("disabled", !s.enabled);
    $("widthBox").classList.toggle("disabled", s.mode !== "horizontal-when-narrow");
    $("heightBox").classList.toggle("disabled", s.mode !== "vertical-when-short");
  }

  function num(el, lo, hi) {
    const v = Math.round(Number(el.value));
    return Math.min(hi, Math.max(lo, isNaN(v) ? lo : v));
  }

  $("enabled").addEventListener("change", (e) => { api.set("enabled", e.target.checked); load(); });
  $("showButton").addEventListener("change", (e) => { api.set("showButton", e.target.checked); });
  for (const r of document.querySelectorAll("input[name=mode]")) {
    r.addEventListener("change", (e) => { api.set("mode", e.target.value); load(); });
  }
  const pair = (rangeId, numId, key) => {
    $(rangeId).addEventListener("input", (e) => { $(numId).value = e.target.value; api.set(key, num(e.target, 1, 100)); });
    $(numId).addEventListener("change", (e) => { const v = num(e.target, 1, 100); e.target.value = $(rangeId).value = v; api.set(key, v); });
  };
  pair("widthRange", "widthPercent", "widthPercent");
  pair("heightRange", "heightPercent", "heightPercent");
  $("slack").addEventListener("change", (e) => { const v = num(e.target, 0, 500); e.target.value = v; api.set("slack", v); });

  $("reset").addEventListener("click", () => { api.reset(); load(); });
  $("close").addEventListener("click", () => window.close());
  $("homepage").addEventListener("click", () => { api.openHomepage(owner); });

  function tick() {
    const st = api.status(owner);
    if (!st) { $("status").textContent = "The browser window that opened this page has gone."; return; }
    const pct = (a, b) => Math.round(a / b * 100);
    $("status").innerHTML =
      `Window <b>${st.width} × ${st.height}</b> on a <b>${st.screenWidth} × ${st.screenHeight}</b> screen ` +
      `(<b>${pct(st.width, st.screenWidth)}%</b> wide, <b>${pct(st.height, st.screenHeight)}%</b> tall). ` +
      `Wants <span class="pill">${st.wantVertical ? "vertical" : "horizontal"}</span>` +
      (st.overridden ? " but you overrode it by hand." : (st.isVertical === st.wantVertical ? "." : ", switching…"));
  }
  load();
  tick();
  setInterval(tick, 500);
})();
