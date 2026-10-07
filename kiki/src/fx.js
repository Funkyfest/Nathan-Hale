KK.fx = (() => {
  // Canvas particle system: little flowers that pop, spin, fall and fade.
  const COLORS = ['#FF4B91', '#FF8CC0', '#FFC53D', '#9B6BFF', '#22C483', '#1CB0F6', '#FF9640'];
  let cv = null, g = null, parts = [], raf = 0, dpr = 1;
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(canvas) {
    cv = canvas;
    g = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
  }
  function flower(x, y, opts = {}) {
    const a = opts.angle ?? Math.random() * Math.PI * 2;
    const sp = (opts.speed ?? 5) * (0.55 + Math.random() * 0.8);
    parts.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - (opts.lift ?? 3.5),
      r: (opts.size ?? 9) * (0.7 + Math.random() * 0.7),
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      petals: Math.random() < 0.5 ? 5 : 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 0, max: (opts.life ?? 70) + Math.random() * 30,
      g: opts.gravity ?? 0.22,
    });
  }
  function burst(x, y, count = 14, opts = {}) {
    if (!g) return;
    if (reduced()) count = Math.min(count, 3);
    for (let i = 0; i < count; i++) flower(x, y, opts);
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function shower(count = 40) {
    if (!g) return;
    if (reduced()) return;
    for (let i = 0; i < count; i++) {
      flower(Math.random() * innerWidth, -20 - Math.random() * 120, { angle: Math.PI / 2, speed: 1.5, lift: 0, size: 11, life: 160, gravity: 0.05 });
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function draw(p) {
    const t = p.life / p.max;
    const s = p.life < 9 ? 1.25 * Math.sin((p.life / 9) * Math.PI * 0.75) + 0.05 : 1;
    g.save();
    g.globalAlpha = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
    g.translate(p.x * dpr, p.y * dpr);
    g.rotate(p.rot);
    g.scale(s * dpr, s * dpr);
    g.fillStyle = p.color;
    for (let k = 0; k < p.petals; k++) {
      const a = (k / p.petals) * Math.PI * 2;
      g.beginPath();
      g.ellipse(Math.cos(a) * p.r * 0.62, Math.sin(a) * p.r * 0.62, p.r * 0.56, p.r * 0.36, a, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = p.color === '#FFC53D' ? '#fff' : '#FFE27A';
    g.beginPath();
    g.arc(0, 0, p.r * 0.36, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  function loop() {
    g.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter((p) => p.life < p.max);
    for (const p of parts) {
      p.life++;
      p.vy += p.g;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      draw(p);
    }
    raf = parts.length ? requestAnimationFrame(loop) : 0;
    if (!raf) g.clearRect(0, 0, cv.width, cv.height);
  }
  function burstFrom(el, count, opts) {
    if (!el) return burst(innerWidth / 2, innerHeight / 2, count, opts);
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, count, opts);
  }
  function clear() { parts = []; if (g) g.clearRect(0, 0, cv.width, cv.height); }
  return { init, burst, burstFrom, shower, clear };
})();
