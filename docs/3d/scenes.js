// Procedural 3-D scenes for the data-center design guide.
// Units are metres, +Y is up. Each builder returns { scene, camera, labels, target, extent }.
// labels: [{ t: "text", s: "subtext", p: [x, y, z], o: [dx, dy] }]  (o = label offset in px)

export const SCENES = {
  campus:   { title: "Hyperscale AI campus — exterior" },
  cutaway:  { title: "Exploded building cutaway" },
  hall:     { title: "Inside a liquid-cooled data hall" },
  rack:     { title: "NVL72-class liquid-cooled rack" },
  pod:      { title: "GPU pod row (SuperPOD scalable unit)" },
};

const C = {
  ground: 0xa7b39a, pad: 0xcfccc3, asphalt: 0x5a5f66, wall: 0xe4e7ea, wallDark: 0xc9ced4,
  roof: 0xbfc6cd, cooler: 0x9aa4ae, fan: 0x3b4148, gen: 0xd9d2b8, stack: 0x3a3a3a,
  xfmr: 0x7f8c86, steel: 0x8a929a, bess: 0xf2f2ef, solar: 0x23395a, glass: 0x86a9c6,
  tank: 0xf0f0ee, rack: 0x1e2226, rackSide: 0x2b3036, busway: 0xc9a227, tray: 0x9097a0,
  fiber: 0xf2c94c, supply: 0x2f6fd6, ret: 0xd64541, copper: 0xc8793f, cdu: 0x5d7b96,
  floor: 0xd9dcdf, contain: 0x9cc7ff, person: 0x2f6f8f, swgr: 0x9aa6b2, ups: 0x6d7a88,
};

let THREE;

// ---------- primitives ----------
function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.75, metalness: o.m ?? 0.05,
    transparent: o.opacity !== undefined, opacity: o.opacity ?? 1, emissive: o.e ?? 0x000000,
    emissiveIntensity: o.ei ?? 1, side: o.side ?? THREE.FrontSide, depthWrite: o.opacity === undefined });
}
// box with its BASE at y
function box(parent, w, h, d, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), o.material ?? mat(color, o));
  m.position.set(x, y + h / 2, z);
  m.castShadow = o.cast ?? true; m.receiveShadow = o.recv ?? true;
  if (o.ry) m.rotation.y = o.ry;
  if (o.rx) m.rotation.x = o.rx;
  parent.add(m); return m;
}
function cyl(parent, r, h, color, x, y, z, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 24), o.material ?? mat(color, o));
  m.position.set(x, y + (o.axis ? 0 : h / 2), z);
  if (o.axis === "x") m.rotation.z = Math.PI / 2;
  if (o.axis === "z") m.rotation.x = Math.PI / 2;
  m.castShadow = o.cast ?? true; m.receiveShadow = true;
  parent.add(m); return m;
}
// pipe between two points
function pipe(parent, a, b, r, color, o = {}) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 16), mat(color, { r: 0.45, m: 0.2, ...o }));
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  m.castShadow = true; parent.add(m); return m;
}
function arrow(parent, from, dir, len, color) {
  const a = new THREE.ArrowHelper(new THREE.Vector3(...dir).normalize(), new THREE.Vector3(...from), len, color, len * 0.35, len * 0.22);
  a.line.material.linewidth = 2; parent.add(a); return a;
}
function person(parent, x, z, ry = 0) {
  const g = new THREE.Group();
  const m = mat(C.person, { r: 0.6 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.62, 6, 12), m); body.position.y = 1.08; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), mat(0xe0b996)); head.position.y = 1.65; g.add(head);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.72, 0.16), mat(0x2b3440)); legs.position.y = 0.35; g.add(legs);
  g.traverse(o => { o.castShadow = true; });
  g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g); return g;
}
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// rack-front texture (servers + LEDs), drawn once per style
const texCache = {};
function rackTexture(style) {
  if (texCache[style]) return texCache[style];
  const cv = document.createElement("canvas"); cv.width = 128; cv.height = 512;
  const g = cv.getContext("2d");
  g.fillStyle = "#15181c"; g.fillRect(0, 0, 128, 512);
  const n = style === "ai" ? 28 : style === "net" ? 40 : 36;
  const r = rng(style === "ai" ? 7 : 11);
  for (let i = 0; i < n; i++) {
    const y = 14 + i * (484 / n);
    g.fillStyle = style === "ai" ? (i >= 11 && i < 18 ? "#22303f" : "#3a4048") : "#30353c";
    g.fillRect(8, y, 112, (484 / n) - 3);
    for (let k = 0; k < 3; k++) {
      g.fillStyle = r() > 0.25 ? (style === "ai" && i >= 11 && i < 18 ? "#4da3ff" : "#39d17a") : "#f2b33d";
      g.fillRect(14 + k * 6, y + 4, 3, 3);
    }
    g.fillStyle = "#4a5058"; for (let k = 0; k < 10; k++) g.fillRect(48 + k * 7, y + 3, 4, (484 / n) - 9);
  }
  if (style === "net") {
    g.strokeStyle = "#f2c94c"; g.lineWidth = 2;
    for (let i = 0; i < 40; i++) { const y = 20 + i * 12; g.beginPath(); g.moveTo(10, y); g.bezierCurveTo(40, y + 6, 90, y - 4, 118, y + 3); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  texCache[style] = t; return t;
}
function rackMaterials(style) {
  const side = mat(C.rackSide, { r: 0.6, m: 0.3 });
  const front = new THREE.MeshStandardMaterial({ map: rackTexture(style), roughness: 0.5, metalness: 0.2,
    emissiveMap: rackTexture(style), emissive: 0xffffff, emissiveIntensity: 0.35 });
  // +x, -x, +y, -y, +z(front), -z(back)
  return [side, side, side, side, front, mat(C.rack, { r: 0.6, m: 0.3 })];
}
// a rack whose FRONT faces +z in local space; rotate with ry
function rack(parent, x, z, ry, style = "ai", h = 2.3, w = 0.6, d = 1.2) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rackMaterials(style));
  m.position.set(x, h / 2, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true;
  parent.add(m); return m;
}

function lights(scene, extent, sun = [1, 1.6, 0.8]) {
  scene.add(new THREE.HemisphereLight(0xf4f7fb, 0x8d927f, 1.4));
  const d = new THREE.DirectionalLight(0xffffff, 2.4);
  d.position.set(sun[0] * extent, sun[1] * extent, sun[2] * extent);
  d.castShadow = true;
  d.shadow.mapSize.set(4096, 4096);
  const sc = d.shadow.camera; sc.left = -extent; sc.right = extent; sc.top = extent; sc.bottom = -extent;
  sc.near = 1; sc.far = extent * 5;
  d.shadow.bias = -0.0004; d.shadow.normalBias = extent * 0.0006;
  scene.add(d);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6); fill.position.set(-extent, extent * 0.5, -extent * 0.4); scene.add(fill);
}

