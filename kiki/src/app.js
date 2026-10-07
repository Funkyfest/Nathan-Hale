KK.app = (() => {
  const C = KK.content, S = KK.store, M = KK.math, snd = KK.sound, fx = KK.fx;
  const { SKILLS, UNITS, LEVELS, MASTERY, skillById, unitById } = C;
  const $ = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => [...r.querySelectorAll(q)];
  const root = () => $('#app');
  const NAME = 'Keaton';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tab = 'learn', sheet = null, lesson = null, test = null, flow = null, onboardStep = 0, testTimer = 0;
  let dadMode = false, dad = null, scrolledToCurrent = false;

  // ── Kiki's voice ──
  const LINES = {
    correct: ['Pop pop! 🌼', 'Ate that. 💅', 'Slay! ✨', 'Okay genius!', 'Main character energy 🌸', 'Bloomed! 🌷', 'Chef’s kiss 💋', 'That’s a 10/10.'],
    combo3: ['3 in a row! You’re on fire 🔥', 'Hat trick! 🔥'],
    combo5: ['FIVE in a row?! Unreal 🤯', 'Combo queen behavior 👑'],
    combo8: ['Is this even legal?? 🔥🔥🔥', 'Somebody stop her 😭'],
    wrong: ['Oop, so close! Check the steps 👀', 'Not quite, bestie. Next one’s yours.', 'Mistakes = growing season 🌱', 'Almost! Here’s the trick 👇'],
    done: ['Another one bloomed 🌷', 'Look at you go! 🌸', 'Your brain is glowing ✨'],
    perfect: ['Not. One. Miss. Iconic. 👑', 'Flawless. Frame it. 💯'],
    streak: ['Don’t break the chain! 🔗', 'Consistency is the real glow-up ✨', 'You showed up. That’s the whole secret.'],
  };
  const say = (k) => M.pick(LINES[k]);
  const me = (mood, size, cls = '') => KK.mascot.kiki(mood, { size, cls, outfit: S.s.wearing });

  // ── Small view helpers ──
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const asDate = (d) => new Date(`${d}T12:00`);
  const fmtDate = (d) => (d ? asDate(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');
  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  function ring(frac, size, color, width = 4) {
    const r = (size - width) / 2, c = 2 * Math.PI * r, h = size / 2;
    const arc = frac > 0 ? `<circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, frac))}" transform="rotate(-90 ${h} ${h})"/>` : '';
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="#F3E6EE" stroke-width="${width}"/>${arc}</svg>`;
  }
  function weekDots(w) {
    return `<div class="week">${w.map((x) => `<div class="wd ${x.active ? 'on' : ''} ${x.d === S.today() ? 'today' : ''}"><span>${DOW[asDate(x.d).getDay()]}</span><i>${x.active ? '🔥' : ''}</i></div>`).join('')}</div>`;
  }
  function xpChart(w, goal) {
    const max = Math.max(goal, ...w.map((x) => x.xp), 1);
    return `<div class="chart" role="img" aria-label="XP earned each day this week">${w.map((x) => `
      <div class="col ${x.d === S.today() ? 'today' : ''}"><b>${x.xp || ''}</b><div class="bar-v"><i class="${x.xp >= goal ? 'hit' : ''}" style="height:${Math.round((100 * x.xp) / max)}%"></i></div><span>${DOW[asDate(x.d).getDay()]}</span></div>`).join('')}</div>
      <p class="muted small">Gold bars hit the ${goal} XP daily goal.</p>`;
  }
  function spark(runs) {
    const pts = runs.slice(-8), W = 260, H = 54;
    const xy = pts.map((r, i) => [pts.length === 1 ? W / 2 : (i * W) / (pts.length - 1), H - ((r.score - 200) / 600) * H]);
    return `<svg class="spark" viewBox="-6 -6 ${W + 12} ${H + 12}" role="img" aria-label="SAT estimate trend"><polyline points="${xy.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${xy.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff"/>`).join('')}</svg>`;
  }
  function countUp(scope) {
    $$('[data-count]', scope).forEach((el) => {
      const to = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduced()) { el.textContent = to + suf; return; }
      const from = +(el.dataset.from || 0), t0 = performance.now(), dur = 900;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * e) + suf;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => t.classList.remove('on'), 2400);
  }
  const masteryLabel = (k) => (k.level === 0 && k.total > 0 ? 'Practiced' : MASTERY[k.level]);
  function unitVars(u) { return `--c:${u.color};--cd:${u.dark};--ct:${u.tint}`; }

  // ═════════════ Tabs ═════════════
  const TABS = [['learn', '🌸', 'Learn'], ['sat', '📝', 'SAT'], ['quests', '🎯', 'Quests'], ['shop', '💎', 'Shop'], ['me', '👤', 'Me']];
  function topbar() {
    const s = S.s, streak = S.liveStreak(), d = S.peekDay();
    return `<header class="topbar">
      <button class="brand" data-act="tab" data-tab="learn" aria-label="Kiki home">${me('happy', 34)}<span>kiki</span></button>
      <div class="chips">
        <button class="chip chip-streak ${streak ? '' : 'cold'}" data-act="tab" data-tab="quests" aria-label="${streak} day streak"><span class="flame">🔥</span><b>${streak}</b></button>
        <button class="chip chip-gems" data-act="tab" data-tab="shop" aria-label="${s.gems} gems"><span>💎</span><b>${s.gems}</b></button>
        <button class="chip chip-goal" data-act="tab" data-tab="quests" aria-label="${d.xp} of ${s.goal} XP today">${ring(d.xp / s.goal, 22, '#FFC53D')}<b>${d.xp}</b></button>
        <button class="chip chip-sound" data-act="sound" aria-label="Sound is ${s.sound ? 'on' : 'off'}">${s.sound ? '🔊' : '🔇'}</button>
      </div>
    </header>`;
  }
  const tabbar = () => `<nav class="tabbar" aria-label="Main">${TABS.map(([id, ic, lb]) => `
    <button class="tab ${tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}" ${tab === id ? 'aria-current="page"' : ''}><span class="tab-ic">${ic}</span><span>${lb}</span></button>`).join('')}</nav>`;

  // ── Learn: the path ──
  const OFFS = [0, 54, 80, 54, 0, -54, -80, -54];
  const currentSkill = () => SKILLS.find((s) => S.level(s.id) < 4) || SKILLS[SKILLS.length - 1];
  function greetLine() {
    const s = S.s, d = S.peekDay(), streak = S.liveStreak(), h = new Date().getHours();
    if (!s.lastDay) return `Hiii ${NAME}! Tap <b>START</b> and let’s go 🌸`;
    if (d.xp >= s.goal) return 'Daily goal done! 🎉 Extra practice = extra glow.';
    if (streak && s.lastDay !== S.today()) return `Your 🔥 <b>${streak}-day streak</b> is waiting. One lesson keeps it alive!`;
    const opts = [`${h < 12 ? 'Good morning' : h < 18 ? 'Hey' : 'Evening'}, ${NAME}! Ready to bloom? 🌸`, 'Let’s get those x’s 💅', `<b>${s.goal - d.xp} XP</b> to your daily goal. Easy.`];
    return opts[new Date().getDate() % opts.length];
  }
  function ringNode(lv) {
    const R = 46, Cc = 2 * Math.PI * R, seg = Cc / 4, gap = 7;
    let out = '';
    for (let i = 0; i < 4; i++) {
      const col = i < lv ? (lv >= 4 ? 'var(--gold)' : 'var(--c)') : '#EADFE5';
      out += `<circle cx="50" cy="50" r="${R}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${seg - gap} ${Cc - seg + gap}" stroke-dashoffset="${-(i * seg + gap / 2)}" transform="rotate(-90 50 50)"/>`;
    }
    return `<svg class="node-ring" viewBox="0 0 100 100" aria-hidden="true">${out}</svg>`;
  }
  function node(s, x, isCur) {
    const lv = S.level(s.id);
    return `<div class="node-row" style="--x:${x}px">
      ${isCur ? '<div class="start-tip">START</div>' : ''}
      <button class="node lv${lv} ${isCur ? 'current' : ''}" data-act="skill" data-id="${s.id}" aria-label="${s.name}: ${masteryLabel(S.s.skills[s.id] || { level: 0, total: 0 })}">
        ${ringNode(lv)}<span class="node-face">${lv >= 4 ? '👑' : s.icon}</span>
      </button>
      <div class="node-label">${s.name}${s.sat === false ? '<small>Algebra 2 only</small>' : ''}</div>
      ${isCur ? `<div class="node-kiki ${x > 0 ? 'left' : 'right'}">${me('happy', 62, 'idle')}</div>` : ''}
    </div>`;
  }
  function viewLearn() {
    const cur = currentSkill();
    let gi = 0;
    const units = UNITS.map((u, ui) => {
      const skills = SKILLS.filter((s) => s.unit === u.id);
      const done = skills.filter((s) => S.level(s.id) >= 4).length;
      return `<section class="unit" style="${unitVars(u)}">
        <div class="unit-banner"><div><div class="unit-kick">Unit ${ui + 1} · SAT: ${u.sat}</div><h2>${u.name}</h2><p>${u.blurb}</p></div>
          <div class="unit-count"><b>${done}/${skills.length}</b><span>👑</span></div></div>
        <div class="path">${skills.map((s) => node(s, OFFS[gi++ % OFFS.length], s.id === cur.id)).join('')}</div>
      </section>`;
    }).join('');
    return `<div class="hello">${me(S.liveStreak() || !S.s.lastDay ? 'happy' : 'wow', 64, 'idle')}<div class="speech">${greetLine()}</div></div>${units}
      <p class="foot-note">Made for ${NAME} with 💖 by Dad</p>`;
  }
  function lessonPlan(lv) {
    if (lv <= 1) return { label: LEVELS.easy.name, desc: LEVELS.easy.desc, xp: 70, mix: ['easy', 'easy', 'easy', 'easy', 'medium', 'medium'] };
    if (lv === 2) return { label: LEVELS.medium.name, desc: LEVELS.medium.desc, xp: 90, mix: ['easy', 'medium', 'medium', 'medium', 'medium', 'hard'] };
    if (lv === 3) return { label: LEVELS.hard.name, desc: LEVELS.hard.desc, xp: 115, mix: ['medium', 'hard', 'hard', 'hard', 'hard', 'hard'] };
    return { label: 'Touch-Up', desc: 'Mixed review to keep it fresh', xp: 100, mix: M.shuffle(['easy', 'medium', 'medium', 'hard', 'hard', 'hard']) };
  }
  function skillSheet(id) {
    const s = skillById[id], u = unitById[s.unit], sk = S.s.skills[id] || { level: 0, correct: 0, total: 0 }, lv = sk.level;
    const plan = lessonPlan(lv), acc = sk.total ? Math.round((100 * sk.correct) / sk.total) : null;
    return `<div class="sheet-bg" data-act="close-sheet"></div>
    <div class="sheet" role="dialog" aria-modal="true" aria-label="${s.name}" style="${unitVars(u)}">
      <div class="sheet-grip"></div>
      <div class="sheet-head"><span class="sheet-icon">${s.icon}</span><div><div class="sheet-kick">${u.name} · ${s.sat === false ? 'Algebra 2 only' : 'On the SAT'}</div><h3>${s.name}</h3></div></div>
      <p class="sheet-blurb">${s.blurb}</p>
      <div class="mastery-bar" aria-hidden="true">${[1, 2, 3, 4].map((i) => `<span class="${i <= lv ? 'on' : ''}"></span>`).join('')}</div>
      <div class="mastery-row"><b>${masteryLabel(sk)}</b><span>${acc !== null ? `${acc}% correct · ${sk.total} answered` : 'New skill'}</span></div>
      <div class="next-lesson"><span class="nl-tag">${plan.label}</span>${plan.desc}</div>
      <button class="btn btn-unit big block" data-act="start" data-id="${id}">${lv === 0 ? 'Start' : lv >= 4 ? 'Practice' : 'Continue'} · +${plan.xp} XP</button>
    </div>`;
  }

  // ── SAT tab ──
  const TIPS = [
    ['🎯 No penalty for guessing', 'Wrong answers don’t cost points on the SAT. Never leave a question blank, even with 10 seconds left.'],
    ['🧮 Desmos is built in', 'The digital SAT has the Desmos graphing calculator on every math question. Graph both sides of an equation and look where they cross. <a href="https://www.desmos.com/calculator" target="_blank" rel="noopener">Practice with Desmos</a>.'],
    ['✍️ Typing your own answer', 'About 1 in 4 math questions has no choices. Fractions (7/2) and decimals (3.5) are fine, and so are negatives. Mixed numbers like 3 1/2 are <b>not</b>.'],
    ['🔙 Plug in the choices', 'Stuck? Try each answer choice in the original equation. One of them works.'],
    ['⏱ About 1½ minutes each', 'Each math module is 22 questions in 35 minutes. Skip a hard one, mark it, and come back.'],
    ['📈 It adapts to you', 'Do well on the first math module and the second one gets harder, which unlocks higher scores. Early accuracy matters most.'],
  ];
  function viewSat() {
    const runs = S.s.sat, last = runs[runs.length - 1], best = runs.reduce((m, r) => Math.max(m, r.score), 0);
    const dom = UNITS.map((u) => {
      const sks = SKILLS.filter((s) => s.unit === u.id && s.sat !== false);
      return { u, pct: Math.round((100 * sks.reduce((t, s) => t + S.level(s.id), 0)) / (sks.length * 4)) };
    });
    return `<div class="sat-hero">
        <div class="sat-hero-top"><div><div class="kick light">SAT Math estimate</div>
          <div class="sat-score">${last ? `<b data-count="${last.score}" data-from="200">${last.score}</b>` : '<b>—</b>'}</div>
          <div class="sat-cap">${last ? `${fmtDate(last.d)} · ${last.c}/${last.n} correct` : 'Do a practice set to get your first estimate'}</div></div>
          ${me(last && last.score >= 600 ? 'cheer' : 'happy', 84, 'idle')}</div>
        ${runs.length > 1 ? spark(runs) : ''}
        ${best ? `<div class="sat-best">Best <b>${best}</b> · Goal <b>600+</b></div>` : ''}
      </div>
      <div class="sat-actions">
        <button class="btn btn-pink big block stack" data-act="test" data-n="10"><span>⚡ Quick Sprint</span><small>10 questions · 15 min</small></button>
        <button class="btn btn-purple big block stack" data-act="test" data-n="22"><span>📝 Full Module</span><small>22 questions · 35 min, just like test day</small></button>
      </div>
      <h3 class="sec-h">Readiness by section</h3>
      <div class="card">${dom.map(({ u, pct }) => `<div class="dom-row"><span>${u.sat}</span><div class="dom-bar"><i style="width:${pct}%;background:${u.color}"></i></div><b>${pct}%</b></div>`).join('')}
        <p class="muted small">Based on your mastery in each unit on the Learn path.</p></div>
      <h3 class="sec-h">SAT cheat codes</h3>
      <div class="tips">${TIPS.map(([t, b]) => `<details class="tip"><summary>${t}</summary><p>${b}</p></details>`).join('')}</div>
      ${runs.length ? `<h3 class="sec-h">History</h3><div class="card">${runs.slice().reverse().slice(0, 8).map((r) => `
        <div class="hist-row"><span>${fmtDate(r.d)}</span><span>${r.n >= 22 ? 'Module' : 'Sprint'} · ${r.c}/${r.n}</span><b>${r.score}</b></div>`).join('')}</div>` : ''}`;
  }

  // ── Quests tab ──
  function viewQuests() {
    const s = S.s, d = S.peekDay(), qs = S.quests(), streak = S.liveStreak();
    return `<div class="goal-card">${ring(d.xp / s.goal, 92, '#FFC53D', 10)}<div class="goal-in"><div class="kick">Daily goal</div><h2>${d.xp} / ${s.goal} XP</h2>
        <p>${d.xp >= s.goal ? 'Done for today! 🎉' : `${s.goal - d.xp} XP to go. About ${Math.ceil((s.goal - d.xp) / 80)} lesson${Math.ceil((s.goal - d.xp) / 80) > 1 ? 's' : ''}.`}</p></div></div>
      <h3 class="sec-h">Daily quests</h3>
      <div class="card">${qs.map((q) => `
        <div class="quest ${q.done ? 'done' : ''}"><span class="q-ic">${q.icon}</span>
          <div class="q-main"><div class="q-t">${q.text}</div><div class="q-bar"><i style="width:${(100 * q.prog) / q.target}%"></i><span>${q.prog} / ${q.target}</span></div></div>
          <span class="q-gift" aria-label="${q.claimed ? 'Claimed' : 'Reward: 10 gems'}">${q.claimed ? '✅' : '🎁'}</span></div>`).join('')}
        <p class="muted small">New quests every day. Each pays 10 💎. Finish all 3 for a bonus chest.</p></div>
      <h3 class="sec-h">Streak</h3>
      <div class="card streak-card"><div class="streak-big"><span class="${streak ? '' : 'cold'}">🔥</span><b>${streak}</b><small>day streak</small></div>
        ${weekDots(S.week())}<p class="muted small">Best: ${s.bestStreak} days · 🧊 Streak freezes: ${s.freezes}/2</p></div>`;
  }

  // ── Shop ──
  const SHOP = [
    { id: 'freeze', icon: '🧊', name: 'Streak Freeze', desc: 'Saves your streak if you miss a day. Hold up to 2.', price: 50 },
    { id: 'bow', name: 'Kiki’s Bow', desc: 'A purple bow, obviously.', price: 40 },
    { id: 'shades', name: 'Kiki’s Shades', desc: 'Too cool for quadratics.', price: 80 },
    { id: 'crown', name: 'Kiki’s Crown', desc: 'For when you’re an Icon.', price: 200 },
  ];
  function viewShop() {
    const s = S.s;
    return `<div class="shop-hero">${me('happy', 104, 'idle')}<div><div class="kick">Your gems</div><h2>💎 ${s.gems}</h2>
        <p class="muted">Earn gems from lessons, quests, daily goals, and badges.</p></div></div>
      <div class="shop-list">${SHOP.map((it) => {
        const owned = s.owned.includes(it.id), wearing = s.wearing === it.id, poor = s.gems < it.price;
        let btn;
        if (it.id === 'freeze') btn = s.freezes >= 2 ? '<button class="btn btn-ghost" disabled>Full 2/2</button>' : `<button class="btn btn-blue" data-act="buy" data-id="freeze" ${poor ? 'disabled' : ''}>💎 ${it.price}</button>`;
        else if (owned) btn = `<button class="btn ${wearing ? 'btn-ghost' : 'btn-pink'}" data-act="wear" data-id="${it.id}">${wearing ? 'Take off' : 'Wear'}</button>`;
        else btn = `<button class="btn btn-blue" data-act="buy" data-id="${it.id}" ${poor ? 'disabled' : ''}>💎 ${it.price}</button>`;
        const icon = it.icon ? `<span class="si-emoji">${it.icon}</span>` : KK.mascot.kiki('happy', { size: 56, outfit: it.id });
        return `<div class="shop-item"><span class="si-ic">${icon}</span><div class="si-main"><b>${it.name}</b><p>${it.desc}${it.id === 'freeze' ? ` You have ${s.freezes}.` : ''}</p></div>${btn}</div>`;
      }).join('')}</div>`;
  }

  // ── Me ──
  const GOALS = [[30, 'Casual', 5], [60, 'Regular', 10], [100, 'Serious', 15], [150, 'Intense', 20]];
  function viewMe() {
    const s = S.s, best = s.sat.reduce((m, r) => Math.max(m, r.score), 0);
    return `<div class="me-hero">${me('happy', 116, 'idle')}<h2>${NAME}</h2><p class="muted">Blooming since ${fmtDate(s.created)}</p></div>
      <div class="stat-grid">
        <div class="sg"><span>⚡</span><b>${s.xp.toLocaleString()}</b><small>Total XP</small></div>
        <div class="sg"><span>🔥</span><b>${s.bestStreak}</b><small>Best streak</small></div>
        <div class="sg"><span>👑</span><b>${S.mastered()}/${SKILLS.length}</b><small>Skills mastered</small></div>
        <div class="sg"><span>📝</span><b>${best || '—'}</b><small>Best SAT estimate</small></div>
      </div>
      <h3 class="sec-h">This week</h3><div class="card">${xpChart(S.week(), s.goal)}</div>
      <h3 class="sec-h">Badges · ${Object.keys(s.badges).length}/${S.BADGES.length}</h3>
      <div class="badges">${S.BADGES.map((b) => `<div class="badge ${s.badges[b.id] ? 'on' : ''}"><span>${b.icon}</span><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div>
      <h3 class="sec-h">Send Dad your progress</h3>
      <div class="card dad-card"><p>Dad gets a link to a read-only report: streak, XP, skills, and SAT scores.</p>
        <div class="row2"><button class="btn btn-pink" data-act="text-dad">📱 Text Dad</button><button class="btn btn-ghost" data-act="copy-report">🔗 Copy link</button></div></div>
      <h3 class="sec-h">Settings</h3>
      <div class="card settings">
        <div class="set-row"><span>Sound effects</span><button class="toggle ${s.sound ? 'on' : ''}" data-act="sound" role="switch" aria-checked="${s.sound}" aria-label="Sound effects"><i></i></button></div>
        <div class="set-row col"><span>Daily goal</span><div class="seg">${GOALS.map(([g, lbl]) => `<button class="${s.goal === g ? 'on' : ''}" data-act="goal" data-g="${g}">${lbl}<small>${g} XP</small></button>`).join('')}</div></div>
        <div class="set-row"><span>Moving to a new phone?</span><button class="btn btn-ghost sm" data-act="backup">Copy backup</button></div>
        <div class="set-row"><span>Restore from backup</span><button class="btn btn-ghost sm" data-act="restore">Paste</button></div>
        <div class="set-row"><span>Start over</span><button class="btn btn-ghost sm danger" data-act="reset">Reset</button></div>
      </div>`;
  }

  function renderTabs() {
    const VIEWS = { learn: viewLearn, sat: viewSat, quests: viewQuests, shop: viewShop, me: viewMe };
    root().className = 'screen-tabs';
    root().innerHTML = `${topbar()}<main class="view view-${tab}" id="view">${VIEWS[tab]()}</main>${tabbar()}${sheet ? skillSheet(sheet) : ''}`;
    countUp(root());
    if (tab === 'learn' && !scrolledToCurrent) {
      scrolledToCurrent = true;
      const cur = $('.node.current');
      if (cur && S.s.lastDay) cur.scrollIntoView({ block: 'center' });
    }
  }

  // ═════════════ Lesson ═════════════
  function prep(p, gridChance) {
    p.type = Number.isFinite(p.value) && Math.random() < gridChance ? 'grid' : 'mc';
    return p;
  }
  function startLesson(id) {
    const s = skillById[id], lv = S.level(id), plan = lessonPlan(lv);
    const qs = plan.mix.map((L) => prep(C.problem(id, L), L === 'easy' ? 0 : 0.3));
    lesson = { id, unit: s.unit, qs, i: 0, phase: 'answer', sel: null, input: '', hint: 0, usedHint: false,
      combo: 0, maxCombo: 0, xp: 0, firstTry: 0, wrongs: 0, hints: 0, redos: 0, base: qs.length, start: Date.now() };
    sheet = null;
    fx.clear();
    snd.unlock();
    render();
  }
  const hintItems = (p) => [p.hint, ...p.steps.slice(0, -1)].filter(Boolean);
  const hintHTML = (p, k) => (k ? `<ul>${hintItems(p).slice(0, k).map((h) => `<li>💡 ${h}</li>`).join('')}</ul>` : '');
  function choicesHTML(p, sel, numbered) {
    const short = p.choices.every((c) => c.replace(/<[^>]+>/g, '').length <= 13);
    return `<div class="choices ${short ? 'two' : ''}" role="radiogroup" aria-label="Answer choices">${p.choices.map((c, i) => `
      <button class="choice ${sel === i ? 'sel' : ''}" role="radio" aria-checked="${sel === i}" data-act="pick" data-i="${i}"><kbd>${numbered ? i + 1 : 'ABCD'[i]}</kbd><span>${c}</span></button>`).join('')}</div>`;
  }
  const KEYS = ['7', '8', '9', '⌫', '4', '5', '6', '/', '1', '2', '3', '−', '0', '.'];
  function gridHTML(p, input) {
    const unit = p.unit && p.unit !== '$' ? `<span class="gd-unit">${p.unit}</span>` : '';
    return `<div class="grid-in">
      <div class="grid-label">Type your answer <small>Fractions like 3/4 are OK</small></div>
      <div class="grid-display" id="gdisp">${p.unit === '$' ? '<span class="gd-unit">$</span>' : ''}<span class="gd-val" id="gval">${esc(input.replace(/-/g, '−'))}</span><span class="caret"></span>${unit}</div>
      <div class="keypad">${KEYS.map((k) => `<button class="key ${k === '0' ? 'wide' : ''} ${/[⌫/−.]/.test(k) ? 'fn' : ''}" data-act="key" data-k="${k}" aria-label="${k === '⌫' ? 'Delete' : k === '−' ? 'Negative' : k}">${k}</button>`).join('')}</div>
    </div>`;
  }
  function questionHTML(p, state, inLesson) {
    const label = `${p.redo ? '<span class="redo-tag">🔁 Redo</span>' : ''}${p.label || 'Choose the answer'}`;
    const prompt = inLesson
      ? `<div class="q-row"><div class="q-kiki" id="qkiki">${me('think', 72)}</div><div class="bubble">${p.prompt}</div></div>`
      : `<div class="q-prompt">${p.prompt}</div>`;
    return `<div class="q-label">${label}</div>${prompt}${p.visual ? `<div class="visual">${p.visual}</div>` : ''}
      ${p.type === 'grid' ? gridHTML(p, state.input) : choicesHTML(p, state.sel, inLesson)}
      ${inLesson ? `<div class="hint-box" id="hints">${hintHTML(p, state.hint)}</div>` : ''}`;
  }
  function footAnswer() {
    const L = lesson, p = L.qs[L.i];
    const ready = p.type === 'grid' ? /\d/.test(L.input) : L.sel !== null;
    return `<div class="foot-row"><button class="btn btn-ghost" data-act="hint" ${L.hint >= hintItems(p).length ? 'disabled' : ''}>💡 Hint</button>
      <button class="btn btn-green big grow" data-act="check" ${ready ? '' : 'disabled'}>Check</button></div>`;
  }
  function footFeedback(ok, p, line, gained) {
    const right = p.type === 'grid' ? p.answer : p.choices[p.correct];
    return `<div class="fb">
      <div class="fb-head"><span class="fb-icon">${ok ? '✓' : '✕'}</span><div><div class="fb-title">${ok ? M.pick(['Nailed it!', 'Correct!', 'Yesss!', 'Perfect!']) : 'Not quite'}${ok && gained ? ` <span class="fb-xp">+${gained} XP</span>` : ''}</div>
        <div class="fb-line">${line}</div></div></div>
      ${ok ? '' : `<div class="fb-answer">Answer: <b>${right}</b></div>`}
      <details class="fb-steps" ${ok ? '' : 'open'}><summary>${ok ? 'See how' : 'How to get it'}</summary><ol>${p.steps.map((s) => `<li>${s}</li>`).join('')}</ol></details>
      ${p.bridge ? `<div class="bridge"><span>🌉</span><div>${p.bridge}</div></div>` : ''}
      <button class="btn ${ok ? 'btn-green' : 'btn-red'} big block" data-act="continue">Continue</button>
    </div>`;
  }
  function renderLesson() {
    const L = lesson, p = L.qs[L.i], u = unitById[L.unit];
    root().className = 'screen-lesson';
    root().innerHTML = `<div class="lesson" style="${unitVars(u)}">
      <div class="lesson-top">
        <button class="icon-btn" data-act="quit" aria-label="Quit lesson">✕</button>
        <div class="bar" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="${L.qs.length}" aria-valuenow="${L.i}"><div class="bar-fill" style="width:${(100 * L.i) / L.qs.length}%"></div></div>
        <div class="combo ${L.combo >= 2 ? 'on' : ''}" aria-label="${L.combo} in a row">🔥<b>${L.combo}</b></div>
      </div>
      <main class="lesson-body" id="lbody">${questionHTML(p, L, true)}</main>
      <footer class="lesson-foot" id="foot" aria-live="polite">${footAnswer()}</footer>
    </div>`;
  }
  function setCheckReady(on) { const b = $('[data-act="check"]'); if (b) b.disabled = !on; }
  function markSel(i) { $$('.choice').forEach((b, k) => { b.classList.toggle('sel', k === i); b.setAttribute('aria-checked', String(k === i)); }); }
  function pick(i) {
    if (lesson && lesson.phase === 'answer') { lesson.sel = i; markSel(i); setCheckReady(true); snd.tap(); }
    else if (test) { test.ans[test.i].sel = i; markSel(i); snd.tap(); }
  }
  function key(k) {
    const tgt = lesson ? (lesson.phase === 'answer' ? lesson : null) : test ? test.ans[test.i] : null;
    if (!tgt) return;
    let v = tgt.input;
    if (k === '⌫') v = v.slice(0, -1);
    else if (k === '−') v = v.startsWith('-') ? v.slice(1) : `-${v}`;
    else if (k === '/') { if (/\d$/.test(v) && !v.includes('/')) v += '/'; }
    else if (k === '.') { if (!v.split('/').pop().includes('.')) v += '.'; }
    else if (/^\d$/.test(k) && v.replace(/[-]/g, '').length < 7) v += k;
    tgt.input = v;
    const el = $('#gval');
    if (el) el.textContent = v.replace(/-/g, '−');
    if (lesson) setCheckReady(/\d/.test(v));
    snd.tap();
  }
  function hint() {
    const L = lesson, p = L.qs[L.i];
    if (L.phase !== 'answer' || L.hint >= hintItems(p).length) return;
    if (!L.usedHint) L.hints++;
    L.hint++; L.usedHint = true;
    $('#hints').innerHTML = hintHTML(p, L.hint);
    $('#foot').innerHTML = footAnswer();
    snd.tap();
  }
  function check() {
    const L = lesson, p = L.qs[L.i];
    if (L.phase !== 'answer') return;
    const ready = p.type === 'grid' ? /\d/.test(L.input) : L.sel !== null;
    if (!ready) return;
    const ok = p.type === 'grid' ? M.gridOk(L.input, p.value) : L.sel === p.correct;
    L.phase = 'feedback';
    const sk = S.skill(L.id);
    sk.total++;
    let gained = 0, line;
    if (ok) {
      sk.correct++;
      if (!L.usedHint) L.combo++;
      L.maxCombo = Math.max(L.maxCombo, L.combo);
      if (!p.redo) L.firstTry++;
      gained = p.redo ? 5 : LEVELS[p.level].xp;
      if (L.usedHint) gained = Math.ceil(gained / 2);
      if (L.combo >= 3) gained += 5;
      L.xp += gained;
      line = L.combo >= 8 ? say('combo8') : L.combo >= 5 ? say('combo5') : L.combo === 3 ? say('combo3') : say('correct');
    } else {
      L.combo = 0; L.wrongs++;
      line = say('wrong');
      if (!p.redo && L.redos < 2) {
        const np = prep(C.problem(L.id, p.level), p.type === 'grid' ? 1 : 0);
        np.redo = true;
        L.qs.push(np); L.redos++;
        line += ' You’ll get a redo at the end 🔁';
      }
    }
    S.save();
    if (p.type === 'mc') {
      $$('.choice').forEach((b, i) => { b.disabled = true; if (i === p.correct) b.classList.add('right'); else if (i === L.sel) b.classList.add('wrong'); });
    } else {
      $('#gdisp').classList.add(ok ? 'right' : 'wrong');
      $$('.key').forEach((b) => { b.disabled = true; });
    }
    $('#qkiki').innerHTML = me(ok ? 'cheer' : 'oops', 72, ok ? 'bounce' : 'wiggle');
    const combo = $('.combo');
    combo.className = `combo ${L.combo >= 2 ? 'on' : ''} ${ok && L.combo >= 2 ? 'bump' : ''}`;
    combo.querySelector('b').textContent = L.combo;
    $('.bar-fill').style.width = `${(100 * (L.i + 1)) / L.qs.length}%`;
    const foot = $('#foot');
    foot.className = `lesson-foot ${ok ? 'ok' : 'no'}`;
    foot.innerHTML = footFeedback(ok, p, line, gained);
    if (ok) {
      snd.correct(L.combo);
      fx.burstFrom(p.type === 'mc' ? $$('.choice')[p.correct] : $('#gdisp'), 10 + Math.min(L.combo, 8) * 3, { speed: 6 });
    } else {
      snd.wrong();
    }
    $('[data-act="continue"]').focus({ preventScroll: true });
  }
  function next() {
    const L = lesson;
    if (L.phase !== 'feedback') return;
    L.i++;
    if (L.i >= L.qs.length) return finishLesson();
    Object.assign(L, { phase: 'answer', sel: null, input: '', hint: 0, usedHint: false });
    renderLesson();
  }
  function finishLesson() {
    const L = lesson, sk = S.skill(L.id), before = sk.level;
    const acc = L.firstTry / L.base, perfect = L.wrongs === 0 && L.hints === 0;
    const xp = L.xp + (perfect ? 10 : 0);
    let after = before;
    if (before === 0) after = acc >= 0.8 ? 2 : 1;
    else if (acc >= 0.8 && before < 4) after = before + 1;
    sk.level = after;
    const d = S.day();
    d.lessons++;
    d.combo = Math.max(d.combo, L.maxCombo);
    if (perfect) d.perfects++;
    if (L.unit === 'psda' || L.unit === 'geo') d.gd++;
    S.s.bestCombo = Math.max(S.s.bestCombo, L.maxCombo);
    const gems = perfect ? 10 : 5;
    S.s.gems += gems;
    const goalHit = S.addXP(xp);
    const streak = S.extendStreak();
    const quests = S.claimQuests(), badges = S.checkBadges();
    S.save();
    const steps = [{ type: 'lesson', xp, acc, secs: Math.round((Date.now() - L.start) / 1000), perfect, before, after, skill: L.id, gems }];
    if (streak.extended) steps.push({ type: 'streak', used: streak.used });
    if (goalHit || quests.length) steps.push({ type: 'quests', goalHit, quests });
    badges.forEach((b) => steps.push({ type: 'badge', b }));
    lesson = null;
    flow = { steps, i: 0, back: 'learn' };
    render();
  }
  function openLayer(html) {
    if ($('.layer')) return;
    root().insertAdjacentHTML('beforeend', `<div class="layer">${html}</div>`);
    const b = $('.layer .btn');
    if (b) b.focus({ preventScroll: true });
  }
  const closeLayer = () => { const l = $('.layer'); if (l) l.remove(); };

  // ═════════════ SAT practice test ═════════════
  const PLANS = { 10: { alg: 4, adv: 3, psda: 2, geo: 1, mins: 15 }, 22: { alg: 8, adv: 8, psda: 3, geo: 3, mins: 35 } };
  const ORDER = { easy: 0, medium: 1, hard: 2 };
  function startTest(n) {
    const plan = PLANS[n], qs = [];
    for (const u of ['alg', 'adv', 'psda', 'geo']) {
      const pool = SKILLS.filter((s) => s.unit === u && s.sat !== false);
      for (let k = 0; k < plan[u]; k++) qs.push(prep(C.problem(M.pick(pool).id, M.pick(['medium', 'medium', 'hard', 'hard', 'hard'])), 0.3));
    }
    qs.sort((a, b) => ORDER[a.level] - ORDER[b.level]);
    test = { n, qs, i: 0, ans: qs.map(() => ({ sel: null, input: '', flag: false })), end: Date.now() + plan.mins * 60000, hide: false, nav: false, confirm: false, warned: false };
    fx.clear();
    snd.unlock();
    clearInterval(testTimer);
    testTimer = setInterval(tickTest, 1000);
    render();
  }
  const timeLeft = () => Math.max(0, Math.round((test.end - Date.now()) / 1000));
  const answered = (i) => (test.qs[i].type === 'grid' ? /\d/.test(test.ans[i].input) : test.ans[i].sel !== null);
  function tickTest() {
    if (!test) { clearInterval(testTimer); return; }
    const s = timeLeft(), el = $('#timer');
    if (el && !test.hide) { el.textContent = fmtTime(s); el.classList.toggle('low', s <= 300); }
    if (s <= 300 && !test.warned) { test.warned = true; toast('⏱ 5 minutes left'); }
    if (s <= 0) finishTest();
  }
  function navSheet() {
    const T = test, blank = T.qs.filter((_, i) => !answered(i)).length;
    const body = T.confirm
      ? `<div class="center">${me('wow', 80)}<h3>${blank} question${blank === 1 ? '' : 's'} left blank</h3><p class="muted">Guessing is free on the SAT. Want to go fill ${blank === 1 ? 'it' : 'them'} in?</p></div>
         <div class="row2"><button class="btn btn-ghost" data-act="tconfirm-no">Go back</button><button class="btn btn-purple" data-act="tsubmit-yes">Submit anyway</button></div>`
      : `<h3>Questions</h3><div class="legend"><span><i class="lg cur"></i>Current</span><span><i class="lg done"></i>Answered</span><span>🔖 Marked</span></div>
         <div class="qgrid">${T.qs.map((_, i) => `<button class="qg ${i === T.i ? 'cur' : ''} ${answered(i) ? 'done' : ''}" data-act="tgo" data-i="${i}" aria-label="Question ${i + 1}${answered(i) ? ', answered' : ''}${T.ans[i].flag ? ', marked' : ''}">${i + 1}${T.ans[i].flag ? '<i>🔖</i>' : ''}</button>`).join('')}</div>
         <button class="btn btn-purple big block" data-act="tsubmit">Submit ${T.n >= 22 ? 'module' : 'sprint'}${blank ? ` · ${blank} blank` : ''}</button>`;
    return `<div class="sheet-bg" data-act="tnav-close"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Question navigator"><div class="sheet-grip"></div>${body}</div>`;
  }
  function renderTest() {
    const T = test, p = T.qs[T.i], a = T.ans[T.i];
    root().className = 'screen-test';
    root().innerHTML = `<div class="sat-test">
      <header class="st-top"><button class="icon-btn" data-act="test-quit" aria-label="Leave practice">✕</button>
        <div class="st-title">SAT Math · ${T.n >= 22 ? 'Module' : 'Sprint'}</div>
        <button class="timer ${T.hide ? 'off' : ''}" data-act="timer" id="timer" aria-label="${T.hide ? 'Show timer' : 'Time left. Tap to hide'}">${T.hide ? 'Show' : fmtTime(timeLeft())}</button></header>
      <div class="st-sub"><span class="qnum">${T.i + 1}</span><button class="flag ${a.flag ? 'on' : ''}" data-act="flag" aria-pressed="${a.flag}">🔖 ${a.flag ? 'Marked for review' : 'Mark for review'}</button></div>
      <main class="st-body">${questionHTML(p, a, false)}</main>
      <footer class="st-foot"><button class="btn btn-ghost" data-act="tprev" ${T.i === 0 ? 'disabled' : ''}>Back</button>
        <button class="st-nav" data-act="tnav">${T.i + 1} of ${T.n} ▴</button>
        <button class="btn btn-blue" data-act="tnext">${T.i === T.n - 1 ? 'Review' : 'Next'}</button></footer>
    </div>${T.nav ? navSheet() : ''}`;
  }
  function goQ(i) { test.i = Math.max(0, Math.min(test.n - 1, i)); test.nav = false; test.confirm = false; renderTest(); }
  function finishTest() {
    clearInterval(testTimer);
    const T = test;
    const res = T.qs.map((p, i) => {
      const a = T.ans[i];
      const ok = p.type === 'grid' ? /\d/.test(a.input) && M.gridOk(a.input, p.value) : a.sel === p.correct;
      return { ok, blank: !answered(i) };
    });
    const c = res.filter((r) => r.ok).length, score = S.estimate(c / T.n), dom = {};
    T.qs.forEach((p, i) => {
      const dd = dom[p.domain] || (dom[p.domain] = [0, 0]);
      dd[1]++; if (res[i].ok) dd[0]++;
      const sk = S.skill(p.skill); sk.total++; if (res[i].ok) sk.correct++;
    });
    const d = S.day();
    d.sat += res.filter((r) => !r.blank).length;
    S.s.sat.push({ d: S.today(), score, c, n: T.n });
    const xp = c * 5;
    S.s.gems += 10;
    const goalHit = S.addXP(xp);
    const streak = S.extendStreak(), quests = S.claimQuests(), badges = S.checkBadges();
    S.save();
    const prev = S.s.sat.length > 1 ? S.s.sat[S.s.sat.length - 2].score : null;
    const steps = [{ type: 'test', score, prev, c, n: T.n, dom, xp, qs: T.qs, ans: T.ans, res }];
    if (streak.extended) steps.push({ type: 'streak', used: streak.used });
    if (goalHit || quests.length) steps.push({ type: 'quests', goalHit, quests });
    badges.forEach((b) => steps.push({ type: 'badge', b }));
    test = null;
    flow = { steps, i: 0, back: 'sat' };
    render();
  }

  // ═════════════ Celebration flow ═════════════
  function reviewItem(p, a, r, i) {
    const yours = r.blank ? 'Left blank' : p.type === 'grid' ? esc(a.input.replace(/-/g, '−')) : p.choices[a.sel];
    const right = p.type === 'grid' ? p.answer : p.choices[p.correct];
    return `<details class="rv ${r.ok ? 'ok' : 'no'}"><summary><span class="rv-n">${i + 1}</span><span class="rv-s">${skillById[p.skill].name}</span><span class="rv-i">${r.ok ? '✓' : '✕'}</span></summary>
      <div class="rv-body"><div class="q-prompt">${p.prompt}</div>${p.visual ? `<div class="visual">${p.visual}</div>` : ''}
        <p>Your answer: <b>${yours}</b>${r.ok ? '' : `<br>Correct: <b>${right}</b>`}</p><ol>${p.steps.map((s) => `<li>${s}</li>`).join('')}</ol></div></details>`;
  }
  const FLOW = {
    lesson(r) {
      const s = skillById[r.skill], up = r.after > r.before;
      return `<div class="flow-main">${me('cheer', 150, 'bounce')}
        <h1 class="flow-title">${r.perfect ? 'Perfect lesson!' : 'Lesson complete!'}</h1>
        <p class="flow-sub">${r.perfect ? say('perfect') : say('done')}</p>
        <div class="stat-tiles">
          <div class="tile t-xp"><div class="t-h">Total XP</div><div class="t-v">⚡<b data-count="${r.xp}">0</b></div></div>
          <div class="tile t-acc"><div class="t-h">${r.acc >= 0.9 ? 'Amazing' : r.acc >= 0.7 ? 'Good' : 'Accuracy'}</div><div class="t-v">🎯<b data-count="${Math.round(r.acc * 100)}" data-suffix="%">0</b></div></div>
          <div class="tile t-time"><div class="t-h">Time</div><div class="t-v">⏱<b>${fmtTime(r.secs)}</b></div></div>
        </div>
        ${up ? `<div class="level-up">${s.icon} <span><b>${s.name}</b> is now <b>${MASTERY[r.after]}</b>${r.after === 4 ? ' 👑' : ''}</span></div>`
          : r.before > 0 && r.before < 4 ? `<div class="level-hint">Get 5 of 6 right on the first try to level up <b>${s.name}</b>.</div>` : ''}
        <div class="gem-earn">+${r.gems} 💎</div></div>`;
    },
    test(r) {
      const delta = r.prev !== null ? r.score - r.prev : null;
      return `<div class="flow-main scroll">${me(r.score >= 600 ? 'cheer' : 'happy', 104, 'bounce')}
        <div class="kick">Estimated SAT Math</div><div class="score-big" data-count="${r.score}" data-from="200">200</div>
        ${delta !== null ? `<div class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta)} from last time</div>` : ''}
        <p class="flow-sub">${r.c} of ${r.n} correct · +${r.xp} XP · +10 💎</p>
        <p class="muted small">Rough estimate. The real SAT adapts to you, so treat this as a ballpark.</p>
        <div class="card left">${UNITS.filter((u) => r.dom[u.id]).map((u) => { const [c, t] = r.dom[u.id]; return `<div class="dom-row"><span>${u.sat}</span><div class="dom-bar"><i style="width:${Math.round((100 * c) / t)}%;background:${u.color}"></i></div><b>${c}/${t}</b></div>`; }).join('')}</div>
        <h3 class="sec-h left">Review every question</h3>
        <div class="review">${r.qs.map((p, i) => reviewItem(p, r.ans[i], r.res[i], i)).join('')}</div></div>`;
    },
    streak(r) {
      const n = S.s.streak;
      return `<div class="flow-main"><div class="big-flame">🔥</div><div class="streak-num" data-count="${n}" data-from="${Math.max(0, n - 1)}">${n}</div>
        <h1 class="flow-title">day streak!</h1>
        <p class="flow-sub">${r.used ? '🧊 A streak freeze saved you! ' : ''}${n === 1 ? 'Day one. Come back tomorrow to keep it going!' : say('streak')}</p>
        ${weekDots(S.week())}</div>`;
    },
    quests(r) {
      return `<div class="flow-main">${me('wow', 120, 'bounce')}<h1 class="flow-title">${r.goalHit ? 'Daily goal reached!' : 'Quest complete!'}</h1>
        <div class="quest-pay">${r.goalHit ? `<div class="qp"><span>⚡</span><div>Hit your ${S.s.goal} XP goal</div><b>+10 💎</b></div>` : ''}
        ${r.quests.map((q) => `<div class="qp"><span>${q.icon}</span><div>${q.text}</div><b>+${q.reward} 💎</b></div>`).join('')}</div></div>`;
    },
    badge(r) {
      return `<div class="flow-main"><div class="badge-big">${r.b.icon}</div><div class="kick">Badge unlocked</div>
        <h1 class="flow-title">${r.b.name}</h1><p class="flow-sub">${r.b.desc} · +10 💎</p></div>`;
    },
  };
  function renderFlow() {
    const st = flow.steps[flow.i];
    root().className = 'screen-flow';
    root().innerHTML = `<div class="flow flow-${st.type}">${FLOW[st.type](st)}<div class="flow-foot"><button class="btn btn-green big block" data-act="flow-next">Continue</button></div></div>`;
    countUp(root());
    $('[data-act="flow-next"]').focus({ preventScroll: true });
    if (st.type === 'lesson' || st.type === 'test') { snd.fanfare(); fx.shower(st.perfect ? 90 : 55); }
    else if (st.type === 'streak') { snd.fanfare(); fx.burstFrom($('.big-flame'), 30, { speed: 7 }); }
    else if (st.type === 'quests') { snd.coin(); fx.burstFrom($('.quest-pay'), 20); }
    else if (st.type === 'badge') { snd.fanfare(); fx.burstFrom($('.badge-big'), 36, { speed: 8 }); }
  }
  function flowNext() {
    flow.i++;
    if (flow.i >= flow.steps.length) { tab = flow.back; flow = null; render(); window.scrollTo(0, 0); }
    else renderFlow();
  }

  // ═════════════ Onboarding ═════════════
  function renderOnboard() {
    const steps = [
      () => `${me('cheer', 168, 'bounce')}<h1>Hiii ${NAME}! I’m Kiki 🌸</h1><p>Your dad built me so Algebra 2 and SAT math feel less like homework and more like a glow-up.</p>
        <button class="btn btn-pink big block" data-act="ob-next">Hi Kiki!</button>`,
      () => `${me('think', 104)}<h1>Pick a daily goal</h1><p>How much each day? You can change it anytime.</p>
        <div class="goal-pick">${GOALS.map(([g, lbl, min]) => `<button class="gp ${S.s.goal === g ? 'on' : ''}" data-act="ob-goal" data-g="${g}"><b>${lbl}</b><span>${g} XP · about ${min} min a day</span>${g === 60 ? '<em>Recommended</em>' : ''}</button>`).join('')}</div>
        <button class="btn btn-pink big block" data-act="ob-next">Continue</button>`,
      () => `${me('happy', 104, 'idle')}<h1>Here’s the deal</h1>
        <ul class="how"><li><span>🌸</span>Tap a flower on your path for a 3-minute lesson.</li>
        <li><span>🎀</span>Warm-Ups use real stuff (bows, heels, Birdies), then switch to x’s.</li>
        <li><span>🔁</span>Miss one? You get a redo at the end. No stress.</li>
        <li><span>📝</span>The SAT tab has timed practice with a score estimate.</li>
        <li><span>🔥</span>One lesson a day keeps your streak alive.</li></ul>
        <button class="btn btn-pink big block" data-act="ob-done">Let’s bloom</button>`,
    ];
    root().className = 'screen-onboard';
    root().innerHTML = `<div class="onboard"><div class="ob-dots" aria-hidden="true">${steps.map((_, i) => `<i class="${i === onboardStep ? 'on' : ''}"></i>`).join('')}</div>
      <div class="ob-card">${steps[onboardStep]()}</div></div>`;
  }

  // ═════════════ Dad's read-only report ═════════════
  function renderDad() {
    root().className = 'screen-dad';
    const r = dad;
    if (!r) {
      root().innerHTML = `<div class="dad"><div class="dad-empty">${me('oops', 96)}<h1>That link didn’t work</h1>
        <p>Ask ${NAME} to send a fresh one from Kiki → Me → Text Dad.</p><a class="btn btn-pink" href="${location.pathname}">Open Kiki</a></div></div>`;
      return;
    }
    const when = new Date(r.t).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const wkXP = r.week.reduce((t, x) => t + x.xp, 0);
    const mastered = Object.values(r.skills).filter((s) => s.level >= 4).length;
    const lastSat = r.sat[r.sat.length - 1];
    const units = UNITS.map((u) => `<div class="dad-unit" style="${unitVars(u)}"><h4>${u.name}</h4>${SKILLS.filter((s) => s.unit === u.id).map((s) => {
      const k = r.skills[s.id] || { level: 0, correct: 0, total: 0 };
      return `<div class="dad-skill"><span>${s.icon} ${s.name}</span><span class="lvl lvl${k.level}">${masteryLabel(k)}</span><small>${k.total ? `${Math.round((100 * k.correct) / k.total)}% of ${k.total}` : '—'}</small></div>`;
    }).join('')}</div>`).join('');
    root().innerHTML = `<div class="dad">
      <header class="dad-top">${KK.mascot.kiki('cheer', { size: 76 })}<div><div class="kick">Kiki report</div><h1>${NAME}’s progress</h1><p class="muted">Snapshot from ${when}</p></div></header>
      <div class="stat-grid">
        <div class="sg"><span>🔥</span><b>${r.streak}</b><small>Day streak (best ${r.best})</small></div>
        <div class="sg"><span>⚡</span><b>${wkXP}</b><small>XP this week</small></div>
        <div class="sg"><span>👑</span><b>${mastered}/${SKILLS.length}</b><small>Skills mastered</small></div>
        <div class="sg"><span>📝</span><b>${lastSat ? lastSat.score : '—'}</b><small>Latest SAT estimate</small></div>
      </div>
      <h3 class="sec-h">This week</h3><div class="card">${xpChart(r.week, r.goal)}</div>
      <h3 class="sec-h">SAT practice</h3><div class="card">${r.sat.length ? r.sat.slice().reverse().map((x) => `<div class="hist-row"><span>${fmtDate(x.d)}</span><span>${x.n >= 22 ? 'Module' : 'Sprint'} · ${x.c}/${x.n}</span><b>${x.score}</b></div>`).join('') : '<p class="muted">No SAT practice sets yet.</p>'}</div>
      <h3 class="sec-h">Skills</h3><div class="card dad-skills">${units}</div>
      <p class="muted small center">Last practiced: ${fmtDate(r.last)} · ${r.badges.length} badges earned.<br>This is a snapshot. ${NAME} can send a fresh one anytime.</p>
      <a class="btn btn-pink block" href="${location.pathname}">Open Kiki</a>
    </div>`;
  }

  // ═════════════ Share & settings ═════════════
  function reportLink() {
    const code = S.encodeReport();
    return /^https?:/.test(location.protocol) ? `${location.origin}${location.pathname}?d=${code}` : `?d=${code}`;
  }
  function copy(text, ok) {
    const fallback = () => window.prompt('Copy this:', text);
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(() => toast(ok), fallback);
    else fallback();
  }

  // ═════════════ Router ═════════════
  function render() {
    if (dadMode) return renderDad();
    if (!S.s.onboarded) return renderOnboard();
    if (lesson) return renderLesson();
    if (test) return renderTest();
    if (flow) return renderFlow();
    renderTabs();
  }

  const ACT = {
    tab(el) { tab = el.dataset.tab; sheet = null; render(); window.scrollTo(0, 0); },
    sound() { S.s.sound = !S.s.sound; snd.enabled = S.s.sound; S.save(); if (S.s.sound) snd.pop(); render(); },
    skill(el) { sheet = el.dataset.id; snd.tap(); render(); },
    'close-sheet'() { sheet = null; render(); },
    start(el) { startLesson(el.dataset.id); },
    pick(el) { pick(+el.dataset.i); },
    key(el) { key(el.dataset.k); },
    hint, check,
    continue: next,
    quit() {
      openLayer(`<div class="sheet-bg" data-act="quit-stay"></div><div class="sheet center" role="dialog" aria-modal="true" aria-label="Leave lesson?">
        ${me('oops', 88)}<h3>Wait, don’t go! 🥺</h3><p class="muted">You’ll lose your progress in this lesson.</p>
        <button class="btn btn-pink big block" data-act="quit-stay">Keep learning</button><button class="btn btn-text block" data-act="quit-leave">End lesson</button></div>`);
    },
    'quit-stay': closeLayer,
    'quit-leave'() { lesson = null; render(); },
    'flow-next': flowNext,
    test(el) { startTest(+el.dataset.n); },
    'test-quit'() {
      openLayer(`<div class="sheet-bg" data-act="quit-stay"></div><div class="sheet center" role="dialog" aria-modal="true" aria-label="Leave practice?">
        ${me('oops', 88)}<h3>Leave this practice set?</h3><p class="muted">Your answers won’t be scored.</p>
        <button class="btn btn-pink big block" data-act="quit-stay">Keep going</button><button class="btn btn-text block" data-act="test-leave">Leave</button></div>`);
    },
    'test-leave'() { clearInterval(testTimer); test = null; render(); },
    tprev() { goQ(test.i - 1); },
    tnext() { if (test.i === test.n - 1) { test.nav = true; renderTest(); } else goQ(test.i + 1); },
    tnav() { test.nav = true; renderTest(); },
    'tnav-close'() { test.nav = false; test.confirm = false; renderTest(); },
    tgo(el) { goQ(+el.dataset.i); },
    flag() { const a = test.ans[test.i]; a.flag = !a.flag; renderTest(); },
    timer() { test.hide = !test.hide; renderTest(); },
    tsubmit() { if (test.qs.some((_, i) => !answered(i))) { test.confirm = true; renderTest(); } else finishTest(); },
    'tconfirm-no'() { test.confirm = false; renderTest(); },
    'tsubmit-yes'() { finishTest(); },
    buy(el) {
      const it = SHOP.find((x) => x.id === el.dataset.id), s = S.s;
      if (!it || s.gems < it.price) return;
      s.gems -= it.price;
      if (it.id === 'freeze') s.freezes = Math.min(2, s.freezes + 1);
      else { s.owned.push(it.id); s.wearing = it.id; }
      S.save();
      snd.coin();
      fx.burstFrom(el, 18);
      toast(it.id === 'freeze' ? '🧊 Streak freeze ready!' : `Kiki is wearing ${it.name.replace('Kiki’s ', 'her ')} ✨`);
      render();
    },
    wear(el) { S.s.wearing = S.s.wearing === el.dataset.id ? null : el.dataset.id; S.save(); snd.pop(); render(); },
    goal(el) { S.s.goal = +el.dataset.g; S.save(); snd.tap(); render(); },
    'text-dad'() {
      const s = S.s, wk = S.week().reduce((t, x) => t + x.xp, 0), sat = s.sat.length ? s.sat[s.sat.length - 1].score : null;
      const body = `hi dad 🌸 kiki update: 🔥 ${S.liveStreak()}-day streak · ⚡ ${wk} XP this week · 👑 ${S.mastered()} skills mastered${sat ? ` · 📝 SAT est. ${sat}` : ''}\nmy report: ${reportLink()}`;
      location.href = `sms:?&body=${encodeURIComponent(body)}`;
    },
    'copy-report'() { copy(reportLink(), 'Report link copied ✨'); },
    backup() { copy(S.backup(), 'Backup copied. Paste it on your new phone ✨'); },
    restore() {
      const code = window.prompt('Paste your backup code:');
      if (!code) return;
      if (S.restore(code)) { snd.enabled = S.s.sound; toast('Progress restored ✨'); render(); } else toast('That code didn’t work 😕');
    },
    reset() {
      if (!window.confirm('Erase all Kiki progress on this phone? This can’t be undone.')) return;
      S.reset(); onboardStep = 0; tab = 'learn'; render();
    },
    'ob-next'() { onboardStep++; snd.tap(); render(); },
    'ob-goal'(el) { S.s.goal = +el.dataset.g; S.save(); snd.tap(); render(); },
    'ob-done'() { S.s.onboarded = true; S.save(); snd.pop(); fx.shower(40); render(); },
  };

  function onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    fn(el, e);
  }
  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target, tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'summary') return;
    const onButton = tag === 'button' || tag === 'a';
    const answerTarget = onButton && t.matches('.choice, .key');
    if (e.key === 'Enter' && onButton && !answerTarget) return; // the button's own click handles it
    if (lesson) {
      const p = lesson.qs[lesson.i];
      if (lesson.phase === 'answer') {
        if (p.type === 'mc' && /^[1-4]$/.test(e.key) && +e.key <= p.choices.length) { pick(+e.key - 1); return; }
        if (p.type === 'grid' && /^([\d./-]|Backspace)$/.test(e.key)) { e.preventDefault(); key(e.key === '-' ? '−' : e.key === 'Backspace' ? '⌫' : e.key); return; }
        if (e.key === 'Enter') { e.preventDefault(); check(); }
      } else if (e.key === 'Enter') { e.preventDefault(); next(); }
      return;
    }
    if (test && !test.nav && !$('.layer')) {
      const p = test.qs[test.i];
      if (p.type === 'mc' && /^[1-4a-dA-D]$/.test(e.key)) {
        const i = /\d/.test(e.key) ? +e.key - 1 : e.key.toLowerCase().charCodeAt(0) - 97;
        if (i < p.choices.length) pick(i);
        return;
      }
      if (p.type === 'grid' && /^([\d./-]|Backspace)$/.test(e.key)) { e.preventDefault(); key(e.key === '-' ? '−' : e.key === 'Backspace' ? '⌫' : e.key); return; }
      if (e.key === 'ArrowRight') ACT.tnext();
      if (e.key === 'ArrowLeft' && test.i > 0) ACT.tprev();
      return;
    }
    if (e.key === 'Escape') {
      if ($('.layer')) closeLayer();
      else if (sheet) { sheet = null; render(); }
    }
  }

  function boot() {
    fx.init($('#fx'));
    snd.enabled = S.s.sound;
    const q = new URLSearchParams(location.search);
    if (q.has('d')) { dadMode = true; dad = S.decodeReport(q.get('d')); }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', () => snd.unlock(), { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && test) tickTest(); });
    render();
    window.KIKI_DEBUG = { get lesson() { return lesson; }, get test() { return test; }, get flow() { return flow; }, store: S };
  }

  return { boot };
})();

KK.app.boot();
