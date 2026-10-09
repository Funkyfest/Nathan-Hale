import * as THREE from "three";
/*__SCENES__*/
const TIMELINE = /*__TIMELINE__*/null;
const POSTERS = /*__POSTERS__*/{};
const AUDIO_BASE = "audio/";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = () => innerWidth < 700;
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ------------------------------------------------------------------ stops (every element that steers the camera)
const num = s => s.split(",").map(Number);
const stops = $$("[data-scene]").map(el => ({
  el, scene: el.dataset.scene, cam: num(el.dataset.cam), target: num(el.dataset.target),
  lift: el.dataset.lift != null ? +el.dataset.lift : null, pull: el.dataset.pull != null ? +el.dataset.pull : null,
  labels: (el.dataset.labels || "").split("|").filter(Boolean), flow: el.dataset.flow === "1",
  dim: el.dataset.dim === "1", orbit: el.dataset.orbit === "1",
}));
function activeStop() {
  const mid = innerHeight / 2;
  let i = 0;
  for (let k = 0; k < stops.length; k++) if (stops[k].el.getBoundingClientRect().top <= mid) i = k;
  const r = stops[i].el.getBoundingClientRect();
  return { i, t: clamp((mid - r.top) / Math.max(1, r.height), 0, 1) };
}

// ------------------------------------------------------------------ renderer
const stage = $("#stage"), veil = $("#veil"), labelsEl = $("#labels"), svgL = $("#labels svg");
let ren = null;
try {
  const canvas = document.createElement("canvas");
  stage.prepend(canvas);
  ren = makeRenderer(THREE, canvas, innerWidth, innerHeight, Math.min(devicePixelRatio, small() ? 1.25 : 1.6));
  ren.shadowMap.autoUpdate = true;
} catch (e) { ren = null; }

const darkQ = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === "dark" : darkQ.matches; };

// ------------------------------------------------------------------ worlds (one per scene, built lazily)
const worlds = {};
function world(name) {
  if (worlds[name]) return worlds[name];
  const r = buildScene(THREE, name);
  const w = { name, r, flows: [], tags: [], lift: r.anim.lift ?? 0, pull: r.anim.pull ?? 0, fanSpin: 0 };
  r.scene.traverse(o => {
    if (o.isLight) o.userData.base = { i: o.intensity, c: o.color.clone() };
    if (o.isDirectionalLight && o.castShadow) o.shadow.mapSize.set(small() ? 1024 : 2048, small() ? 1024 : 2048);
    if (o.isMesh && o.material && o.material.emissiveMap) o.userData.screen = true;
  });
  // coolant / fibre / power particles
  const defs = [...(r.anim.flows || [])];
  for (const pts of r.anim.lines || []) defs.push({ pts: pts.map(v => [v.x, v.y, v.z]), color: 0xf2b33d, r: 1.1, n: 5, glow: true, power: true });
  for (const d of defs) {
    const P = d.pts.map(p => new THREE.Vector3(...p)), seg = [], cum = [0];
    for (let k = 1; k < P.length; k++) { seg.push(P[k].distanceTo(P[k - 1])); cum.push(cum[k - 1] + seg[k - 1]); }
    const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(d.r * 0.55, 10, 8),
      new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.95, toneMapped: false }), d.n);
    mesh.frustumCulled = false; r.scene.add(mesh);
    w.flows.push({ ...d, P, cum, len: cum[cum.length - 1], mesh });
  }
  // labels as persistent DOM
  const NS = "http://www.w3.org/2000/svg";
  for (const L of r.labels) {
    const tag = document.createElement("div"); tag.className = "tag";
    tag.innerHTML = `${L.t}${L.s ? `<small>${L.s}</small>` : ""}`; tag.hidden = true; labelsEl.append(tag);
    const line = document.createElementNS(NS, "line"), dot = document.createElementNS(NS, "circle"); dot.setAttribute("r", "3.5");
    svgL.append(line, dot); line.style.display = dot.style.display = "none";
    w.tags.push({ L, tag, line, dot, v: new THREE.Vector3() });
  }
  mood(w);
  worlds[name] = w;
  return w;
}
function skyFor(w, dark) {
  return skyTexture(THREE, dark ? [0x0a1220, 0x1b2535] : w.r.sky);
}
function mood(w) {
  const dark = isDark();
  w.dark = dark;
  w.r.scene.background = skyFor(w, dark);
  if (w.r.scene.fog) w.r.scene.fog.color.set(dark ? 0x141d2b : 0xe3e9ef);
  w.r.scene.traverse(o => {
    if (o.isLight && o.userData.base) {
      const b = o.userData.base;
      o.intensity = b.i * (dark ? (o.isHemisphereLight ? 0.32 : 0.42) : 1);
      o.color.copy(b.c); if (dark) o.color.lerp(new THREE.Color(0x9fb4ff), 0.45);
    }
    if (o.userData.screen) o.material.emissiveIntensity = dark ? 1.2 : 0.35;
    if (o.userData.grid) { o.material.transparent = true; o.material.opacity = dark ? 0.12 : 0.6; }
    // pale surfaces (floors, walls, ground) glare under the night rig, so darken them
    if (o.isMesh && o.material && o.material.color && !o.userData.screen && !o.isInstancedMesh) {
      const m = o.material; m.userData.base ??= m.color.clone();
      const hsl = {}; m.userData.base.getHSL(hsl);
      m.color.copy(m.userData.base); if (dark && hsl.l > 0.55) m.color.multiplyScalar(0.42);
    }
  });
  for (const f of w.flows) f.mesh.material.opacity = dark ? 1 : 0.9;
}
const remood = () => Object.values(worlds).forEach(mood);
darkQ.addEventListener?.("change", remood);
new MutationObserver(remood).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