// ============================================================ CAMPUS
function campus() {
  const s = new THREE.Scene();
  const L = [];
  // terrain + site pad
  box(s, 1400, 0.1, 1100, C.ground, -40, -0.1, 0, { cast: false });
  box(s, 620, 0.1, 420, C.pad, 0, 0, 0, { cast: false });
  // roads
  box(s, 900, 0.12, 14, C.asphalt, 0, 0.02, 228, { cast: false });
  box(s, 560, 0.12, 9, C.asphalt, 10, 0.02, 165, { cast: false });
  box(s, 9, 0.12, 380, C.asphalt, -185, 0.02, -10, { cast: false });
  box(s, 9, 0.12, 380, C.asphalt, 205, 0.02, -10, { cast: false });

  const halls = [{ z: -125, n: "A" }, { z: -25, n: "B" }, { z: 75, n: "C" }];
  for (const h of halls) {
    const g = new THREE.Group(); s.add(g);
    const W = 170, D = 56, H = 15, x0 = 10;
    box(g, W, H, D, C.wall, x0, 0, h.z);
    box(g, W + 0.6, 0.6, D + 0.6, C.roof, x0, H, h.z); // parapet/roof
    for (let i = -W / 2 + 6; i < W / 2; i += 8) box(g, 0.25, H - 0.5, 0.35, C.wallDark, x0 + i, 0, h.z + D / 2 + 0.1, { cast: false });
    box(g, W - 4, 1.4, 0.5, 0x7d8892, x0, H - 2.5, h.z + D / 2 + 0.2, { cast: false }); // louvre band
    // loading dock
    for (let k = 0; k < 3; k++) box(g, 4, 4.5, 0.4, 0x6c7680, x0 - W / 2 + 12 + k * 6, 0, h.z + D / 2 + 0.25, { cast: false });
    // rooftop dry coolers: 2 rows x 12
    for (const rz of [-12, 12]) for (let i = 0; i < 12; i++) {
      const cx = x0 - W / 2 + 14 + i * 12.6;
      box(g, 11, 2.6, 2.4, C.cooler, cx, H + 0.6, h.z + rz, { m: 0.3, r: 0.5 });
      for (let f = 0; f < 5; f++) cyl(g, 0.85, 0.25, C.fan, cx - 4.4 + f * 2.2, H + 3.2, h.z + rz, { cast: false });
    }
    // generator row on north side (each 3.2 x 4.2 x 12)
    for (let i = 0; i < 13; i++) {
      const gx = x0 - W / 2 + 10 + i * 12.5, gz = h.z + D / 2 + 11;
      box(g, 3.4, 4.2, 12, C.gen, gx, 0, gz, { r: 0.6 });
      box(g, 3.6, 1.2, 12.4, 0x8d8a7c, gx, 0, gz); // belly fuel tank
      cyl(g, 0.35, 3, C.stack, gx, 4.2, gz + 3.5);
    }
    // transformer pads on south side
    for (let i = 0; i < 8; i++) {
      const tx = x0 - W / 2 + 40 + i * 14, tz = h.z - D / 2 - 6;
      box(g, 3.4, 3.2, 2.6, C.xfmr, tx, 0, tz);
      for (let f = 0; f < 6; f++) box(g, 0.08, 2.4, 1.0, C.xfmr, tx - 1.9, 0.4, tz - 1 + f * 0.4, { cast: false });
    }
    L.push({ t: `Data Hall ${h.n} — 48 MW IT`, s: "170 × 56 m precast shell", p: [x0 - 40, H + 2, h.z + D / 2], o: [-130, -40 + (h.n === "A" ? -10 : 0)] });
  }
  L[0].o = [-70, -60]; L[1].o = [-170, -30]; L[2].o = [-250, -20];
  L.push({ t: "Dry coolers on roof", s: "reject heat to outside air · N+1", p: [55, 18, -137], o: [80, -70] });
  L.push({ t: "Generator yard", s: "13 × 3 MW diesel per hall · N+1", p: [70, 4.5, 114], o: [150, 40] });
  L.push({ t: "Unit-substation transformers", s: "34.5 kV → 480 V", p: [60, 3.4, -59], o: [170, -40] });

  // substation (west)
  box(s, 120, 0.15, 110, 0xb9b5aa, -270, 0.02, -80, { cast: false });
  for (const tz of [-110, -60]) {
    box(s, 9, 7, 6, C.xfmr, -265, 0, tz);
    for (let f = 0; f < 8; f++) box(s, 0.15, 5, 2.2, C.xfmr, -270.3, 1, tz - 2.5 + f * 0.7, { cast: false });
    for (let k = 0; k < 3; k++) cyl(s, 0.25, 3, 0xc9b38a, -263 + k * 2, 7, tz, { cast: false });
  }
  for (let k = 0; k < 4; k++) { // gantries
    const gx = -310 + k * 0; const gz = -130 + k * 30;
    box(s, 0.6, 18, 0.6, C.steel, -312, 0, gz); box(s, 0.6, 18, 0.6, C.steel, -298, 0, gz);
    box(s, 15, 0.6, 0.6, C.steel, -305, 17.5, gz);
  }
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) cyl(s, 0.9, 3.2, 0x9aa3ab, -240 + j * 7, 0, -125 + i * 14);
  // transmission towers + lines
  const towers = [[-430, -95], [-560, -110], [-690, -125]];
  for (const [tx, tz] of towers) {
    cyl(s, 0.6, 38, C.steel, tx, 0, tz, { r2: 0.15, seg: 4 });
    for (const yy of [30, 35]) box(s, 0.4, 0.4, 14, C.steel, tx, yy, tz, { cast: false });
  }
  const lineM = new THREE.LineBasicMaterial({ color: 0x3b3f44 });
  const pts = [[-305, 17.5, -115], ...towers.map(([x, z]) => [x, 35, z])];
  for (const off of [-6, 0, 6]) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], arr = [];
      for (let k = 0; k <= 20; k++) {
        const t = k / 20; const sag = Math.sin(Math.PI * t) * 4;
        arr.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag, a[2] + (b[2] - a[2]) * t + off));
      }
      s.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arr), lineM));
    }
  }
  L.push({ t: "230 kV substation", s: "dual utility feeds · main transformers → 34.5 kV", p: [-265, 8, -85], o: [-40, -120] });

  // BESS
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) box(s, 12, 3, 2.6, C.bess, -265 + i * 14, 0, 60 + r * 9, { r: 0.5 });
  L.push({ t: "Battery storage (BESS)", s: "smooths AI power swings · grid services", p: [-230, 3, 85], o: [-40, -110] });

  // central utility plant + water tanks (east)
  box(s, 40, 10, 34, C.wall, 255, 0, -100);
  for (let k = 0; k < 4; k++) box(s, 7, 3, 7, C.cooler, 241 + k * 9.5, 10, -100);
  cyl(s, 10, 13, C.tank, 250, 0, -40); cyl(s, 10, 13, C.tank, 275, 0, -40);
  L.push({ t: "Central utility plant", s: "pumps · water treatment · storage tanks", p: [262, 13, -55], o: [-30, 170] });

  // admin
  box(s, 46, 9, 20, C.wall, -120, 0, 140);
  box(s, 46.2, 2.6, 20.2, C.glass, -120, 4, 140, { r: 0.15, m: 0.6 });
  L.push({ t: "Admin, security & NOC", s: "", p: [-120, 9, 150], o: [-90, 110] });
  // solar
  for (let r = 0; r < 7; r++) {
    const m = box(s, 150, 0.12, 4.2, C.solar, 80, 1.6, 255 + r * 9, { rx: -0.42, m: 0.4, r: 0.3 });
  }
  L.push({ t: "Solar array", s: "", p: [60, 2, 270], o: [60, 50] });
  // fibre huts at diverse ends
  box(s, 5, 3, 4, 0x8b939b, -175, 0, 205); box(s, 5, 3, 4, 0x8b939b, 215, 0, -205);
  L.push({ t: "Diverse fibre entrance vaults", s: "two routes, opposite ends", p: [-175, 3, 205], o: [110, 150] });

  // fence
  const fm = new THREE.LineBasicMaterial({ color: 0x5a5f55 });
  const fp = [[-330, -215], [320, -215], [320, 212], [-330, 212], [-330, -215]].map(([x, z]) => new THREE.Vector3(x, 1.2, z));
  s.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(fp), fm));
  // trees
  const R = rng(3);
  for (let i = 0; i < 160; i++) {
    let x = -620 + R() * 1150, z = -520 + R() * 1000;
    if (x > -350 && x < 340 && z > -235 && z < 300) continue;
    const hgt = 7 + R() * 7;
    cyl(s, 0.35, hgt * 0.35, 0x6b5a45, x, 0, z, { cast: false });
    const c = new THREE.Mesh(new THREE.ConeGeometry(2.5 + R() * 1.5, hgt, 8), mat(0x56704a));
    c.position.set(x, hgt * 0.3 + hgt / 2, z); c.castShadow = true; s.add(c);
  }
  s.fog = new THREE.Fog(0xe3e9ef, 900, 1700);
  lights(s, 520, [0.9, 1.4, 0.6]);
  const cam = new THREE.PerspectiveCamera(30, 1.6, 5, 5000);
  cam.position.set(470, 420, 700);
  return { scene: s, camera: cam, labels: L, target: [-15, 0, 10], extent: 520, sky: [0xe9eef4, 0xcfd9e4] };
}

