KK.sound = (() => {
  // Every sound is synthesized with Web Audio: no files, works offline, tiny.
  let ac = null;
  let on = true;
  function ctx() {
    if (!on) return null;
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C();
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(freq, at, dur, { type = 'sine', vol = 0.15, to = null } = {}) {
    const a = ctx();
    if (!a) return;
    const t = a.currentTime + at;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  const buzz = (ms) => { try { if (on && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* unsupported */ } };

  return {
    set enabled(v) { on = !!v; },
    get enabled() { return on; },
    unlock() { ctx(); },
    tap() { tone(560, 0, 0.05, { vol: 0.05, to: 420 }); },
    pop() { tone(950, 0, 0.09, { vol: 0.2, to: 170 }); },
    correct(combo = 0) {
      const lift = Math.pow(2, Math.min(combo, 8) / 12);
      tone(950, 0, 0.08, { vol: 0.16, to: 200 });
      tone(784 * lift, 0.05, 0.16, { type: 'triangle', vol: 0.13 });
      tone(1175 * lift, 0.12, 0.26, { type: 'triangle', vol: 0.12 });
      buzz(18);
    },
    wrong() {
      tone(262, 0, 0.18, { vol: 0.12, to: 196 });
      tone(185, 0.13, 0.26, { vol: 0.1, to: 140 });
      buzz([30, 40, 30]);
    },
    fanfare() {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle', vol: 0.12 }));
      [0.05, 0.17, 0.29].forEach((t) => tone(1400, t, 0.06, { vol: 0.06, to: 300 }));
    },
    coin() { tone(1319, 0, 0.08, { type: 'square', vol: 0.05 }); tone(1760, 0.07, 0.18, { type: 'square', vol: 0.05 }); },
  };
})();