// ------------------------------------------------------------------ camera + frame loop
let cur = null;                       // current world
const cam = { p: new THREE.Vector3(), t: new THREE.Vector3(), gp: new THREE.Vector3(), gt: new THREE.Vector3(), snap: true };
let goal = { lift: null, pull: null, labels: [], flow: false, orbit: false };
let swapping = false, last = performance.now(), clock = 0, orbitA = 0;

function computeGoal() {
  const { i, t } = activeStop();
  const a = stops[i], b = stops[i + 1];
  const e = reduce ? 0 : (b && b.scene === a.scene ? smooth(0.5, 1, t) : 0);
  const mix = (x, y) => x.map((v, k) => v + ((y ? y[k] : v) - v) * e);
  const m = (x, y) => (x == null ? y : y == null ? x : x + (y - x) * e);
  cam.gp.set(...mix(a.cam, b && b.scene === a.scene ? b.cam : null));
  cam.gt.set(...mix(a.target, b && b.scene === a.scene ? b.target : null));
  goal = { scene: a.scene, lift: m(a.lift, b && b.scene === a.scene ? b.lift : null), pull: m(a.pull, b && b.scene === a.scene ? b.pull : null),
    labels: e > 0.5 && b ? b.labels : a.labels, flow: a.flow || (e > 0.5 && b && b.flow), orbit: a.orbit, dim: a.dim, i };
  document.body.dataset.dim = a.dim ? "1" : "0";
  return goal;
}

function switchTo(name) {
  if (swapping) return;
  if (!ren) { const p = $("#stage img.poster"); if (POSTERS[name]) p.src = POSTERS[name]; cur = { name }; return; }
  if (!cur) { cur = world(name); hideTags(); cam.snap = true; return; }
  swapping = true; veil.classList.add("on");
  setTimeout(() => {
    hideTags(); cur = world(name); cam.snap = true; computeGoal(); frame(performance.now(), true);
    veil.classList.remove("on"); swapping = false;
  }, reduce ? 0 : 280);
}
function hideTags() { if (!cur || !cur.tags) return; for (const g of cur.tags) { g.tag.hidden = true; g.line.style.display = g.dot.style.display = "none"; } }