// ============================================================ CUTAWAY
function cutaway() {
  const s = new THREE.Scene(); const L = [];
  const W = 96, D = 44, H = 11;
  box(s, 220, 0.1, 170, C.ground, 0, -0.1, 0, { cast: false });
  box(s, 130, 0.1, 80, C.pad, 0, 0, -6, { cast: false });
  box(s, W, 0.4, D, C.floor, 0, 0, 0, { cast: false }); // slab
  // walls: north (back) and west only; others removed
  box(s, W, H, 0.5, C.wall, 0, 0, -D / 2);
  box(s, 0.5, H, D, C.wall, -W / 2, 0, 0);
  box(s, 0.5, H * 0.35, D, C.wallDark, W / 2, 0, 0); // stub of east wall
  box(s, W, H * 0.12, 0.5, C.wallDark, 0, 0, D / 2); // stub of south wall
  // interior partitions
  box(s, 0.3, H, D, 0xd2d6db, -30, 0, 0, { opacity: 0.55 });
  box(s, W - 18, H, 0.3, 0xd2d6db, 9, 0, -D / 2 + 7, { opacity: 0.55 });

  // --- electrical room (x -48..-30)
  for (let r = 0; r < 3; r++) {
    box(s, 1.0, 2.3, 13, C.swgr, -44 + r * 5, 0.4, -6, { m: 0.3 });
    box(s, 1.0, 2.0, 9, C.ups, -42 + r * 5, 0.4, 13, { m: 0.3 });
  }
  L.push({ t: "Electrical room", s: "switchgear · UPS · Li-ion batteries", p: [-42, 2.6, 13], o: [-120, 60] });

  // --- mechanical gallery (north strip)
  for (let i = 0; i < 9; i++) {
    const x = -24 + i * 7.2;
    box(s, 1.4, 2.2, 1.2, C.cdu, x, 0.4, -D / 2 + 3, { m: 0.3 });
    pipe(s, [x - 0.3, 2.6, -D / 2 + 3], [x - 0.3, 5.0, -D / 2 + 3], 0.12, C.supply);
    pipe(s, [x + 0.3, 2.6, -D / 2 + 3], [x + 0.3, 5.6, -D / 2 + 3], 0.12, C.ret);
  }
  pipe(s, [-27, 5.0, -D / 2 + 3], [46, 5.0, -D / 2 + 3], 0.32, C.supply);
  pipe(s, [-27, 5.6, -D / 2 + 3], [46, 5.6, -D / 2 + 3], 0.32, C.ret);
  L.push({ t: "Mechanical gallery", s: "CDUs · pumps · supply/return headers", p: [30, 5.6, -D / 2 + 3], o: [40, -150] });

  // --- data hall racks: 6 rows along x, pairs around contained hot aisles
  const rows = [-10.5, -8.1, -1.5, 0.9, 7.5, 9.9]; // z of rack centres
  const rowStart = -26, nr = 104;
  rows.forEach((z, ri) => {
    const facesSouth = ri % 2 === 1; // pairs back-to-back
    for (let i = 0; i < nr; i++) rack(s, rowStart + i * 0.62 + 0.3, z, facesSouth ? 0 : Math.PI, "ai");
    // busway above fronts
    const bz = z + (facesSouth ? 0.45 : -0.45);
    box(s, nr * 0.62, 0.22, 0.25, C.busway, rowStart + nr * 0.31, 3.3, bz, { m: 0.5, r: 0.4 });
    box(s, nr * 0.62, 0.08, 0.6, C.tray, rowStart + nr * 0.31, 3.9, z, { m: 0.4 });
  });
  for (let p = 0; p < 3; p++) { // containment roofs over hot aisles
    const z0 = rows[p * 2], z1 = rows[p * 2 + 1];
    box(s, nr * 0.62, 0.06, (z1 - z0) - 1.2, C.contain, rowStart + nr * 0.31, 2.3, (z0 + z1) / 2, { opacity: 0.45, cast: false });
    box(s, 0.05, 2.3, (z1 - z0) - 1.2, C.contain, rowStart - 0.05, 0, (z0 + z1) / 2, { opacity: 0.35, cast: false });
    // chimney ducts
    for (let k = 0; k < 4; k++) box(s, 1.2, H - 2.6, 1.0, 0xb8c2cc, rowStart + 4 + k * 7, 2.36, (z0 + z1) / 2, { opacity: 0.6 });
  }
  L.push({ t: "Data hall (white space)", s: "6 rows · hot-aisle pairs · ~600 rack positions", p: [-5, 2.3, 9], o: [-260, 70] });
  L.push({ t: "Hot-aisle containment", s: "exhaust ducted up to ceiling plenum", p: [-10, 2.4, -0.3], o: [-180, -110] });
  L.push({ t: "Overhead busway + cable tray", s: "power tap at every rack · fibre above", p: [6, 3.6, 10.4], o: [130, 70] });

  // generators outside north wall
  for (let i = 0; i < 5; i++) {
    const gz = -16 + i * 8;
    box(s, 10, 4, 3.2, C.gen, W / 2 + 10, 0, gz); cyl(s, 0.3, 2.5, C.stack, W / 2 + 12.5, 4, gz);
  }
  L.push({ t: "Standby generators", s: "outside the shell, N+1", p: [W / 2 + 10, 4, 16], o: [90, 60] });

  // exploded roof, lifted 9 m above walls, with dry coolers
  const roofY = H + 16;
  box(s, W, 0.5, D, C.roof, 0, roofY, 0, { opacity: 0.88, cast: false });
  for (const rz of [-10, 0, 10]) for (let i = 0; i < 7; i++) {
    const cx = -36 + i * 12;
    box(s, 10, 2.4, 2.3, C.cooler, cx, roofY + 0.5, rz, { cast: false, m: 0.3 });
    for (let f = 0; f < 4; f++) cyl(s, 0.8, 0.2, C.fan, cx - 3.6 + f * 2.4, roofY + 2.9, rz, { cast: false });
  }
  // dashed lift guides
  const dm = new THREE.LineDashedMaterial({ color: 0x6b7480, dashSize: 0.8, gapSize: 0.6 });
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, H, z), new THREE.Vector3(x, roofY, z)]), dm);
    l.computeLineDistances(); s.add(l);
  }
  L.push({ t: "Roof — lifted to show the inside", s: "dry coolers reject the heat to outside air", p: [30, roofY + 2.6, -10], o: [110, -50] });
  person(s, 4, 4.2, 0.4);
  lights(s, 90, [0.8, 1.6, 1.0]);
  const cam = new THREE.PerspectiveCamera(32, 1.6, 1, 2000);
  cam.position.set(100, 44, 122);
  return { scene: s, camera: cam, labels: L, target: [0, 6, 0], extent: 90, sky: [0xeef2f6, 0xd6dee7] };
}

