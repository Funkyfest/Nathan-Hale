KK.store = (() => {
  const KEY = 'kiki.v1';
  const { SKILLS, UNITS, skillById } = KK.content;

  const pad = (v) => String(v).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  function addDays(s, k) {
    const [y, m, d] = s.split('-').map(Number);
    return ymd(new Date(y, m - 1, d + k));
  }
  function daysBetween(a, b) {
    const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
  }

  const fresh = () => ({
    v: 1, onboarded: false, goal: 60, xp: 0, gems: 25,
    streak: 0, bestStreak: 0, lastDay: null, freezes: 0,
    days: {}, skills: {}, badges: {}, sat: [], claimed: {},
    owned: [], wearing: null, sound: true, story: true, bestCombo: 0, created: today(), unitTests: {},
  });
  let st = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...fresh(), ...JSON.parse(raw) };
    } catch (e) { /* private mode or corrupt data: start fresh */ }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage unavailable */ }
  }
  function reset() { st = fresh(); save(); }
  function replace(data) { st = { ...fresh(), ...data }; save(); }

  const blankDay = () => ({ xp: 0, lessons: 0, combo: 0, perfects: 0, sat: 0, gd: 0, goalHit: false });
  const day = (d = today()) => st.days[d] || (st.days[d] = blankDay());
  const peekDay = (d = today()) => st.days[d] || blankDay();
  const skill = (id) => st.skills[id] || (st.skills[id] = { level: 0, correct: 0, total: 0, last: null });
  const touch = (id) => { skill(id).last = today(); };
  const level = (id) => (st.skills[id] ? st.skills[id].level : 0);

  // ── Streaks (Duolingo rules: any finished lesson keeps it alive; freezes cover missed days) ──
  function liveStreak() {
    if (!st.lastDay) return 0;
    const gap = daysBetween(st.lastDay, today());
    if (gap <= 1) return st.streak;
    return gap - 1 <= st.freezes ? st.streak : 0;
  }
  function extendStreak() {
    const t = today();
    if (st.lastDay === t) return { extended: false, used: 0 };
    const gap = st.lastDay ? daysBetween(st.lastDay, t) : Infinity;
    let used = 0;
    if (gap === 1) st.streak++;
    else if (gap !== Infinity && gap - 1 <= st.freezes) { used = gap - 1; st.freezes -= used; st.streak++; }
    else st.streak = 1;
    st.lastDay = t;
    st.bestStreak = Math.max(st.bestStreak, st.streak);
    return { extended: true, used };
  }
  function week() {
    const t = today();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(t, i - 6);
      const rec = st.days[d];
      return { d, xp: rec ? rec.xp : 0, active: !!rec && (rec.lessons > 0 || rec.sat > 0) };
    });
  }

  // ── Daily quests: 3 per day, same 3 all day, picked from the date ──
  const QUESTS = [
    { id: 'xp', icon: '⚡', text: () => `Earn ${st.goal} XP`, target: () => st.goal, prog: (d) => d.xp },
    { id: 'lessons', icon: '🌸', text: () => 'Finish 2 lessons', target: () => 2, prog: (d) => d.lessons },
    { id: 'combo', icon: '🔥', text: () => 'Get 5 right in a row', target: () => 5, prog: (d) => d.combo },
    { id: 'perfect', icon: '💯', text: () => 'Finish a lesson with no mistakes', target: () => 1, prog: (d) => d.perfects },
    { id: 'sat', icon: '📝', text: () => 'Answer 5 SAT practice questions', target: () => 5, prog: (d) => d.sat },
    { id: 'gd', icon: '📐', text: () => 'Do a Data or Geometry lesson', target: () => 1, prog: (d) => d.gd },
  ];
  function seeded(seedStr) {
    let h = 2166136261;
    for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }
  function quests(d = today()) {
    const r = seeded(d);
    const rest = QUESTS.slice(1).map((q) => [r(), q]).sort((a, b) => a[0] - b[0]).map(([, q]) => q);
    const rec = peekDay(d), claimed = st.claimed[d] || [];
    return [QUESTS[0], rest[0], rest[1]].map((q) => {
      const target = q.target(), prog = Math.min(target, q.prog(rec));
      return { id: q.id, icon: q.icon, text: q.text(), target, prog, done: prog >= target, claimed: claimed.includes(q.id) };
    });
  }
  // Pays out finished quests. Returns what was newly completed.
  function claimQuests() {
    const d = today(), list = quests(d), out = [];
    st.claimed[d] = st.claimed[d] || [];
    for (const q of list) {
      if (q.done && !q.claimed) { st.claimed[d].push(q.id); st.gems += 10; out.push({ ...q, reward: 10 }); }
    }
    if (out.length && list.every((q) => q.done) && !st.claimed[d].includes('chest')) {
      st.claimed[d].push('chest'); st.gems += 20; out.push({ id: 'chest', icon: '🎁', text: 'All 3 quests done! Bonus chest', reward: 20 });
    }
    return out;
  }

  // ── Badges ──
  const mastered = (unit) => SKILLS.filter((s) => !unit || s.unit === unit).filter((s) => level(s.id) >= 4).length;
  const unitDone = (unit) => SKILLS.filter((s) => s.unit === unit).every((s) => level(s.id) >= 4);
  const BADGES = [
    { id: 'first', icon: '🌱', name: 'First Bloom', desc: 'Finish your first lesson', ok: () => Object.values(st.days).some((d) => d.lessons > 0) },
    { id: 'streak3', icon: '🔥', name: 'On Fire', desc: '3-day streak', ok: () => st.bestStreak >= 3 },
    { id: 'streak7', icon: '🌸', name: 'Full Bloom', desc: '7-day streak', ok: () => st.bestStreak >= 7 },
    { id: 'streak30', icon: '🌳', name: 'Evergreen', desc: '30-day streak', ok: () => st.bestStreak >= 30 },
    { id: 'combo10', icon: '⚡', name: 'Combo Queen', desc: '10 right in a row', ok: () => st.bestCombo >= 10 },
    { id: 'perfect', icon: '💯', name: 'Flawless', desc: 'A lesson with zero mistakes', ok: () => Object.values(st.days).some((d) => d.perfects > 0) },
    { id: 'master1', icon: '👑', name: 'Mastered', desc: 'Master any skill', ok: () => mastered() >= 1 },
    { id: 'u_alg', icon: '🎀', name: 'Algebra Icon', desc: 'Master all of Algebra', ok: () => unitDone('alg') },
    { id: 'u_adv', icon: '🚀', name: 'Big Brain', desc: 'Master all of Advanced Math', ok: () => unitDone('adv') },
    { id: 'u_psda', icon: '📊', name: 'Data Diva', desc: 'Master all of Data & Percents', ok: () => unitDone('psda') },
    { id: 'u_geo', icon: '📐', name: 'Shape Shifter', desc: 'Master all of Geometry & Trig', ok: () => unitDone('geo') },
    { id: 'sat1', icon: '📝', name: 'Test Day Ready', desc: 'Finish an SAT practice set', ok: () => st.sat.length > 0 },
    { id: 'sat600', icon: '🎯', name: '600 Club', desc: 'Estimate 600+ on a full module', ok: () => st.sat.some((r) => r.n >= 22 && r.score >= 600) },
    { id: 'xp1000', icon: '✨', name: '1K Club', desc: 'Earn 1,000 XP', ok: () => st.xp >= 1000 },
    { id: 'unit', icon: '🏆', name: 'Unit Tested', desc: 'Pass a Unit Test (80%+)', ok: () => Object.values(st.unitTests).some((v) => v >= 80) },
    { id: 'strat', icon: '🧠', name: 'Test Hacker', desc: 'Master all Test Strategies', ok: () => unitDone('str') },
    { id: 'detective', icon: '🕵️', name: 'Detective', desc: 'Master Spot the Mistake', ok: () => level('mistake') >= 4 },
  ];
  function checkBadges() {
    const out = [];
    for (const b of BADGES) {
      if (!st.badges[b.id] && b.ok()) { st.badges[b.id] = Date.now(); st.gems += 10; out.push(b); }
    }
    return out;
  }

  // ── Spaced review (Khan-style): practiced skills fade after a week ──
  const REVIEW_DAYS = 7;
  function daysSince(id) {
    const k = st.skills[id];
    return k && k.last ? daysBetween(k.last, today()) : null;
  }
  const reviewDue = () => SKILLS.filter((s) => level(s.id) >= 2 && (daysSince(s.id) ?? 0) >= REVIEW_DAYS).map((s) => s.id);
  const unitReady = (unit) => SKILLS.filter((s) => s.unit === unit).every((s) => level(s.id) >= 1);
  // Unit test: a skill levels up when every one of its questions was right on the first try.
  function applyUnitTest(unit, perSkill, acc) {
    const ups = [];
    for (const [id, r] of Object.entries(perSkill)) {
      const k = skill(id);
      if (r.right === r.total && k.level < 4) { k.level++; ups.push({ id, level: k.level }); }
      k.last = today();
    }
    const prev = st.unitTests[unit] || 0;
    st.unitTests[unit] = Math.max(prev, Math.round(acc * 100));
    return ups;
  }

  // ── XP and goal ──
  function addXP(amount) {
    const d = day(), before = d.xp;
    d.xp += amount; st.xp += amount;
    if (!d.goalHit && before < st.goal && d.xp >= st.goal) { d.goalHit = true; st.gems += 10; return true; }
    return false;
  }

  // ── SAT score estimate (rough; the real SAT is adaptive) ──
  const CURVE = [[0, 200], [0.2, 350], [0.4, 460], [0.6, 560], [0.8, 670], [0.9, 730], [1, 800]];
  function estimate(frac) {
    for (let i = 1; i < CURVE.length; i++) {
      const [x0, y0] = CURVE[i - 1], [x1, y1] = CURVE[i];
      if (frac <= x1) return Math.round((y0 + ((frac - x0) / (x1 - x0)) * (y1 - y0)) / 10) * 10;
    }
    return 800;
  }

  // ── Dad report: a compact, read-only snapshot that travels in a link ──
  const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
  function encodeReport() {
    const w = {};
    for (const x of week()) w[x.d] = x.xp;
    return b64(JSON.stringify({
      v: 1, t: Date.now(), x: st.xp, s: liveStreak(), b: st.bestStreak, g: st.goal, l: st.lastDay, w,
      k: Object.fromEntries(Object.entries(st.skills).map(([id, s]) => [id, [s.level, s.correct, s.total]])),
      a: st.sat.slice(-6).map((r) => [r.d, r.score, r.c, r.n]),
      bd: Object.keys(st.badges),
    }));
  }
  // Everything is coerced to numbers / known ids / dates, so a hand-crafted link can't inject markup.
  function decodeReport(code) {
    try {
      const d = JSON.parse(unb64(String(code)));
      const num = (v, max = 1e7) => { v = Number(v); return Number.isFinite(v) && v >= 0 ? Math.min(Math.round(v), max) : 0; };
      const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
      const skills = {};
      for (const [id, arr] of Object.entries(d.k || {})) {
        if (skillById[id] && Array.isArray(arr)) skills[id] = { level: Math.min(4, num(arr[0])), correct: num(arr[1]), total: num(arr[2]) };
      }
      const w = Object.entries(d.w || {}).filter(([k]) => date(k)).map(([k, v]) => ({ d: k, xp: num(v) })).sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-7);
      return {
        t: num(d.t, 1e13), xp: num(d.x), streak: num(d.s), best: num(d.b), goal: num(d.g, 1000) || 60, last: date(d.l),
        week: w, skills,
        sat: (Array.isArray(d.a) ? d.a : []).filter((r) => Array.isArray(r) && date(r[0])).map((r) => ({ d: r[0], score: Math.min(800, num(r[1])), c: num(r[2]), n: num(r[3]) })),
        badges: (Array.isArray(d.bd) ? d.bd : []).filter((id) => BADGES.some((b) => b.id === id)),
      };
    } catch (e) {
      return null;
    }
  }
  const backup = () => b64(JSON.stringify(st));
  function restore(code) {
    try { const data = JSON.parse(unb64(code.trim())); if (data && data.v === 1) { replace(data); return true; } } catch (e) { /* bad code */ }
    return false;
  }

  return {
    get s() { return st; },
    save, reset, today, addDays, daysBetween, day, peekDay, skill, level,
    liveStreak, extendStreak, week, quests, claimQuests, BADGES, checkBadges, mastered, addXP,
    touch, daysSince, reviewDue, unitReady, applyUnitTest, REVIEW_DAYS,
    estimate, encodeReport, decodeReport, backup, restore, UNITS,
  };
})();