const tmp = new THREE.Vector3(), dummy = new THREE.Object3D();
function frame(now, force) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
  computeGoal();
  if (!cur || cur.name !== goal.scene) switchTo(goal.scene);
  if (!ren || !cur || !cur.r || swapping) return;
  const w = cur, r = w.r;
  // orbit
  if (goal.orbit && !reduce) orbitA += dt * 0.035; else orbitA *= 0.96;
  const gp = cam.gp.clone().sub(cam.gt).applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitA).add(cam.gt);
  const k = cam.snap || reduce ? 1 : 1 - Math.exp(-dt * 3.2);
  cam.p.lerp(gp, k); cam.t.lerp(cam.gt, k); cam.snap = false;
  r.camera.position.copy(cam.p); r.camera.lookAt(cam.t);
  // roof + tray
  if (r.anim.roof && goal.lift != null) { w.lift += (goal.lift - w.lift) * (reduce ? 1 : 1 - Math.exp(-dt * 2.5)); r.anim.roof.position.y = w.lift; r.anim.guides.scale.y = Math.max(0.001, w.lift); r.anim.guides.visible = w.lift > 0.5; }
  if (r.anim.tray && goal.pull != null) { w.pull += (goal.pull - w.pull) * (reduce ? 1 : 1 - Math.exp(-dt * 3)); r.anim.tray.position.z = w.pull; }
  // fans + flows
  if (!reduce) for (const f of r.anim.fans) f.rotation.y += dt * 7;
  for (const f of w.flows) {
    const on = f.power ? true : goal.flow || w.name === "cutaway";
    f.mesh.visible = on && !reduce;
    if (!f.mesh.visible) continue;
    const speed = f.power ? 60 : f.glow ? 3.2 : 1.1;
    for (let n = 0; n < f.n; n++) {
      let d = ((n / f.n) * f.len + clock * speed) % f.len, s = 1;
      while (s < f.cum.length - 1 && f.cum[s] < d) s++;
      const a = f.P[s - 1], b = f.P[s], u = (d - f.cum[s - 1]) / (f.cum[s] - f.cum[s - 1] || 1);
      dummy.position.lerpVectors(a, b, u); dummy.updateMatrix(); f.mesh.setMatrixAt(n, dummy.matrix);
    }
    f.mesh.instanceMatrix.needsUpdate = true;
  }
  ren.render(r.scene, r.camera);
  stage.classList.add("live");
  // labels
  const W = innerWidth, H = innerHeight, kk = clamp(W / 1600, 0.55, 1);
  for (const g of w.tags) {
    const want = goal.labels.some(p => g.L.t.startsWith(p));
    g.v.set(...g.L.p).project(r.camera);
    const ax = (g.v.x * 0.5 + 0.5) * W, ay = (-g.v.y * 0.5 + 0.5) * H;
    const vis = want && g.v.z < 1 && ax > 0 && ax < W && ay > 0 && ay < H;
    if (!vis) { if (!g.tag.hidden) { g.tag.classList.remove("on"); g.tag.hidden = true; g.line.style.display = g.dot.style.display = "none"; } continue; }
    const lx = ax + g.L.o[0] * kk, ly = ay + g.L.o[1] * kk;
    if (g.tag.hidden) { g.tag.hidden = false; g.line.style.display = g.dot.style.display = ""; requestAnimationFrame(() => { g.tag.classList.add("on"); g.line.classList.add("on"); g.dot.classList.add("on"); }); }
    g.tag.style.transform = `translate(${lx}px, ${ly}px) translate(${g.L.o[0] < 0 ? "-100%" : "0"}, -50%)`;
    g.line.setAttribute("x1", ax); g.line.setAttribute("y1", ay); g.line.setAttribute("x2", lx); g.line.setAttribute("y2", ly);
    g.dot.setAttribute("cx", ax); g.dot.setAttribute("cy", ay);
  }
}
function loop(now) { frame(now); requestAnimationFrame(loop); }
addEventListener("resize", () => {
  if (!ren) return;
  ren.setSize(innerWidth, innerHeight, false);
  for (const w of Object.values(worlds)) { w.r.camera.aspect = innerWidth / innerHeight; w.r.camera.updateProjectionMatrix(); }
});
if (ren) { const w0 = world(stops[0].scene); w0.r.camera.aspect = innerWidth / innerHeight; w0.r.camera.updateProjectionMatrix(); }
const origWorld = world;
requestAnimationFrame(loop);
// make every lazily built world match the viewport, and warm the next scenes while idle
const ensureAspect = () => { for (const w of Object.values(worlds)) if (Math.abs(w.r.camera.aspect - innerWidth / innerHeight) > 1e-3) { w.r.camera.aspect = innerWidth / innerHeight; w.r.camera.updateProjectionMatrix(); } };
setInterval(ensureAspect, 500);
if (ren) (window.requestIdleCallback || setTimeout)(() => ["cutaway", "hall", "rack", "pod"].forEach((n, i) => setTimeout(() => { origWorld(n); ensureAspect(); }, 400 * (i + 1))));

// ------------------------------------------------------------------ chrome: nav dots, present mode, labels, keys
const acts = [$("#top"), ...$$("section.act")];
const nav = $("nav.acts");
for (const a of acts) { const l = document.createElement("a"); l.href = "#" + a.id; l.innerHTML = `<span>${a.dataset.title}</span>`; l.setAttribute("aria-label", a.dataset.title); nav.append(l); }
const dots = $$("a", nav);
function markNav() { const mid = innerHeight / 2; let k = 0; acts.forEach((a, i) => { if (a.getBoundingClientRect().top <= mid) k = i; }); dots.forEach((d, i) => d.setAttribute("aria-current", i === k ? "true" : "false")); }
addEventListener("scroll", () => { markNav(); if (!CSS.supports("animation-timeline: scroll()")) document.querySelector(".progress").style.setProperty("--p", scrollY / (document.documentElement.scrollHeight - innerHeight)); }, { passive: true });
markNav();