// ============================================================ HALL INTERIOR
function hall() {
  const s = new THREE.Scene(); const L = [];
  box(s, 60, 0.1, 60, C.floor, 0, -0.1, 0, { cast: false, r: 0.9 });
  const grid = new THREE.GridHelper(60, 100, 0xcfd3d7, 0xd3d7db); grid.position.y = 0.01; s.add(grid);
  const n = 30, len = n * 0.62, z0 = -len / 2;
  // two pairs of rows (along z). Pair 1: x=-2.0 (front faces -x) & x=0.6 (front faces +x) around hot aisle at -0.7
  const pairs = [{ a: -1.9, b: 0.5 }, { a: 5.3, b: 7.7 }];
  for (const P of pairs) {
    for (let i = 0; i < n; i++) {
      const z = z0 + i * 0.62 + 0.31;
      rack(s, P.a, z, -Math.PI / 2, "ai"); // front faces -x (cold aisle west)
      rack(s, P.b, z, Math.PI / 2, "ai");  // front faces +x
    }
    const hx = (P.a + P.b) / 2, aw = P.b - P.a - 1.2;
    box(s, aw + 1.2, 0.05, len, C.contain, hx, 2.32, 0, { opacity: 0.35, cast: false }); // containment roof
    box(s, aw, 2.3, 0.05, C.contain, hx, 0, len / 2 + 0.02, { opacity: 0.3, cast: false }); // end door
    box(s, 0.06, 2.3, 0.06, 0x7d8894, hx - aw / 2, 0, len / 2 + 0.03); box(s, 0.06, 2.3, 0.06, 0x7d8894, hx + aw / 2, 0, len / 2 + 0.03);
    // chimneys
    for (let k = 0; k < 3; k++) box(s, 1.1, 1.8, 0.9, 0xc3ccd5, hx, 2.35, z0 + 3 + k * 6, { opacity: 0.5 });
    // supply / return headers above hot aisle, with drops into rack tops
    pipe(s, [hx - 0.25, 3.0, z0], [hx - 0.25, 3.0, -z0 + 1.5], 0.09, C.supply);
    pipe(s, [hx + 0.25, 3.15, z0], [hx + 0.25, 3.15, -z0 + 1.5], 0.09, C.ret);
    for (let i = 0; i < n; i += 1) {
      const z = z0 + i * 0.62 + 0.31;
      pipe(s, [hx - 0.25, 3.0, z - 0.1], [P.a + 0.45, 3.0, z - 0.1], 0.018, C.supply);
      pipe(s, [P.a + 0.45, 3.0, z - 0.1], [P.a + 0.45, 2.3, z - 0.1], 0.018, C.supply);
      pipe(s, [hx - 0.25, 3.0, z + 0.1], [P.b - 0.45, 3.0, z + 0.1], 0.018, C.supply);
      pipe(s, [P.b - 0.45, 3.0, z + 0.1], [P.b - 0.45, 2.3, z + 0.1], 0.018, C.supply);
      pipe(s, [hx + 0.25, 3.15, z - 0.2], [P.a + 0.35, 3.15, z - 0.2], 0.018, C.ret);
      pipe(s, [P.a + 0.35, 3.15, z - 0.2], [P.a + 0.35, 2.3, z - 0.2], 0.018, C.ret);
      pipe(s, [hx + 0.25, 3.15, z + 0.2], [P.b - 0.35, 3.15, z + 0.2], 0.018, C.ret);
      pipe(s, [P.b - 0.35, 3.15, z + 0.2], [P.b - 0.35, 2.3, z + 0.2], 0.018, C.ret);
    }
    // busways above each row front edge
    box(s, 0.14, 0.16, len, C.busway, P.a - 0.45, 3.45, 0, { m: 0.5, r: 0.4 });
    box(s, 0.14, 0.16, len, C.busway, P.b + 0.45, 3.45, 0, { m: 0.5, r: 0.4 });
    for (let i = 0; i < n; i++) { const z = z0 + i * 0.62 + 0.31; box(s, 0.12, 0.16, 0.16, 0x7a6420, P.a - 0.45, 3.29, z, { cast: false }); box(s, 0.12, 0.16, 0.16, 0x7a6420, P.b + 0.45, 3.29, z, { cast: false }); }
    // ladder trays with yellow fibre
    for (const tx of [P.a - 0.1, P.b + 0.1]) {
      box(s, 0.6, 0.06, len, C.tray, tx, 3.8, 0, { m: 0.5 });
      box(s, 0.45, 0.1, len, C.fiber, tx, 3.86, 0, { cast: false });
    }
    // CDU at row end (north)
    box(s, 1.2, 2.3, 1.2, C.cdu, hx, 0, z0 - 1.2, { m: 0.3 });
    pipe(s, [hx - 0.25, 2.3, z0 - 1.2], [hx - 0.25, 3.0, z0 - 1.2], 0.09, C.supply);
    pipe(s, [hx - 0.25, 3.0, z0 - 1.2], [hx - 0.25, 3.0, z0], 0.09, C.supply);
    pipe(s, [hx + 0.25, 2.3, z0 - 1.2], [hx + 0.25, 3.15, z0 - 1.2], 0.09, C.ret);
    pipe(s, [hx + 0.25, 3.15, z0 - 1.2], [hx + 0.25, 3.15, z0], 0.09, C.ret);
  }
  // airflow arrows: cold into fronts (cold aisle between pairs at x≈2.9), hot up chimneys
  for (let k = 0; k < 4; k++) {
    const z = 2 + k * 1.6;
    arrow(s, [2.9, 0.6 + (k % 2) * 0.8, z], [-1, 0, 0], 1.2, 0x2f7de1);
    arrow(s, [2.9, 0.6 + (k % 2) * 0.8, z + 0.5], [1, 0, 0], 1.2, 0x2f7de1);
  }
  arrow(s, [-0.7, 3.6, z0 + 9], [0, 1, 0], 1.4, 0xd6453d);
  arrow(s, [-0.7, 3.6, z0 + 3], [0, 1, 0], 1.4, 0xd6453d);
  person(s, 2.9, 6.5, -0.6);
  L.push({ t: "Cold aisle", s: "you stand here · ~25 °C supply air", p: [2.9, 1.9, 7.5], o: [90, 40] });
  L.push({ t: "Contained hot aisle", s: "rack exhausts meet behind glass", p: [-0.7, 2.3, 4], o: [-200, -30] });
  L.push({ t: "Supply (blue) / return (red) headers", s: "warm water to cold plates in every rack", p: [-0.7, 3.1, -2], o: [-220, -90] });
  L.push({ t: "Busway with plug-in tap boxes", s: "A and B feeds, one tap per rack", p: [8.15, 3.55, 3], o: [-60, -270] });
  L.push({ t: "Fibre in ladder tray", s: "", p: [-2.0, 3.9, 2], o: [-180, -150] });
  L.push({ t: "CDU at row end", s: "facility water ↔ rack water", p: [6.5, 2.3, z0 - 1.2], o: [120, -60] });
  L.push({ t: "Chimney to ceiling return plenum", s: "", p: [6.5, 4.1, z0 + 9], o: [130, -40] });
  lights(s, 22, [0.6, 1.8, 0.9]);
  const cam = new THREE.PerspectiveCamera(46, 1.6, 0.1, 400);
  cam.position.set(6.2, 4.4, 16.5);
  return { scene: s, camera: cam, labels: L, target: [1.6, 1.4, -2], extent: 22, sky: [0xf1f3f5, 0xe1e5ea] };
}