function toggle(btn, fn) { const on = btn.getAttribute("aria-pressed") !== "true"; btn.setAttribute("aria-pressed", on); fn(on); }
const presentBtn = $("#present"), labelsBtn = $("#labelsBtn");
const setPresent = on => { const go = () => document.body.classList.toggle("present", on); document.startViewTransition && !reduce ? document.startViewTransition(go) : go(); };
presentBtn.onclick = () => toggle(presentBtn, setPresent);
labelsBtn.onclick = () => toggle(labelsBtn, on => (document.body.dataset.labels = on ? "on" : "off"));
$("#help").onclick = () => $("#keys").showModal();
$("#keys button").onclick = () => $("#keys").close();

function go(dir) {
  const { i } = activeStop();
  const j = clamp(i + dir, 0, stops.length - 1);
  const el = stops[j].el, r = el.getBoundingClientRect();
  const top = scrollY + r.top + Math.min(r.height, innerHeight * 1.2) / 2 - innerHeight / 2 + (r.height > innerHeight * 1.2 ? 0 : 0);
  scrollTo({ top: j === 0 ? 0 : top, behavior: reduce ? "auto" : "smooth" });
  userMoved();
}
addEventListener("keydown", e => {
  if (e.target.closest("input, select, textarea, [role=slider]") || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
  const k = e.key;
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(k)) { e.preventDefault(); go(1); }
  else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(k)) { e.preventDefault(); go(-1); }
  else if (k === "p" || k === "P") presentBtn.click();
  else if (k === "l" || k === "L") labelsBtn.click();
  else if (k === "m" || k === "M") $("#play").click();
  else if (k === "t" || k === "T") $("#tx").click();
  else if (k === "?") $("#help").click();
});

// ------------------------------------------------------------------ voltage ladder
(() => {
  const rows = [["Transmission line", "into the substation", 230000], ["Medium voltage", "around the campus", 34500],
    ["Low voltage", "switchboards and UPS", 480], ["Rack busbar", "DC, up the back of the rack", 50], ["At the chip", "after the voltage regulator", 0.8]];
  const vmax = Math.log10(230000 / 0.3), imax = Math.log10(1.25e6);
  $("#ladder").innerHTML = rows.map(([a, b, v]) => {
    const amps = 1e6 / v, vw = (Math.log10(v / 0.3) / vmax) * 100;
    const vt = v >= 1000 ? `${fmt(v / 1000, v % 1000 ? 1 : 0)} kV` : `${fmt(v, v < 1 ? 1 : 0)} V`;
    const at = amps >= 1e6 ? `${fmt(amps / 1e6, 2)} million A` : `${fmt(amps, amps < 100 ? 1 : 0)} A`;
    return `<div class="rung"><div class="what">${a}<small>${b}</small></div><div class="bar" style="--w:${vw.toFixed(1)}%"><i></i><em>${vt}</em></div><div class="amps">${at}<small>for 1 MW</small></div></div>`;
  }).join("");
})();

// ------------------------------------------------------------------ cooling loop (animated SVG)
(() => {
  const S = "var(--supply)", R = "var(--return)";
  const node = (x, y, w, h, t, s) => `<rect class="node" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text x="${x + w / 2}" y="${y + h / 2 - 2}" text-anchor="middle">${t}</text><text class="s" x="${x + w / 2}" y="${y + h / 2 + 16}" text-anchor="middle">${s}</text>`;
  const loopPath = (x1, x2) => [`M${x2},90 H${x1}`, `M${x1},250 H${x2}`];
  const [t1, t2] = loopPath(150, 380), [f1, f2] = loopPath(460, 690);
  $("#loop").innerHTML = `<svg viewBox="0 0 820 340" role="img" aria-label="Animated cooling loops: cold plates to CDU to dry cooler">
    <path class="pipe" d="${t1}" stroke="${S}"/><path class="pipe" d="${t2}" stroke="${R}"/>
    <path class="pipe" d="M150,90 V250" stroke="${R}" opacity=".55"/><path class="pipe" d="M690,90 V250" stroke="${S}" opacity=".55"/>
    <path class="pipe" d="${f1}" stroke="${S}"/><path class="pipe" d="${f2}" stroke="${R}"/>
    <path class="flow" d="${t1}"/><path class="flow" d="${t2}"/><path class="flow slow" d="${f1}"/><path class="flow slow" d="${f2}"/>
    ${node(40, 120, 150, 100, "Cold plates", "on every GPU")}
    ${node(330, 120, 160, 100, "CDU", "heat exchanger")}
    ${node(640, 120, 150, 100, "Dry cooler", "outside air · fans")}
    <text class="t" x="265" y="74" text-anchor="middle" fill="${S}" style="fill:${S}">35 °C →</text>
    <text class="t" x="265" y="282" text-anchor="middle" style="fill:${R}">← 45 °C</text>
    <text class="t" x="575" y="74" text-anchor="middle" style="fill:${S}">← 32 °C</text>
    <text class="t" x="575" y="282" text-anchor="middle" style="fill:${R}">42 °C →</text>
    <text class="s" x="265" y="320" text-anchor="middle">rack loop · clean, treated water</text>
    <text class="s" x="575" y="320" text-anchor="middle">facility loop · building water</text>
    <text class="s" x="715" y="40" text-anchor="middle">outside air ≈ 25 °C</text></svg>`;
})();

// ------------------------------------------------------------------ density chart
(() => {
  const W = 960, H = 420, x0 = 70, x1 = 940, y0 = 360, y1 = 40, lo = Math.log10(2), hi = Math.log10(1500);
  const Y = v => y0 - (Math.log10(v) - lo) / (hi - lo) * (y0 - y1);
  const yrs = [2016, 2018, 2020, 2022, 2024, 2026, 2028], X = i => x0 + 50 + i * ((x1 - x0 - 100) / 6);
  const cloud = [6, 7, 8, 10, 12, 15, 18], ai = [[13, "DGX-1"], [24, "DGX-2"], [26, "DGX A100"], [41, "DGX H100"], [132, "GB200 NVL72"], [190, "est."], [600, "target"]];
  let g = `<rect class="band" x="${x0}" y="${Y(45)}" width="${x1 - x0}" height="${Y(30) - Y(45)}"/><text class="bandt" x="${x0 + 8}" y="${Y(45) - 6}">air-cooling limit ≈ 30–45 kW</text>`;
  for (const v of [3, 10, 30, 100, 300, 1000]) g += `<line class="grid" x1="${x0}" x2="${x1}" y1="${Y(v)}" y2="${Y(v)}"/><text class="axis" x="${x0 - 8}" y="${Y(v) + 4}" text-anchor="end">${v >= 1000 ? "1 MW" : v + " kW"}</text>`;
  yrs.forEach((yr, i) => {
    const cx = X(i), bw = 30;
    g += `<rect class="bar cloud" x="${cx - bw - 2}" y="${Y(cloud[i])}" width="${bw}" height="${y0 - Y(cloud[i])}"/>`;
    const [v, n] = ai[i];
    g += `<rect class="bar ai${yr >= 2026 ? " proj" : ""}" x="${cx + 2}" y="${Y(v)}" width="${bw}" height="${y0 - Y(v)}"/>`;
    g += `<text class="val" x="${cx + bw / 2 + 2}" y="${Y(v) - 20}" text-anchor="middle">${v}</text><text class="nm" x="${cx + bw / 2 + 2}" y="${Y(v) - 7}" text-anchor="middle">${n}</text>`;
    g += `<text class="axis" x="${cx}" y="${y0 + 22}" text-anchor="middle">${yr}</text>`;
  });
  g += `<rect class="cloud" x="${x0 + 10}" y="${H - 22}" width="12" height="10"/><text class="axis" x="${x0 + 28}" y="${H - 13}">cloud rack</text>
        <rect class="ai" x="${x0 + 130}" y="${H - 22}" width="12" height="10"/><text class="axis" x="${x0 + 148}" y="${H - 13}">AI rack (kW)</text>
        <rect class="ai proj" x="${x0 + 270}" y="${H - 22}" width="12" height="10"/><text class="axis" x="${x0 + 288}" y="${H - 13}">projected</text>`;
  const chart = $("#chart");
  chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rack power density 2016 to 2028, log scale">${g}</svg>`;
  $$("rect.bar", chart).forEach((b, i) => b.style.setProperty("--d", (i * 0.06).toFixed(2) + "s"));
  if ("IntersectionObserver" in window && !reduce && chart.getBoundingClientRect().top > innerHeight) {
    chart.classList.add("pre");
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { chart.classList.remove("pre"); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(chart);
  }
})();

// ------------------------------------------------------------------ rail network explorer
(() => {
  const host = $("#rails"), out = $("#railOut");
  let mode = "rail", pick = [0, 0];
  const S = 4, G = 8, Wd = 900, srvW = 196, gap = 16;
  const sx = s => 30 + s * (srvW + gap), gx = (s, g) => sx(s) + 12 + g * 22.5;
  function draw() {
    const leaves = mode === "rail" ? G : S;
    const lx = i => mode === "rail" ? 60 + i * 110 : 130 + i * 205;
    let h = `<text class="lab" x="10" y="20">${mode === "rail" ? "RAIL LEAF SWITCHES" : "SPINE"}</text>`;
    if (mode === "plain") { for (const k of [0, 1]) h += `<g class="sw" data-sp="${k}"><rect class="box" x="${300 + k * 220}" y="28" width="90" height="30" rx="6"/><text x="${345 + k * 220}" y="47" text-anchor="middle">Spine ${k + 1}</text></g>`; h += `<text class="lab" x="10" y="110">TOP-OF-RACK SWITCHES</text>`; }
    const ly = mode === "rail" ? 40 : 120;
    let wires = "";
    for (let s = 0; s < S; s++) for (let g = 0; g < G; g++) {
      const L = mode === "rail" ? g : s;
      const hot = mode === "rail" ? g === pick[1] : (s === pick[0] && g === pick[1]) || g === pick[1];
      wires += `<line class="wire${hot ? " hot" : ""}" x1="${gx(s, g) + 9}" y1="300" x2="${lx(L) + 40}" y2="${ly + 30}"/>`;
    }
    if (mode === "plain") for (let i = 0; i < S; i++) for (const k of [0, 1]) wires += `<line class="wire hot" x1="${lx(i) + 40}" y1="${ly}" x2="${345 + k * 220}" y2="58"/>`;
    h = wires + h;
    for (let i = 0; i < leaves; i++) {
      const hot = mode === "rail" ? i === pick[1] : true;
      h += `<g class="sw${hot ? " hot" : ""}"><rect class="box" x="${lx(i)}" y="${ly}" width="80" height="30" rx="6"/><text x="${lx(i) + 40}" y="${ly + 19}" text-anchor="middle">${mode === "rail" ? "Rail " + i : "ToR " + (i + 1)}</text></g>`;
    }
    h += `<text class="lab" x="10" y="290">SERVERS · 8 GPUs EACH</text>`;
    for (let s = 0; s < S; s++) {
      h += `<rect class="box" x="${sx(s)}" y="296" width="${srvW}" height="72" rx="9"/><text x="${sx(s) + srvW / 2}" y="358" text-anchor="middle">Server ${s + 1}</text>`;
      for (let g = 0; g < G; g++) {
        const hot = g === pick[1];
        h += `<g class="gpu${hot ? " hot" : ""}" data-s="${s}" data-g="${g}" tabindex="0" role="button" aria-label="GPU ${g} in server ${s + 1}"><rect class="box" x="${gx(s, g)}" y="304" width="18" height="30" rx="3"/><text x="${gx(s, g) + 9}" y="324" text-anchor="middle">${g}</text></g>`;
      }
    }
    host.innerHTML = `<svg viewBox="0 0 ${Wd} 380" role="img" aria-label="Network diagram">${h}</svg>`;
    const hops = mode === "rail" ? 1 : 3;
    out.innerHTML = `GPU ${pick[1]} talks to GPU ${pick[1]} in every other server: <b>${hops} switch hop${hops > 1 ? "s" : ""}</b>${mode === "rail" ? " through one rail switch" : " (ToR → spine → ToR)"}`;
  }
  host.addEventListener("click", e => { const g = e.target.closest(".gpu"); if (g) { pick = [+g.dataset.s, +g.dataset.g]; draw(); } });
  host.addEventListener("keydown", e => { const g = e.target.closest(".gpu"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick = [+g.dataset.s, +g.dataset.g]; draw(); host.querySelector(`.gpu[data-s="${pick[0]}"][data-g="${pick[1]}"]`)?.focus(); } });
  $$(".seg button").forEach(b => b.onclick = () => { mode = b.dataset.mode; $$(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); });
  draw();
})();

// ------------------------------------------------------------------ hall-sizing calculator
(() => {
  const el = id => $("#" + id);
  const cards = [
    ["racks", "Racks", "", ""], ["gpus", "GPUs", "", ""], ["fac", "Power at the meter", "MW", "power"], ["energy", "Energy per year", "TWh", "power"],
    ["bill", "Power bill per year", "US$ million", "money"], ["flow", "Coolant flow", "litres per second", "water"], ["air", "Airflow", "m³ per second", "water"],
    ["gens", "Generators", "3 MW units, N+1", ""], ["batt", "Battery ride-through", "MWh for 5 minutes", "power"], ["space", "White space", "m²", ""],
    ["weight", "Rack weight", "tonnes", ""], ["capex", "Build cost", "US$ billion", "money"]];
  el("outs").innerHTML = cards.map(([k, t, u, c]) => `<div class="out ${c}"><div class="u">${t}</div><div class="v" id="v-${k}">–</div><div class="u">${u}</div><div class="n" id="n-${k}"></div></div>`).join("");
  const shown = {};
  function tween(k, v, d) {
    const node = el("v-" + k), from = shown[k] ?? v, t0 = performance.now();
    shown[k] = v;
    if (reduce) { node.textContent = fmt(v, d); return; }
    const step = now => { const u = Math.min(1, (now - t0) / 450), e = 1 - Math.pow(1 - u, 3); node.textContent = fmt(from + (v - from) * e, d); if (u < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  const RACK = { 132: { cost: 3.5, t: 1.4, area: 3.0, liquid: 0.85 }, 41: { cost: 1.4, t: 1.1, area: 2.6, liquid: 0 }, 190: { cost: 4.5, t: 1.6, area: 3.0, liquid: 0.88 }, 600: { cost: 12, t: 3.0, area: 3.6, liquid: 0.95 } };
  function calc() {
    const raw = 10 * Math.pow(100, el("c-mw").value / 100);
    const mw = raw < 50 ? Math.round(raw) : raw < 200 ? Math.round(raw / 5) * 5 : Math.round(raw / 10) * 10;
    const [kw, g] = el("c-rack").value.split("|").map(Number), R = RACK[kw];
    const pue = el("c-pue").value / 100, price = +el("c-price").value, dT = +el("c-dt").value;
    el("o-mw").textContent = mw >= 1000 ? `${fmt(mw / 1000, 1)} GW` : `${fmt(mw)} MW`;
    el("o-pue").textContent = pue.toFixed(2); el("o-price").textContent = `${price}¢`; el("o-dt").textContent = `${dT} K`;
    const racks = Math.ceil(mw * 1000 / kw), gpus = racks * g, fac = mw * pue, twh = fac * 0.85 * 8760 / 1e6;
    const liquid = mw * R.liquid, airMW = mw - liquid;
    const flow = liquid * 1000 / (4.186 * dT), air = airMW * 1000 / (1.2 * 1.005 * 12);
    const vals = { racks: [racks, 0], gpus: [gpus, 0], fac: [fac, 0], energy: [twh, 2], bill: [twh * 1e9 * price / 100 / 1e6, 0], flow: [flow, 0], air: [air, 0],
      gens: [Math.ceil(fac / 3 * 1.1), 0], batt: [mw * 5 / 60, 1], space: [racks * R.area, 0], weight: [racks * R.t, 0], capex: [(mw * 13e6 + racks * R.cost * 1e6 * 1.12) / 1e9, 1] };
    for (const [k, [v, d]] of Object.entries(vals)) tween(k, v, d);
    el("n-energy").textContent = `≈ ${fmt(twh * 1e9 / 10500 / 1000, 0)}k US homes`;
    el("n-flow").textContent = liquid ? `an Olympic pool every ${fmt(2.5e6 / flow / 60, 0)} min` : "air-cooled: no liquid loop";
    el("n-space").textContent = `≈ ${fmt(racks * R.area / 261, 0)} tennis courts`;
    el("n-capex").textContent = `building ≈ $${fmt(mw * 13e6 / 1e9, 1)}B · IT ≈ $${fmt(racks * R.cost * 1.12 / 1e3, 1)}B`;
    el("n-gpus").textContent = `${fmt(Math.round(racks / 8))} pods of 8 racks`;
    el("n-bill").textContent = `at ${price}¢/kWh and 85% load`;
  }
  $$("#calc input, #calc select").forEach(i => i.addEventListener("input", calc));
  el("calc").addEventListener("submit", e => e.preventDefault());
  calc();
})();

// ------------------------------------------------------------------ podcast dock
const audio = $("#audio"), playBtn = $("#play"), icon = $("#playIcon"), scrub = $("#scrub"), fill = $(".scrub .fill", scrub);
const txBtn = $("#tx"), txBody = $("#txBody"), followBtn = $("#follow"), speedBtn = $("#speed"), err = $("#audioErr");
const CH = TIMELINE ? TIMELINE.chapters : [];
const TOTAL = TIMELINE ? TIMELINE.duration : 0;
const ACT_OF = { intro: "top", foundations: "act-campus", siting: "act-campus", power: "act-power", cooling: "act-cooling", whitespace: "act-rack",
  network: "act-pod", aifactory: "act-density", operations: "act-ops", money: "act-calc", outro: "act-future" };
let chi = 0, lastUser = 0, curLine = null, lastFollow = "";
function userMoved() { lastUser = performance.now(); }
addEventListener("wheel", userMoved, { passive: true }); addEventListener("touchmove", userMoved, { passive: true });
if (!TIMELINE) { $("#dock").hidden = true; }
for (const c of CH) { const t = document.createElement("div"); t.className = "tick"; t.style.left = (c.start / TOTAL * 100) + "%"; scrub.append(t); }
txBody.innerHTML = CH.map((c, i) => `<section><h4>${c.title}</h4>` + c.lines.map((l, j) => `<p data-c="${i}" data-l="${j}"><b>${l.speaker[0] + l.speaker.slice(1).toLowerCase()}</b>${l.text}</p>`).join("") + "</section>").join("");
const lineEls = $$("p", txBody);
function load(i, at = 0, play = true) {
  chi = i; const c = CH[i];
  if (!audio.src.endsWith(c.file.split("/").pop())) { audio.src = AUDIO_BASE + c.file.split("/").pop(); audio.load(); }
  const start = () => { try { audio.currentTime = at; } catch {} if (play) audio.play().catch(showErr); };
  if (audio.readyState >= 1) start(); else audio.addEventListener("loadedmetadata", start, { once: true });
  $("#nowT").textContent = c.title; mediaMeta();
}
function showErr() { err.hidden = false; err.textContent = "Audio didn't load here. The MP3 is in the repository under docs/podcast/."; }
audio.addEventListener("error", showErr);
playBtn.onclick = () => { if (!audio.src) load(0); else if (audio.paused) audio.play().catch(showErr); else audio.pause(); };
audio.addEventListener("play", () => { icon.setAttribute("d", "M3 1.5h3.5v13H3zM9.5 1.5H13v13H9.5z"); playBtn.setAttribute("aria-label", "Pause podcast"); });
audio.addEventListener("pause", () => { icon.setAttribute("d", "M3 1.5v13l11-6.5z"); playBtn.setAttribute("aria-label", "Play podcast"); });
audio.addEventListener("ended", () => { if (chi < CH.length - 1) load(chi + 1, 0, true); });
const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.85]; let si = 0;
speedBtn.onclick = () => { si = (si + 1) % SPEEDS.length; audio.playbackRate = SPEEDS[si]; speedBtn.textContent = SPEEDS[si] + "×"; };
txBtn.onclick = () => toggle(txBtn, () => {});
followBtn.onclick = () => toggle(followBtn, on => { if (on) lastUser = 0; });
txBody.addEventListener("click", e => { const p = e.target.closest("p"); if (!p) return; const c = +p.dataset.c, l = CH[c].lines[+p.dataset.l]; load(c, l.start, true); });
function seekFrac(f) { const t = clamp(f, 0, 0.999) * TOTAL; let i = CH.findIndex((c, k) => t >= c.start && (k === CH.length - 1 || t < CH[k + 1].start)); i = Math.max(0, i); load(i, t - CH[i].start, !audio.paused || !audio.src); }
scrub.addEventListener("pointerdown", e => { const r = scrub.getBoundingClientRect(); seekFrac((e.clientX - r.left) / r.width); });
scrub.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const g = (CH[chi]?.start || 0) + audio.currentTime + (e.key === "ArrowRight" ? 15 : -15); seekFrac(g / TOTAL); } });
audio.addEventListener("timeupdate", () => {
  const c = CH[chi]; if (!c) return;
  const g = c.start + audio.currentTime;
  fill.style.width = (g / TOTAL * 100) + "%"; scrub.setAttribute("aria-valuenow", Math.round(g / TOTAL * 100));
  const mm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  $("#nowC").textContent = `${mm(g)} / ${mm(TOTAL)} · chapter ${chi + 1} of ${CH.length}`;
  const li = c.lines.findIndex(l => audio.currentTime >= l.start && audio.currentTime < l.end);
  const el = lineEls.find(p => +p.dataset.c === chi && +p.dataset.l === li);
  if (el && el !== curLine) { curLine?.classList.remove("cur"); el.classList.add("cur"); curLine = el;
    if (txBtn.getAttribute("aria-pressed") === "true") txBody.scrollTop = el.offsetTop - txBody.offsetTop - txBody.clientHeight / 2; }
  // follow along: walk the matching act's stops in step with the chapter
  if (followBtn.getAttribute("aria-pressed") === "true" && !audio.paused && performance.now() - lastUser > 9000) {
    const act = document.getElementById(ACT_OF[c.id]); if (!act) return;
    const own = stops.filter(s => act.contains(s.el) || s.el === act);
    const idx = Math.min(own.length - 1, Math.floor(audio.currentTime / Math.max(1, c.duration) * own.length));
    const key = c.id + idx;
    if (key !== lastFollow && own[idx]) { lastFollow = key; const r = own[idx].el.getBoundingClientRect();
      scrollTo({ top: scrollY + r.top + Math.min(r.height, innerHeight) / 2 - innerHeight / 2, behavior: reduce ? "auto" : "smooth" }); }
  }
});
function mediaMeta() {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({ title: CH[chi].title, artist: "Inside the AI Factory", album: "Data Center Design" });
  navigator.mediaSession.setActionHandler("play", () => audio.play());
  navigator.mediaSession.setActionHandler("pause", () => audio.pause());
  navigator.mediaSession.setActionHandler("nexttrack", () => chi < CH.length - 1 && load(chi + 1));
  navigator.mediaSession.setActionHandler("previoustrack", () => load(Math.max(0, audio.currentTime > 5 ? chi : chi - 1)));
  navigator.mediaSession.setActionHandler("seekforward", () => (audio.currentTime += 15));
  navigator.mediaSession.setActionHandler("seekbackward", () => (audio.currentTime -= 15));
}