// ============================================================ RACK (NVL72-class)
function rackScene() {
  const s = new THREE.Scene(); const L = [];
  box(s, 8, 0.05, 8, C.floor, 0, -0.05, 0, { cast: false });
  const W = 0.6, D = 1.2, U = 0.0445, base = 0.1;
  const steel = mat(0x2a2f35, { m: 0.6, r: 0.4 });
  // frame posts + top/bottom
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]]) box(s, 0.04, 2.3, 0.04, 0, x, 0, z, { material: steel });
  box(s, W, 0.06, D, 0, 0, 2.27, 0, { material: steel }); box(s, W, base, D, 0, 0, 0, 0, { material: steel });
  // left side panel only (right side removed to reveal manifolds)
  box(s, 0.02, 2.2, D, 0x30353b, -W / 2 - 0.01, 0.06, 0, { m: 0.4, r: 0.5 });

  const trayCompute = mat(0xaeb5bd, { m: 0.6, r: 0.35 }), trayFace = mat(0x3b4148, { m: 0.4 });
  const switchM = mat(0x2f4f78, { m: 0.5, r: 0.4 }), powerM = mat(0x55606b, { m: 0.5 });
  let y = base + 0.02;
  const stack = [["p", 4], ["c", 10], ["s", 9], ["c", 8], ["p", 4]];
  const pullAt = 6; let cIndex = 0, pulledY = 0;
  const slots = [];
  for (const [kind, n] of stack) for (let i = 0; i < n; i++) slots.push(kind);
  slots.reverse(); // bottom-up
  for (const kind of slots) {
    const h = kind === "c" ? 2 * U : U;
    const isPulled = kind === "c" && cIndex++ === 9;
    const zOff = isPulled ? 0.75 : 0;
    const m = kind === "c" ? trayCompute : kind === "s" ? switchM : powerM;
    if (!isPulled) {
      box(s, W - 0.06, h - 0.004, D - 0.12, 0, 0, y, 0.02 + zOff, { material: m });
      box(s, W - 0.06, h - 0.004, 0.012, 0, 0, y, D / 2 - 0.04, { material: trayFace });
      for (let k = 0; k < 3; k++) box(s, 0.012, 0.012, 0.004, kind === "s" ? 0x4da3ff : 0x39d17a, -0.22 + k * 0.02, y + h / 2 - 0.006, D / 2 - 0.032, { e: kind === "s" ? 0x4da3ff : 0x39d17a, ei: 1.5, cast: false });
    } else {
      pulledY = y;
      const g = new THREE.Group(); s.add(g); g.position.set(0, y, zOff);
      box(g, W - 0.06, 0.01, D - 0.12, 0, 0, 0, 0.02, { material: trayCompute }); // tray floor (lid off)
      box(g, W - 0.06, h, 0.012, 0, 0, 0, D / 2 - 0.04, { material: trayFace });
      // two superchip boards
      for (const bx of [-0.135, 0.135]) {
        box(g, 0.24, 0.006, 0.78, 0x2e5a3a, bx, 0.012, -0.02, { r: 0.6 });
        // 2 GPUs + 1 CPU per board, each with copper cold plate
        for (const [cz, sz] of [[-0.25, 0.11], [0.0, 0.11], [0.22, 0.08]]) {
          box(g, sz, 0.022, sz, C.copper, bx, 0.018, cz, { m: 0.85, r: 0.3 });
        }
        // tubing loop: blue in, red out, to rear quick-disconnects
        pipe(g, [bx - 0.03, 0.05, -0.25], [bx - 0.03, 0.05, -0.52], 0.006, C.supply);
        pipe(g, [bx + 0.03, 0.05, 0.22], [bx + 0.03, 0.05, -0.52], 0.006, C.ret);
        pipe(g, [bx - 0.03, 0.05, -0.25], [bx - 0.03, 0.05, 0.22], 0.006, C.supply);
      }
      box(g, 0.5, 0.03, 0.04, 0x222222, 0, 0.0, -0.55); // rear QD bar
    }
    y += h + 0.001;
  }
  // rear manifolds (right-rear)
  pipe(s, [W / 2 - 0.06, 0.15, -D / 2 + 0.06], [W / 2 - 0.06, 2.2, -D / 2 + 0.06], 0.028, C.supply);
  pipe(s, [W / 2 - 0.13, 0.15, -D / 2 + 0.06], [W / 2 - 0.13, 2.2, -D / 2 + 0.06], 0.028, C.ret);
  pipe(s, [W / 2 - 0.06, 0.15, -D / 2 + 0.06], [W / 2 - 0.06, -0.02, -D / 2 + 0.06], 0.028, C.supply);
  pipe(s, [W / 2 - 0.13, 0.15, -D / 2 + 0.06], [W / 2 - 0.13, -0.02, -D / 2 + 0.06], 0.028, C.ret);
  // copper busbar (rear centre)
  box(s, 0.06, 2.05, 0.02, C.copper, 0, 0.12, -D / 2 + 0.03, { m: 0.9, r: 0.25 });
  // NVLink spine cartridges (rear), many thin cables
  const cab = mat(0x15171a, { r: 0.5 });
  for (let c = 0; c < 4; c++) for (let k = 0; k < 26; k++) {
    const x = -0.24 + k * 0.0075 + (c % 2) * 0.27 - 0.0, yy = 0.55 + Math.floor(c / 2) * 0.62;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.55, 6), cab);
    m.position.set(x < 0.02 && x > -0.04 ? x - 0.06 : x, yy + 0.28, -D / 2 + 0.09); s.add(m);
  }
  person(s, -1.1, -0.7, 0.6);
  const hU = 2 * U;
  L.push({ t: "Pulled-out compute tray", s: "2 superchips = 4 GPUs + 2 CPUs", p: [0, pulledY + 0.05, 1.2], o: [140, 60] });
  L.push({ t: "Copper cold plates", s: "warm water flows through micro-channels", p: [0.135, pulledY + 0.04, 0.95], o: [170, -70] });
  L.push({ t: "18 compute trays", s: "72 GPUs share one NVLink domain", p: [0, 1.55, D / 2], o: [-210, -40] });
  L.push({ t: "9 NVLink switch trays", s: "", p: [0, 1.0, D / 2], o: [-210, 0] });
  L.push({ t: "Power shelves (top & bottom)", s: "AC/HVDC → ~50 V DC busbar", p: [0, 2.15, D / 2], o: [-200, -70] });
  L.push({ t: "Rear manifolds", s: "blue supply · red return · quick-disconnects", p: [W / 2 - 0.1, 1.6, -D / 2 + 0.06], o: [130, -50] });
  L.push({ t: "NVLink spine", s: "~5,000 copper cables in rear cartridges", p: [0.1, 1.2, -D / 2 + 0.09], o: [150, 80] });
  L.push({ t: "~120–130 kW · ~1.4 t", s: "", p: [-W / 2, 2.3, 0], o: [-120, -60] });
  lights(s, 4, [1.2, 2.0, 1.4]);
  const cam = new THREE.PerspectiveCamera(32, 1.6, 0.05, 100);
  cam.position.set(3.3, 2.9, 4.2);
  return { scene: s, camera: cam, labels: L, target: [0.0, 1.1, 0.2], extent: 4, sky: [0xf1f3f5, 0xdfe4ea] };
}

// ============================================================ POD ROW
function pod() {
  const s = new THREE.Scene(); const L = [];
  box(s, 40, 0.1, 30, C.floor, 0, -0.1, 0, { cast: false });
  const grid = new THREE.GridHelper(40, 66, 0xb9bec4, 0xcdd1d6); grid.position.y = 0.01; s.add(grid);
  // row along x: CDU, 4 NVL72, 2 network, 4 NVL72, CDU
  const items = ["cdu", "ai", "ai", "ai", "ai", "net", "net", "ai", "ai", "ai", "ai", "cdu"];
  let x = -items.length * 0.62 / 2;
  const xs = [];
  for (const it of items) {
    if (it === "cdu") box(s, 0.6, 2.3, 1.2, C.cdu, x + 0.3, 0, 0, { m: 0.3 });
    else rack(s, x + 0.3, 0, 0, it === "ai" ? "ai" : "net");
    xs.push(x + 0.3); x += 0.62;
  }
  const x0 = xs[0], x1 = xs[xs.length - 1];
  // second (spine) row in background
  for (let i = 0; i < 10; i++) rack(s, -3 + i * 0.62, -7, 0, "net");
  // overhead: busway A/B, fibre trays, pipes
  box(s, x1 - x0 + 0.6, 0.2, 0.25, C.busway, 0, 3.0, 0.45, { m: 0.5 });
  box(s, x1 - x0 + 0.6, 0.2, 0.25, 0xa48a2a, 0, 3.0, -0.45, { m: 0.5 });
  box(s, x1 - x0 + 0.6, 0.06, 0.6, C.tray, 0, 3.5, 0, { m: 0.5 });
  box(s, x1 - x0 + 0.4, 0.12, 0.45, C.fiber, 0, 3.56, 0, { cast: false });
  // fibre run to spine row
  box(s, 0.6, 0.06, 7, C.tray, 0.6, 3.5, -3.5, { m: 0.5 }); box(s, 0.45, 0.12, 7, C.fiber, 0.6, 3.56, -3.5, { cast: false });
  box(s, 6.6, 0.06, 0.6, C.tray, 0, 3.5, -7, { m: 0.5 }); box(s, 6.4, 0.12, 0.45, C.fiber, 0, 3.56, -7, { cast: false });
  // liquid headers under ceiling to each AI rack
  pipe(s, [x0, 2.75, -0.25], [x1, 2.75, -0.25], 0.07, C.supply);
  pipe(s, [x0, 2.6, -0.4], [x1, 2.6, -0.4], 0.07, C.ret);
  items.forEach((it, i) => {
    if (it !== "ai") return;
    pipe(s, [xs[i] - 0.1, 2.75, -0.25], [xs[i] - 0.1, 2.3, -0.25], 0.022, C.supply);
    pipe(s, [xs[i] + 0.1, 2.6, -0.4], [xs[i] + 0.1, 2.3, -0.4], 0.022, C.ret);
  });
  for (const cx of [x0, x1]) { pipe(s, [cx, 2.3, -0.25], [cx, 2.75, -0.25], 0.07, C.supply); pipe(s, [cx, 2.3, -0.4], [cx, 2.6, -0.4], 0.07, C.ret); }
  person(s, -3.4, 1.7, 0.3);
  L.push({ t: "NVL72 rack = 72 GPUs", s: "one NVLink domain · ~130 kW each", p: [xs[2], 2.3, 0.6], o: [-160, -80] });
  L.push({ t: "8 racks = 576 GPUs", s: "one scalable unit · ~1.1 MW of IT", p: [xs[9], 2.3, 0.6], o: [120, -100] });
  L.push({ t: "Network racks", s: "rail-aligned leaf switches · 800G optics", p: [xs[5] + 0.3, 2.3, 0.6], o: [0, -150] });
  L.push({ t: "In-row CDUs", s: "", p: [x1, 2.3, 0.6], o: [110, 10] });
  L.push({ t: "Fibre to spine row", s: "scale-out network · InfiniBand or Ethernet", p: [0.6, 3.6, -5], o: [140, -60] });
  L.push({ t: "Busway A + B", s: "dual-fed power above every rack", p: [-2.6, 3.1, 0.45], o: [-170, -20] });
  lights(s, 12, [0.8, 1.8, 1.2]);
  const cam = new THREE.PerspectiveCamera(40, 1.6, 0.1, 300);
  cam.position.set(5.4, 3.6, 8.2);
  return { scene: s, camera: cam, labels: L, target: [0, 1.4, -1.2], extent: 12, sky: [0xf1f3f5, 0xdfe4ea] };
}

export function buildScene(three, name) {
  THREE = three;
  const fn = { campus, cutaway, hall, rack: rackScene, pod }[name];
  const r = fn();
  r.camera.lookAt(...r.target);
  return r;
}

// Render helpers shared by the static renderer and the interactive viewer.
export function makeRenderer(three, canvas, w, h, dpr = 1) {
  const r = new three.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(dpr); r.setSize(w, h, false);
  r.shadowMap.enabled = true; r.shadowMap.type = three.PCFSoftShadowMap;
  r.toneMapping = three.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  r.outputColorSpace = three.SRGBColorSpace;
  return r;
}

export function skyTexture(three, sky) {
  const cv = document.createElement("canvas"); cv.width = 2; cv.height = 512;
  const g = cv.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#" + sky[0].toString(16).padStart(6, "0")); gr.addColorStop(1, "#" + sky[1].toString(16).padStart(6, "0"));
  g.fillStyle = gr; g.fillRect(0, 0, 2, 512);
  const t = new three.CanvasTexture(cv); t.colorSpace = three.SRGBColorSpace; return t;
}

// Draw 3-D-anchored labels into an absolutely positioned overlay element.
export function layoutLabels(three, overlay, camera, labels, w, h) {
  overlay.innerHTML = "";
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", w); svg.setAttribute("height", h);
  svg.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;overflow:visible";
  overlay.appendChild(svg);
  for (const L of labels) {
    const v = new three.Vector3(...L.p).project(camera);
    if (v.z > 1) continue;
    const ax = (v.x * 0.5 + 0.5) * w, ay = (-v.y * 0.5 + 0.5) * h;
    if (ax < 0 || ax > w || ay < 0 || ay > h) continue;
    const k = Math.max(0.55, Math.min(1, w / 1600));
    const lx = ax + L.o[0] * k, ly = ay + L.o[1] * k;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", ax); line.setAttribute("y1", ay); line.setAttribute("x2", lx); line.setAttribute("y2", ly);
    line.setAttribute("stroke", "#1f2a37"); line.setAttribute("stroke-width", "1.4");
    svg.appendChild(line);
    const dot = document.createElementNS(svgNS, "circle");
    dot.setAttribute("cx", ax); dot.setAttribute("cy", ay); dot.setAttribute("r", "3.5");
    dot.setAttribute("fill", "#fff"); dot.setAttribute("stroke", "#1f2a37"); dot.setAttribute("stroke-width", "1.6");
    svg.appendChild(dot);
    const d = document.createElement("div");
    d.className = "lbl";
    d.innerHTML = `<b>${L.t}</b>${L.s ? `<span>${L.s}</span>` : ""}`;
    d.style.cssText = `position:absolute;left:${lx}px;top:${ly}px;transform:translate(${L.o[0] < 0 ? "-100%" : "0"},-50%);` +
      "background:rgba(255,255,255,.94);border:1px solid #1f2a37;border-radius:6px;padding:4px 8px;" +
      "font:13px/1.25 'IBM Plex Sans',Inter,'Segoe UI',Arial,sans-serif;color:#111827;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.15)";
    d.querySelector("b").style.cssText = "display:block;font-weight:700";
    const sp = d.querySelector("span"); if (sp) sp.style.cssText = "display:block;color:#4b5563;font-size:11.5px";
    overlay.appendChild(d);
  }
}
