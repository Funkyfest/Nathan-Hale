KK.content = (() => {
  const { MINUS, rand, pick, chance, shuffle, gcd, n, paren, sup, lead, term, poly, frac, money, dec, choices, near } = KK.math;

  // Things Keaton actually buys. Prices are picked so the math comes out clean.
  const ITEMS = [
    { e: '🎀', one: 'bow', many: 'bows', p: [4, 5, 6, 8] },
    { e: '👠', one: 'pair of heels', many: 'pairs of heels', p: [25, 30, 35, 40] },
    { e: '🦋', one: 'butterfly clip', many: 'butterfly clips', p: [2, 3, 4] },
    { e: '👗', one: 'dress', many: 'dresses', p: [20, 25, 30, 35] },
    { e: '💄', one: 'lip gloss', many: 'lip glosses', p: [6, 8, 10, 12] },
    { e: '👟', one: 'pair of sneakers', many: 'pairs of sneakers', p: [45, 50, 60] },
    { e: '💅', one: 'nail polish', many: 'nail polishes', p: [5, 7, 9] },
    { e: '👜', one: 'bag', many: 'bags', p: [15, 20, 25] },
    { e: '🥤', one: 'smoothie', many: 'smoothies', p: [5, 6, 7] },
  ];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const tok = (it, k) =>
    `<span class="tok" role="img" aria-label="${k} ${k === 1 ? it.one : it.many}">${k <= 5 ? it.e.repeat(k) : `${k}×${it.e}`}</span>`;
  const op = (s) => `<span class="op">${s}</span>`;
  const cash = (v) => `<span class="cash">${money(v)}</span>`;
  const eqv = (...parts) => `<div class="eqv">${parts.join('')}</div>`;
  const eq = (s) => `<div class="eq">${s}</div>`;
  const think = (s) => `<div class="think">${s}</div>`;
  function make(p) {
    const { wrongs, ...rest } = p;
    const { list, idx } = choices(p.answer, wrongs || []);
    return { ...rest, choices: list, correct: idx };
  }
  function twoItems(cheapFirst) {
    let A, B;
    do { [A, B] = shuffle(ITEMS.slice()).slice(0, 2); } while (cheapFirst && A.p[A.p.length - 1] >= B.p[0]);
    return [A, B];
  }

  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  function triple() {
    const t = pick(TRIPLES);
    const k = t[2] === 5 ? rand(1, 3) : 1;
    const [a, b, c] = t.map((v) => v * k);
    return chance(0.5) ? [a, b, c] : [b, a, c];
  }
  // Right triangle: v = vertical leg, h = horizontal leg, c = hypotenuse; θ sits at the bottom-right corner.
  function tri({ v, h, c, angle = false }) {
    return `<svg class="tri" viewBox="0 0 200 142" role="img" aria-label="Right triangle: vertical side ${v}, bottom side ${h}, long side ${c}">
      <polygon points="30,20 30,120 180,120" fill="#FFF0F6" stroke="#FF4B91" stroke-width="4" stroke-linejoin="round"/>
      <rect x="30" y="104" width="16" height="16" fill="none" stroke="#FF4B91" stroke-width="3"/>
      ${angle ? '<path d="M152 120 A28 28 0 0 1 157 104" fill="none" stroke="#9B6BFF" stroke-width="3"/><text x="138" y="116" class="tl ang">θ</text>' : ''}
      <text x="14" y="76" class="tl" text-anchor="middle">${v}</text>
      <text x="105" y="140" class="tl" text-anchor="middle">${h}</text>
      <text x="120" y="62" class="tl" text-anchor="middle">${c}</text>
    </svg>`;
  }

  const FLIP = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' };

  const PCTX = [
    { title: '🍗 Birdies orders tonight', rows: ['Tenders', 'Wings'], cols: ['Mild', 'Spicy'], who: 'order', pron: 'it',
      rowIs: ['is tenders', 'is wings'], colIs: ['is mild', 'is spicy'],
      colGroup: ['mild orders', 'spicy orders'], rowAre: ['tenders', 'wings'] },
    { title: '🎀 Cheer squad hair survey', rows: ['Juniors', 'Seniors'], cols: ['Bows', 'Scrunchies'], who: 'cheerleader', pron: 'they',
      rowIs: ['is a junior', 'is a senior'], colIs: ['picked bows', 'picked scrunchies'],
      colGroup: ['cheerleaders who picked bows', 'cheerleaders who picked scrunchies'], rowAre: ['juniors', 'seniors'] },
  ];
  function twoWay() {
    const ctx = pick(PCTX);
    const m = [[rand(3, 15), rand(3, 15)], [rand(3, 15), rand(3, 15)]];
    const rowT = [m[0][0] + m[0][1], m[1][0] + m[1][1]];
    const colT = [m[0][0] + m[1][0], m[0][1] + m[1][1]];
    const T = rowT[0] + rowT[1];
    const html = `<table class="tbl"><caption>${ctx.title}</caption>
      <thead><tr><th></th><th>${ctx.cols[0]}</th><th>${ctx.cols[1]}</th><th>Total</th></tr></thead>
      <tbody>
        <tr><th>${ctx.rows[0]}</th><td>${m[0][0]}</td><td>${m[0][1]}</td><td>${rowT[0]}</td></tr>
        <tr><th>${ctx.rows[1]}</th><td>${m[1][0]}</td><td>${m[1][1]}</td><td>${rowT[1]}</td></tr>
        <tr class="tot"><th>Total</th><td>${colT[0]}</td><td>${colT[1]}</td><td>${T}</td></tr>
      </tbody></table>`;
    return { ctx, m, rowT, colT, T, html };
  }

  const SKILLS = [
    // ───────── Unit 1: Algebra ─────────
    {
      id: 'lin', story: true, unit: 'alg', icon: '🎀', name: 'Linear equations', blurb: 'Solve for x, the #1 thing on the SAT.',
      gen: {
        easy() {
          const it = pick(ITEMS), x = pick(it.p), k = rand(2, 5);
          const [fee, what] = pick([[3, 'shipping fee'], [4, 'gift box'], [5, 'shipping fee'], [2, 'tote bag'], [6, 'gift wrap']]);
          const T = k * x + fee;
          return make({
            label: `How much is one ${it.e}?`,
            prompt: `You buy ${k} ${it.many} plus a ${money(fee)} ${what}. You pay ${money(T)} total. How much is one ${it.one}?`,
            visual: eqv(tok(it, k), op('+'), cash(fee), op('='), cash(T)),
            answer: money(x), value: x, unit: '$',
            wrongs: [...near(x, [-2, -1, 1, 2, 3], money, (v) => v > 0), money(+(T / k).toFixed(2)), money(T - fee)],
            steps: [
              `Take away the ${what}: ${k} ${it.e} = ${money(T)} − ${money(fee)} = ${money(T - fee)}`,
              `Split it ${k} ways: one ${it.e} = ${money(T - fee)} ÷ ${k} = <b>${money(x)}</b>`,
            ],
            hint: `First take the ${money(fee)} ${what} out of the total.`,
            bridge: `In algebra: <b>${k}x + ${fee} = ${T}</b>, where <b>x</b> = one ${it.e}. Same problem!`,
          });
        },
        medium() {
          const a = rand(2, 7);
          let c = rand(-5, 6);
          while (c === a || c === 0) c = rand(-5, 6);
          const x = rand(-6, 9), b = rand(-9, 9) || 4, d = a * x + b - c * x;
          return make({
            label: 'Solve for x',
            prompt: 'Find the value of <i>x</i>.',
            visual: eq(`${lead(a, 'x')}${term(b)} = ${lead(c, 'x')}${term(d)}`),
            answer: `x = ${n(x)}`, value: x,
            wrongs: near(x, [-3, -2, -1, 1, 2, 3], (v) => `x = ${n(v)}`),
            steps: [
              `Move ${lead(c, 'x')} to the left side: ${lead(a - c, 'x')}${term(b)} = ${n(d)}`,
              `Undo the${term(b)}: ${lead(a - c, 'x')} = ${n(d - b)}`,
              `Divide by ${n(a - c)}: <b>x = ${n(x)}</b>`,
            ],
            hint: 'Collect the x’s on one side and the plain numbers on the other.',
          });
        },
        hard() {
          if (chance(0.4)) {
            const a = rand(2, 6), b = rand(1, 9), x = rand(2, 9), m = pick([2, 3, 4]), T = a * x + b;
            return make({
              label: 'SAT shortcut',
              prompt: `If ${a}x + ${b} = ${T}, what is the value of ${a * m}x + ${b * m}?`,
              answer: n(T * m), value: T * m,
              wrongs: [n(x), n(T), n(x * m), ...near(T * m, [-m, m, b])],
              steps: [`Notice ${a * m}x + ${b * m} = ${m}(${a}x + ${b}).`, `So it equals ${m} × ${T} = <b>${T * m}</b>. No need to find x!`],
              hint: `Compare ${a * m}x + ${b * m} with ${a}x + ${b}. Spot the pattern?`,
            });
          }
          let a, b;
          do { a = rand(2, 6); b = rand(2, 6); } while (a === b);
          const p = rand(-6, 6) || 2, q = rand(-6, 6) || -3, x = rand(-6, 7);
          const r = (a - b) * x + a * p - b * q;
          return make({
            label: 'Solve for x',
            prompt: 'Find the value of <i>x</i>.',
            visual: eq(`${a}(x${term(p)}) = ${b}(x${term(q)})${term(r)}`),
            answer: `x = ${n(x)}`, value: x,
            wrongs: near(x, [-3, -2, -1, 1, 2, 4], (v) => `x = ${n(v)}`),
            steps: [
              `Distribute: ${a}x${term(a * p)} = ${b}x${term(b * q)}${term(r)}`,
              `Collect like terms: ${lead(a - b, 'x')} = ${n(b * q + r - a * p)}`,
              `Divide by ${n(a - b)}: <b>x = ${n(x)}</b>`,
            ],
            hint: 'Distribute first: multiply the outside number into everything in the parentheses.',
          });
        },
      },
    },
    {
      id: 'ineq', story: true, unit: 'alg', icon: '⚖️', name: 'Inequalities', blurb: 'Budgets, limits, and the sign-flip trap.',
      gen: {
        easy() {
          const it = pick(ITEMS.filter((i) => i.p[0] <= 10)), p = pick(it.p);
          const f = pick([4, 5, 6, 8]), B = pick([40, 50, 60, 75]);
          const k = Math.floor((B - f) / p);
          return make({
            label: `How many ${it.e} can you get?`,
            prompt: `You have ${money(B)}. ${cap(it.many)} cost ${money(p)} each, plus ${money(f)} shipping. What’s the most ${it.many} you can buy?`,
            visual: eqv(`<span class="tok">?×${it.e}</span>`, op('+'), cash(f), op('≤'), cash(B)),
            answer: String(k), value: k,
            wrongs: [String(k + 1), String(k - 1), String(Math.floor(B / p)), String(k + 2)],
            steps: [
              `Spend at most ${money(B)}: ${p}x + ${f} ≤ ${B}`,
              `Take away shipping: ${p}x ≤ ${B - f}`,
              `Divide: x ≤ ${dec((B - f) / p)}`,
              `You can’t buy part of one, so round <b>down</b>: <b>${k}</b>`,
            ],
            hint: 'Take out shipping first. Then see how many fit in what’s left.',
            bridge: `In algebra: <b>${p}x + ${f} ≤ ${B}</b>, where <b>x</b> = number of ${it.e}.`,
          });
        },
        medium() {
          const a = rand(2, 6), k = rand(-5, 8), b = rand(-9, 9) || 3, s = pick(Object.keys(FLIP)), c = a * k + b;
          return make({
            label: 'Solve the inequality',
            prompt: 'Which values of <i>x</i> work?',
            visual: eq(`${a}x${term(b)} ${s} ${n(c)}`),
            answer: `x ${s} ${n(k)}`,
            wrongs: [`x ${FLIP[s]} ${n(k)}`, `x ${s} ${frac(c + b, a)}`, `x ${s} ${n(c - b)}`, `x ${s} ${n(k + 1)}`],
            steps: [`Undo the${term(b)}: ${a}x ${s} ${n(c - b)}`, `Divide by ${a}. It’s positive, so the sign stays: <b>x ${s} ${n(k)}</b>`],
            hint: 'Solve it like an equation. Dividing by a positive number keeps the sign.',
          });
        },
        hard() {
          const a = rand(2, 6), k = rand(-5, 8), b = rand(-9, 9) || 5, s = pick(Object.keys(FLIP)), c = -a * k + b;
          return make({
            label: 'Watch the sign',
            prompt: 'Careful with this one. Which values of <i>x</i> work?',
            visual: eq(`${n(b)}${term(-a, 'x')} ${s} ${n(c)}`),
            answer: `x ${FLIP[s]} ${n(k)}`,
            wrongs: [`x ${s} ${n(k)}`, `x ${FLIP[s]} ${n(-k)}`, `x ${s} ${n(-k)}`, `x ${FLIP[s]} ${n(k + 1)}`],
            steps: [
              `Undo the ${n(b)}: ${lead(-a, 'x')} ${s} ${n(c - b)}`,
              `Divide by ${n(-a)}. ⚠️ Dividing by a negative <b>flips</b> the sign!`,
              `<b>x ${FLIP[s]} ${n(k)}</b>`,
            ],
            hint: 'Multiplying or dividing by a negative flips the inequality sign.',
          });
        },
      },
    },
    {
      id: 'linfn', unit: 'alg', icon: '📈', name: 'Lines & slope', blurb: 'Slope, rates, and what the numbers mean.',
      gen: {
        easy() {
          if (chance(0.5)) {
            const w = pick([11, 12, 13, 14, 15]), t = pick([30, 40, 50, 60]), h = rand(3, 8), P = w * h + t;
            return make({
              label: 'Birdies payday 🍗',
              prompt: `At Birdies you earn ${money(w)} an hour plus about ${money(t)} in tips each shift. Your pay for an <i>h</i>-hour shift is P(h) = ${w}h + ${t}. What is P(${h})?`,
              answer: money(P), value: P, unit: '$',
              wrongs: [money(w * h), money((w + t) * h), money(w + t + h), ...near(P, [-w, w, -10], money)],
              steps: [`P(${h}) means “plug in ${h} for h”.`, `P(${h}) = ${w}(${h}) + ${t} = ${w * h} + ${t} = <b>${money(P)}</b>`],
              hint: `Replace every h with ${h}.`,
              bridge: `P(${h}) is your pay for a ${h}-hour shift. Function notation is just a label.`,
            });
          }
          const s = pick([950, 1000, 1050, 1100]), g = pick([20, 25, 30, 40]), k = rand(2, 6), S = s + g * k;
          return make({
            label: 'SAT glow-up 🎓',
            prompt: `Your SAT practice score after <i>n</i> more practice tests is about S(n) = ${s} + ${g}n. What is S(${k})?`,
            answer: String(S), value: S,
            wrongs: [String(s + g), String(g * k), ...near(S, [-g, g, 2 * g])],
            steps: [`Plug in n = ${k}: S(${k}) = ${s} + ${g}(${k})`, `= ${s} + ${g * k} = <b>${S}</b>`],
            hint: `Replace n with ${k}.`,
            bridge: `S(${k}) is your predicted score after ${k} more practice tests.`,
          });
        },
        medium() {
          const x1 = rand(-5, 4), y1 = rand(-6, 6);
          const dx = rand(1, 6) * pick([1, 1, -1]), dy = rand(-8, 8) || 3;
          const x2 = x1 + dx, y2 = y1 + dy, m = frac(dy, dx);
          return make({
            label: 'Find the slope',
            prompt: `What is the slope of the line through (${n(x1)}, ${n(y1)}) and (${n(x2)}, ${n(y2)})?`,
            answer: m, value: dy / dx,
            wrongs: [frac(dx, dy), frac(-dy, dx), x1 + x2 !== 0 ? frac(y1 + y2, x1 + x2) : null, frac(dy + 1, dx)],
            steps: [
              'Slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁)',
              `= (${n(y2)} − ${paren(y1)}) ÷ (${n(x2)} − ${paren(x1)}) = ${n(dy)} ÷ ${n(dx)}`,
              `= <b>${m}</b>`,
            ],
            hint: 'Slope is the change in y divided by the change in x.',
          });
        },
        hard() {
          const sc = pick([
            () => {
              const s = pick([100, 120, 150]), r = pick([10, 15, 20, 25]);
              return { ctx: 'Your Sephora gift card balance after <i>w</i> weeks is', model: `B(w) = ${s} − ${r}w`, ask: r,
                right: `You spend ${money(r)} per week`, wrong: [`You started with ${money(r)}`, `The card lasts ${r} weeks`, `You spend ${money(s)} per week`],
                why: `${r} is multiplied by w (weeks), so it’s a <b>rate</b>: dollars per week.` };
            },
            () => {
              const s = pick([900, 1000, 1050]), g = pick([20, 25, 30]);
              return { ctx: 'Your predicted SAT score after <i>n</i> more practice tests is', model: `S(n) = ${s} + ${g}n`, ask: g,
                right: `Your score goes up about ${g} points per test`, wrong: [`Your first score was ${g}`, `You need ${g} more tests`, `Your score goes up ${g}% per test`],
                why: `${g} is multiplied by n (tests), so it’s a <b>rate</b>: points per test.` };
            },
            () => {
              const w = pick([11, 12, 14]), t = pick([30, 40, 50]);
              return { ctx: 'Your pay for an <i>h</i>-hour Birdies shift is', model: `P(h) = ${w}h + ${t}`, ask: t,
                right: `You make about ${money(t)} in tips no matter how long you work`, wrong: [`You earn ${money(t)} per hour`, `You work ${t} hours`, `Your hourly pay goes up by ${money(t)}`],
                why: `${t} is <b>not</b> multiplied by h, so it doesn’t depend on hours. It’s the fixed amount: your tips.` };
            },
          ])();
          return make({
            label: 'What does it mean?',
            prompt: `${sc.ctx} <b>${sc.model}</b>. What does the <b>${sc.ask}</b> tell you?`,
            answer: sc.right, wrongs: sc.wrong,
            steps: ['In a linear model, the number <b>times the variable</b> is the rate. The number <b>by itself</b> is the starting or fixed amount.', sc.why],
            hint: 'Is the number multiplied by the variable, or standing alone?',
          });
        },
      },
    },
    {
      id: 'sys', story: true, unit: 'alg', icon: '👯', name: 'Systems of equations', blurb: 'Two unknowns, two clues.',
      gen: {
        easy() {
          const [A, B] = twoItems(false);
          const x = pick(A.p), y = pick(B.p), a = rand(1, 2), b = rand(1, 2);
          const T1 = (a + 1) * x + b * y, T2 = a * x + b * y;
          return make({
            label: `How much is one ${A.e}?`,
            prompt: `Two receipts from the mall. The only difference is one extra ${A.one}. How much is one ${A.one}?`,
            visual: `<div class="receipts">${eqv(tok(A, a + 1), op('+'), tok(B, b), op('='), cash(T1))}${eqv(tok(A, a), op('+'), tok(B, b), op('='), cash(T2))}</div>`,
            answer: money(x), value: x, unit: '$',
            wrongs: [money(y), ...near(x, [-5, 5, -2, 2], money, (v) => v > 0), money(+(T1 / (a + 1 + b)).toFixed(2))],
            steps: [`The top receipt has exactly one more ${A.e}. Everything else matches.`, `So one ${A.e} = ${money(T1)} − ${money(T2)} = <b>${money(x)}</b>`],
            hint: 'Compare the two receipts. What’s different?',
            bridge: `In algebra: <b>${lead(a + 1, 'x')} + ${lead(b, 'y')} = ${T1}</b> and <b>${lead(a, 'x')} + ${lead(b, 'y')} = ${T2}</b>. Subtracting one from the other is called <b>elimination</b>.`,
          });
        },
        medium() {
          const [A, B] = twoItems(true);
          const pa = pick(A.p), pb = pick(B.p), x = rand(2, 6), y = rand(2, 6), N = x + y, T = pa * x + pb * y;
          const fmt = (p, q) => `${p} ${p === 1 ? A.one : A.many}, ${q} ${q === 1 ? B.one : B.many}`;
          const ans = fmt(x, y);
          const alts = [[y, x], [x + 1, y - 1], [x - 1, y + 1], [x + 2, y - 2], [x - 2, y + 2]]
            .filter(([p, q]) => p > 0 && q > 0).map(([p, q]) => fmt(p, q));
          return make({
            label: 'How many of each?',
            prompt: `You bought ${N} things: ${A.many} at ${money(pa)} each and ${B.many} at ${money(pb)} each. You spent ${money(T)}. How many of each did you buy?`,
            answer: ans, wrongs: alts,
            steps: [
              `Two equations. Count: a + b = ${N}. Money: ${pa}a + ${pb}b = ${T}.`,
              `Swap in a = ${N} − b: ${pa}(${N} − b) + ${pb}b = ${T}, so ${pb - pa}b = ${T - pa * N}`,
              `b = ${y}, so a = ${N} − ${y} = ${x}. <b>${ans}</b>`,
            ],
            hint: 'One equation counts the items. One counts the dollars.',
            bridge: `On the SAT this is a <b>system of equations</b>: x + y = ${N} and ${pa}x + ${pb}y = ${T}.`,
          });
        },
        hard() {
          let a, b, c, d, x, y;
          do {
            x = rand(-5, 6); y = rand(-5, 6); a = rand(1, 5); b = rand(-4, 4) || 2; c = rand(-4, 5) || 1; d = rand(1, 5);
          } while (a * d - b * c === 0 || (x === 0 && y === 0));
          const e = a * x + b * y, f = c * x + d * y;
          const ask = pick(['x', 'y', 'x + y']);
          const val = ask === 'x' ? x : ask === 'y' ? y : x + y;
          return make({
            label: 'System of equations',
            prompt: `If (x, y) solves the system below, what is the value of <b>${ask}</b>?`,
            visual: eq(`${lead(a, 'x')}${term(b, 'y')} = ${n(e)}<br>${lead(c, 'x')}${term(d, 'y')} = ${n(f)}`),
            answer: n(val), value: val,
            wrongs: [n(ask === 'x' ? y : x), ...near(val, [-2, -1, 1, 2, 3])],
            steps: [
              'Use elimination: multiply one equation so a variable cancels when you add them.',
              `You get x = ${n(x)} and y = ${n(y)}.`,
              ask === 'x + y' ? `x + y = ${n(x)} + ${paren(y)} = <b>${n(val)}</b>` : `<b>${ask} = ${n(val)}</b>`,
            ],
            hint: 'Make the x’s (or y’s) cancel, then solve for the other one.',
          });
        },
      },
    },

    // ───────── Unit 2: Advanced Math ─────────
    {
      id: 'fn', unit: 'adv', icon: '🪄', name: 'Function notation', blurb: 'f(x), plugging in, and compositions.',
      gen: {
        easy() {
          const a = rand(2, 6), b = rand(-8, 8) || 3, k = rand(-5, 6), v = a * k + b;
          return make({
            label: 'Function notation',
            prompt: `If f(x) = ${a}x${term(b)}, what is f(${n(k)})?`,
            answer: n(v), value: v,
            wrongs: [n(a * k), n(a + k + b), ...near(v, [-a, a, -2, 2])],
            steps: [`f(${n(k)}) means “put ${n(k)} in for x”.`, `f(${n(k)}) = ${a}(${n(k)})${term(b)} = ${n(a * k)}${term(b)} = <b>${n(v)}</b>`],
            hint: `Replace x with ${n(k)}.`,
          });
        },
        medium() {
          if (chance(0.35)) {
            const z = rand(-6, 6) || 3;
            return make({
              label: 'Domain',
              prompt: `Which value of x is <b>not</b> allowed in f(x) = 1 / (x${term(-z)})?`,
              answer: `x = ${n(z)}`,
              wrongs: [`x = ${n(-z)}`, 'x = 0', `x = ${n(z + 1)}`, `x = ${n(z - 2)}`],
              steps: ['You can’t divide by zero.', `x${term(-z)} = 0 when <b>x = ${n(z)}</b>.`],
              hint: 'Which x makes the bottom equal 0?',
            });
          }
          const b = rand(-6, 6), c = rand(-9, 9), k = -rand(1, 5), v = k * k + b * k + c;
          return make({
            label: 'Function notation',
            prompt: `If f(x) = ${poly([1, b, c])}, what is f(${n(k)})?`,
            answer: n(v), value: v,
            wrongs: [n(-(k * k) + b * k + c), n(k * k - b * k + c), ...near(v, [-2, 2, 4])],
            steps: [
              `Plug in x = ${n(k)}: f(${n(k)}) = (${n(k)})²${b ? `${term(b)}(${n(k)})` : ''}${term(c)}`,
              `(${n(k)})² = ${k * k}. A negative squared is positive!`,
              `= ${k * k}${term(b * k)}${term(c)} = <b>${n(v)}</b>`,
            ],
            hint: 'Use parentheses when you plug in a negative number.',
          });
        },
        hard() {
          const a = rand(2, 4), b = rand(-5, 5) || 2, c = rand(2, 4), d = rand(-5, 5) || -1, k = rand(-3, 4);
          const g = c * k + d, v = a * g + b, rev = c * (a * k + b) + d;
          return make({
            label: 'Composition',
            prompt: `f(x) = ${a}x${term(b)} and g(x) = ${c}x${term(d)}. What is f(g(${n(k)}))?`,
            answer: n(v), value: v,
            wrongs: [n(rev), n(g), n((a * k + b) * (c * k + d)), ...near(v, [-a, a])],
            steps: [
              `Work inside out. g(${n(k)}) = ${c}(${n(k)})${term(d)} = ${n(g)}`,
              `Then f(${n(g)}) = ${a}(${n(g)})${term(b)} = <b>${n(v)}</b>`,
            ],
            hint: 'Do g first, then put that answer into f.',
          });
        },
      },
    },
    {
      id: 'quad', story: true, unit: 'adv', icon: '💄', name: 'Quadratics', blurb: 'Factor, solve, and the discriminant.',
      gen: {
        easy() {
          let r, s;
          do { r = rand(-7, 7); s = rand(-7, 7); } while (!r || !s);
          const b = -(r + s), c = r * s;
          const f = (u, v) => `(x${term(-Math.min(u, v))})(x${term(-Math.max(u, v))})`;
          const ans = f(r, s);
          const pairs = [];
          for (let p = 1; p <= Math.abs(c); p++) {
            if (c % p === 0) pairs.push([p, c / p], [-p, -c / p]);
          }
          const wrongs = [f(-r, -s), f(r, -s), f(-r, s), ...pairs.filter(([p, q]) => p + q !== r + s).map(([p, q]) => f(p, q))];
          return make({
            label: 'Factor it',
            prompt: 'Which is the factored form?',
            visual: eq(`x²${term(b, 'x')}${term(c)}`),
            answer: ans, wrongs,
            steps: [
              `Find two numbers that multiply to ${n(c)} and add to ${n(b)}.`,
              `${n(-r)} and ${n(-s)} work: ${paren(-r)} × ${paren(-s)} = ${n(c)} and ${paren(-r)} + ${paren(-s)} = ${n(b)}`,
              `So it factors as <b>${ans}</b>`,
            ],
            hint: `Two numbers: multiply to ${n(c)}, add to ${n(b)}.`,
          });
        },
        medium() {
          let r, s;
          do { r = rand(-8, 8); s = rand(-8, 8); } while (r === s || !r || !s);
          const b = -(r + s), c = r * s;
          const visual = eq(`x²${term(b, 'x')}${term(c)} = 0`);
          const steps = [`Factor: (x${term(-r)})(x${term(-s)}) = 0`, `Set each factor to zero: x = ${n(r)} or x = ${n(s)}`];
          if (chance(0.45)) {
            return make({
              label: 'SAT style',
              prompt: 'What is the sum of the solutions?',
              visual, answer: n(r + s), value: r + s,
              wrongs: [n(-(r + s)), n(c), n(-c), ...near(r + s, [-1, 1, 2])],
              steps: [...steps, `Sum: ${n(r)} + ${paren(s)} = <b>${n(r + s)}</b>`],
              hint: 'Factor it, find both solutions, then add them.',
            });
          }
          const fmt = (u, v) => `x = ${n(Math.min(u, v))} and x = ${n(Math.max(u, v))}`;
          return make({
            label: 'Solve it',
            prompt: 'What are the solutions?',
            visual, answer: fmt(r, s),
            wrongs: [fmt(-r, -s), fmt(r, -s), fmt(-r, s), fmt(r + 1, s)],
            steps, hint: 'Factor, then set each piece equal to zero.',
          });
        },
        hard() {
          if (chance(0.5)) {
            const want = pick([0, 1, 2]);
            let a, b, c;
            if (want === 1) { const k = rand(-6, 6) || 3; a = 1; b = 2 * k; c = k * k; }
            else if (want === 0) { a = rand(1, 3); b = rand(-4, 4); c = rand(Math.ceil((b * b) / (4 * a)) + 1, 12); }
            else { a = rand(1, 3); b = rand(-9, 9) || 5; c = rand(-9, Math.floor((b * b - 1) / (4 * a))); }
            const D = b * b - 4 * a * c;
            const kind = D > 0 ? 2 : D === 0 ? 1 : 0;
            const labels = ['No real solutions', 'Exactly one real solution', 'Exactly two real solutions', 'Infinitely many solutions'];
            return make({
              label: 'Discriminant',
              prompt: 'How many real solutions does this equation have?',
              visual: eq(`${poly([a, b, c])} = 0`),
              answer: labels[kind], wrongs: labels.filter((l, i) => i !== kind),
              steps: [
                'Use the discriminant: b² − 4ac',
                `= ${paren(b)}² − 4(${a})(${n(c)}) = ${n(D)}`,
                D > 0 ? 'Positive → <b>two</b> real solutions' : D === 0 ? 'Zero → <b>exactly one</b> real solution' : 'Negative → <b>no</b> real solutions',
              ],
              hint: 'Find b² − 4ac. Positive: 2 solutions. Zero: 1. Negative: none.',
            });
          }
          const a = pick([2, 3]);
          let r, s, b, c;
          do { r = rand(-5, 5); s = rand(-5, 5); b = -a * (r + s); c = a * r * s; } while (r === s || !b || !c);
          const D = b * b - 4 * a * c, R = Math.sqrt(D), lo = Math.min(r, s), hi = Math.max(r, s);
          const fmt = (u, v) => `x = ${n(Math.min(u, v))} and x = ${n(Math.max(u, v))}`;
          return make({
            label: 'Quadratic formula',
            prompt: 'What are the solutions?',
            visual: eq(`${poly([a, b, c])} = 0`),
            answer: fmt(r, s), wrongs: [fmt(-r, -s), fmt(r, -s), fmt(-r, s), fmt(r * a, s)],
            steps: [
              `a = ${a}, b = ${n(b)}, c = ${n(c)}`,
              `x = (−b ± √(b² − 4ac)) ÷ 2a = (${n(-b)} ± √${D}) ÷ ${2 * a}`,
              `√${D} = ${R}, so x = (${n(-b)} + ${R}) ÷ ${2 * a} = ${n(hi)} or x = (${n(-b)} − ${R}) ÷ ${2 * a} = ${n(lo)}`,
            ],
            hint: 'x = (−b ± √(b² − 4ac)) / (2a)',
          });
        },
      },
    },
    {
      id: 'vertex', unit: 'adv', icon: '📣', name: 'Parabolas', blurb: 'Vertex, symmetry, and basket tosses.',
      gen: {
        easy() {
          const h = rand(-6, 6) || 2, k = rand(-6, 6) || -3;
          const fmt = (u, v) => `(${n(u)}, ${n(v)})`;
          return make({
            label: 'Find the vertex',
            prompt: 'What is the vertex of this parabola?',
            visual: eq(`y = (x${term(-h)})²${term(k)}`),
            answer: fmt(h, k), wrongs: [fmt(-h, k), fmt(h, -k), fmt(-h, -k), fmt(k, h)],
            steps: ['Vertex form is y = (x − h)² + k, and the vertex is (h, k).', `Here x${term(-h)} means h = ${n(h)}. Watch the sign!`, `Vertex: <b>${fmt(h, k)}</b>`],
            hint: 'The number inside the parentheses has the opposite sign.',
          });
        },
        medium() {
          const a = pick([1, 2, -1, 3, -2]), h = rand(-5, 5) || 2, b = -2 * a * h, c = rand(-9, 9);
          return make({
            label: 'Axis of symmetry',
            prompt: 'What is the x-coordinate of the vertex?',
            visual: eq(`y = ${poly([a, b, c])}`),
            answer: n(h), value: h,
            wrongs: [n(-h), n(b), n(-b), n(c)],
            steps: ['The vertex is at x = −b ÷ (2a).', `x = −(${n(b)}) ÷ (2 · ${paren(a)}) = ${n(-b)} ÷ ${n(2 * a)} = <b>${n(h)}</b>`],
            hint: 'Use x = −b / (2a).',
          });
        },
        hard() {
          const v = pick([16, 24, 32]), h0 = pick([5, 6]), t = v / 32, H = h0 + (v * v) / 64;
          const fn = `h(t) = −16t² + ${v}t + ${h0}`;
          if (chance(0.5)) {
            return make({
              label: 'Basket toss 📣',
              prompt: `Your flyer’s height in feet after <i>t</i> seconds is ${fn}. How high does she go?`,
              answer: `${H} ft`, value: H, unit: 'ft',
              wrongs: [`${h0 + v} ft`, ...near(H, [-4, -2, 2, 4], (x) => `${x} ft`, (x) => x > 0)],
              steps: [
                `The top of the toss is the vertex: t = −b ÷ (2a) = −${v} ÷ (−32) = ${t} s`,
                `h(${t}) = −16(${t})² + ${v}(${t}) + ${h0}`,
                `= ${n(-16 * t * t)} + ${v * t} + ${h0} = <b>${H} ft</b>`,
              ],
              hint: 'Find when she peaks with −b / (2a), then plug that time in.',
            });
          }
          return make({
            label: 'Basket toss 📣',
            prompt: `Your flyer’s height in feet after <i>t</i> seconds is ${fn}. How many seconds until she reaches the top?`,
            answer: `${t} s`, value: t, unit: 's',
            wrongs: near(t, [-0.5, -0.25, 0.25, 0.5, 1], (x) => `${x} s`, (x) => x > 0),
            steps: ['The top is the vertex: t = −b ÷ (2a)', `t = −${v} ÷ (2 · −16) = ${v} ÷ 32 = <b>${t} s</b>`],
            hint: 'The peak of a parabola is at t = −b / (2a).',
          });
        },
      },
    },
    {
      id: 'poly', story: true, unit: 'adv', icon: '🧩', name: 'Polynomials', blurb: 'Combine, distribute, FOIL.',
      gen: {
        easy() {
          const A = [rand(-4, 5) || 1, rand(-6, 6), rand(-9, 9)], B = [rand(-4, 5) || 2, rand(-6, 6), rand(-9, 9)];
          const sub = chance(0.4);
          const R = A.map((v, i) => v + (sub ? -B[i] : B[i]));
          const ans = poly(R);
          const wrongs = [
            poly([R[0], R[1] + 1, R[2]]), poly([R[0] - 1, R[1], R[2]]), poly([R[0], R[1], R[2] + 2]),
            sub ? poly(A.map((v, i) => v + B[i])) : poly(A.map((v, i) => v - B[i])),
            sub ? poly([A[0] - B[0], A[1] + B[1], A[2] + B[2]]) : null,
          ];
          return make({
            label: sub ? 'Subtract' : 'Add',
            prompt: 'Simplify:',
            visual: eq(`(${poly(A)}) ${sub ? MINUS : '+'} (${poly(B)})`),
            answer: ans, wrongs,
            steps: sub
              ? ['Subtracting? Flip the sign of <b>every</b> term in the second polynomial.', `Combine like terms: <b>${ans}</b>`]
              : ['Combine like terms: x² with x², x with x, numbers with numbers.', `<b>${ans}</b>`],
            hint: sub ? 'The minus sign hits every term in the second set of parentheses.' : 'Add matching powers together.',
          });
        },
        medium() {
          const a = pick([1, 1, 2, 3, -1]), b = rand(-7, 7) || 3, c = pick([1, 1, 2, -2]), d = rand(-7, 7) || -2;
          const ans = poly([a * c, a * d + b * c, b * d]);
          return make({
            label: 'Multiply',
            prompt: 'Which is equivalent?',
            visual: eq(`(${lead(a, 'x')}${term(b)})(${lead(c, 'x')}${term(d)})`),
            answer: ans,
            wrongs: [poly([a * c, 0, b * d]), poly([a * c, a * d - b * c, b * d]), poly([a * c, a * d + b * c, -b * d]), poly([a * c, a * d + b * c + 1, b * d])],
            steps: [
              `First: ${lead(a, 'x')} · ${lead(c, 'x')} = ${poly([a * c, 0, 0])}`,
              `Outer + Inner: ${poly([a * d, 0])}${term(b * c, 'x')} = ${poly([a * d + b * c, 0])}`,
              `Last: ${paren(b)} · ${paren(d)} = ${n(b * d)}`,
              `Together: <b>${ans}</b>`,
            ],
            hint: 'FOIL: First, Outer, Inner, Last.',
          });
        },
        hard() {
          const a = rand(-5, 5) || 1, b = rand(-5, 5) || 2, c = rand(-5, 5) || 3;
          const R = [1, b + a, c + a * b, a * c], ans = poly(R);
          return make({
            label: 'Expand',
            prompt: 'Which is equivalent?',
            visual: eq(`(x${term(a)})(x²${term(b, 'x')}${term(c)})`),
            answer: ans,
            wrongs: [poly([1, R[1] + 1, R[2], R[3]]), poly([1, R[1], R[2] - 2, R[3]]), poly([1, b, c, a * c]), poly([1, R[1], R[2], -R[3]])],
            steps: [
              `x times everything: x³${term(b, 'x²')}${term(c, 'x')}`,
              `${n(a)} times everything: ${poly([a, a * b, a * c])}`,
              `Combine like terms: <b>${ans}</b>`,
            ],
            hint: 'Multiply each term of the first part by every term of the second.',
          });
        },
      },
    },
    {
      id: 'exp', unit: 'adv', icon: '🚀', name: 'Exponents & growth', blurb: 'Rules, growth rates, and going viral.',
      gen: {
        easy() {
          const a = rand(2, 7), b = rand(2, 6), kind = pick(['prod', 'pow', 'quot']);
          if (kind === 'prod') {
            return make({
              label: 'Exponent rules', prompt: 'Simplify:', visual: eq(`x${sup(a)} · x${sup(b)}`),
              answer: `x${sup(a + b)}`, wrongs: [`x${sup(a * b)}`, `x${sup(Math.abs(a - b) || 1)}`, `2x${sup(a + b)}`],
              steps: ['Same base, multiplying → <b>add</b> the exponents.', `${a} + ${b} = ${a + b}, so <b>x${sup(a + b)}</b>`],
              hint: 'Multiplying the same base? Add the exponents.',
            });
          }
          if (kind === 'pow') {
            return make({
              label: 'Exponent rules', prompt: 'Simplify:', visual: eq(`(x${sup(a)})${sup(b)}`),
              answer: `x${sup(a * b)}`, wrongs: [`x${sup(a + b)}`, `${b}x${sup(a)}`, `x${sup(a * b + 1)}`],
              steps: ['A power of a power → <b>multiply</b> the exponents.', `${a} × ${b} = ${a * b}, so <b>x${sup(a * b)}</b>`],
              hint: 'Power to a power? Multiply the exponents.',
            });
          }
          const p = a + b;
          return make({
            label: 'Exponent rules', prompt: 'Simplify:', visual: eq(`x${sup(p)} ÷ x${sup(b)}`),
            answer: `x${sup(a)}`, wrongs: [`x${sup(p + b)}`, `x${sup(p * b)}`, `${b}x${sup(a)}`],
            steps: ['Same base, dividing → <b>subtract</b> the exponents.', `${p} − ${b} = ${a}, so <b>x${sup(a)}</b>`],
            hint: 'Dividing the same base? Subtract the exponents.',
          });
        },
        medium() {
          if (chance(0.5)) {
            const P = pick([200, 500, 1200]), r = pick([3, 5, 8, 12, 15, 20]), base = (1 + r / 100).toFixed(2);
            return make({
              label: 'Growth or decay?',
              prompt: `Your cheer TikTok followers after <i>t</i> days: F(t) = ${P}(${base})<sup>t</sup>. What does ${base} tell you?`,
              answer: `Followers grow ${r}% each day`,
              wrongs: [`Followers grow ${base}% each day`, `You gain ${r} followers each day`, `You started with ${base} followers`],
              steps: ['In a(b)<sup>t</sup>, b bigger than 1 means growth.', `${base} = 1 + ${dec(r / 100)}, so growth is ${r}% per day.`, `<b>Followers grow ${r}% each day.</b>`],
              hint: 'Write the base as 1 + (a percent).',
            });
          }
          const r = pick([5, 10, 15, 20, 25]), base = (1 - r / 100).toFixed(2);
          return make({
            label: 'Growth or decay?',
            prompt: `Your phone battery after <i>h</i> hours of TikTok: B(h) = 100(${base})<sup>h</sup>. What does ${base} tell you?`,
            answer: `It loses ${r}% each hour`,
            wrongs: [`It loses ${100 - r}% each hour`, `It loses ${base}% each hour`, `It gains ${r}% each hour`],
            steps: ['b smaller than 1 means decay.', `${base} = 1 − ${dec(r / 100)}, so it loses ${r}% each hour.`, `<b>It loses ${r}% each hour.</b>`],
            hint: 'Write the base as 1 − (a percent).',
          });
        },
        hard() {
          const m = pick([2, 3]), k = m === 2 ? rand(3, 6) : rand(2, 4), start = pick([250, 500, 1000]);
          const target = start * m ** k, word = m === 2 ? 'double' : 'triple';
          return make({
            label: 'Going viral 📱',
            prompt: `Your post had ${start.toLocaleString()} views, and views ${word} every day: V(d) = ${start}·${m}<sup>d</sup>. On which day does it hit ${target.toLocaleString()}?`,
            answer: `Day ${k}`, value: k,
            wrongs: near(k, [-2, -1, 1, 2, 3], (v) => `Day ${v}`, (v) => v > 0),
            steps: [`Set it up: ${start}·${m}<sup>d</sup> = ${target.toLocaleString()}`, `Divide by ${start}: ${m}<sup>d</sup> = ${target / start}`, `${m}${sup(k)} = ${target / start}, so <b>d = ${k}</b>`],
            hint: `Divide out the starting views, then ask: ${m} to what power?`,
          });
        },
      },
    },
    {
      id: 'log', unit: 'adv', sat: false, icon: '🔍', name: 'Logarithms', blurb: 'Algebra 2 only. Not on the SAT.',
      gen: {
        easy() {
          const b = pick([2, 3, 4, 5, 10]), k = rand(1, 4), v = b ** k;
          return make({
            label: 'Evaluate', prompt: 'What is the value?', visual: eq(`log<sub>${b}</sub>(${v.toLocaleString()})`),
            answer: String(k), value: k,
            wrongs: [String(k + 1), String(k - 1 || 5), String(v / b), String(b * k)],
            steps: [`Ask: ${b} to what power gives ${v.toLocaleString()}?`, `${b}${sup(k)} = ${v.toLocaleString()}, so the answer is <b>${k}</b>`],
            hint: `log<sub>${b}</sub>(${v}) asks: ${b} to what power is ${v}?`,
          });
        },
        medium() {
          const b = pick([2, 3, 5]), k = rand(2, 5), v = b ** k;
          return make({
            label: 'Solve for x', prompt: 'Find x.', visual: eq(`${b}<sup>x</sup> = ${v}`),
            answer: `x = ${k}`, value: k,
            wrongs: [`x = ${k + 1}`, `x = ${k - 1}`, `x = ${v / b}`, `x = ${b * k}`],
            steps: [`Write ${v} as a power of ${b}: ${v} = ${b}${sup(k)}`, `So ${b}<sup>x</sup> = ${b}${sup(k)} and <b>x = ${k}</b>`],
            hint: `Write ${v} as ${b} to some power.`,
          });
        },
        hard() {
          const b = pick([2, 3, 10]), M = rand(2, 9), N = rand(2, 9), plus = chance(0.6);
          if (plus) {
            return make({
              label: 'Log rules', prompt: 'Fill in the blank:',
              visual: eq(`log<sub>${b}</sub>(${M}) + log<sub>${b}</sub>(${N}) = log<sub>${b}</sub>(?)`),
              answer: String(M * N), value: M * N,
              wrongs: [String(M + N), String(Math.abs(M - N) || M + 1), String(M * N + 1)],
              steps: ['Adding logs (same base) → <b>multiply</b> inside.', `${M} × ${N} = <b>${M * N}</b>`],
              hint: 'log(a) + log(b) = log(a × b)',
            });
          }
          const P = M * N;
          return make({
            label: 'Log rules', prompt: 'Fill in the blank:',
            visual: eq(`log<sub>${b}</sub>(${P}) − log<sub>${b}</sub>(${N}) = log<sub>${b}</sub>(?)`),
            answer: String(M), value: M,
            wrongs: [String(P - N), String(P + N), String(P * N)],
            steps: ['Subtracting logs (same base) → <b>divide</b> inside.', `${P} ÷ ${N} = <b>${M}</b>`],
            hint: 'log(a) − log(b) = log(a ÷ b)',
          });
        },
      },
    },
    {
      id: 'rat', story: true, unit: 'adv', icon: '🍰', name: 'Rational expressions', blurb: 'Fractions with x in them.',
      gen: {
        easy() {
          let g, p, q;
          do { g = pick([2, 3, 4, 5]); p = rand(1, 6); q = rand(2, 6); } while (gcd(p, q) !== 1);
          const N = g * p, D = g * q;
          const fx = (u, v) => `${u === 1 ? '' : u}x${v === 1 ? '' : '/' + v}`;
          const ans = fx(p, q);
          return make({
            label: 'Simplify', prompt: 'Reduce it all the way:', visual: eq(`${N}x / ${D}`),
            answer: ans,
            wrongs: [fx(N, D), fx(p + 1, q), fx(p, q + 1), fx(q, p), p > 1 ? fx(p - 1, q) : null],
            steps: [`The biggest number that divides ${N} and ${D} is ${g}.`, `${N} ÷ ${g} = ${p}, ${D} ÷ ${g} = ${q}, so <b>${ans}</b>`],
            hint: 'Divide the top and bottom by the same number.',
          });
        },
        medium() {
          const a = rand(2, 9);
          if (chance(0.5)) {
            return make({
              label: 'Simplify', prompt: 'Simplify (assume x ≠ ' + a + '):', visual: eq(`(x² − ${a * a}) / (x − ${a})`),
              answer: `x + ${a}`, wrongs: [`x − ${a}`, `x + ${a * a}`, `x − ${a * a}`],
              steps: [`Difference of squares: x² − ${a * a} = (x − ${a})(x + ${a})`, `Cancel (x − ${a}) top and bottom: <b>x + ${a}</b>`],
              hint: 'a² − b² = (a − b)(a + b)',
            });
          }
          let b = rand(-6, 6);
          while (!b || b === a) b = rand(-6, 6);
          return make({
            label: 'Simplify', prompt: `Simplify (assume x ≠ ${n(-a)}):`, visual: eq(`(${poly([1, a + b, a * b])}) / (x + ${a})`),
            answer: `x${term(b)}`, wrongs: [`x + ${a}`, `x${term(-b)}`, `x${term(a * b)}`],
            steps: [`Factor the top: ${poly([1, a + b, a * b])} = (x + ${a})(x${term(b)})`, `Cancel (x + ${a}): <b>x${term(b)}</b>`],
            hint: 'Factor the top. One factor should match the bottom.',
          });
        },
        hard() {
          let a, b;
          do { a = rand(2, 7); b = rand(2, 7); } while (a === b);
          const ans = `(2x + ${a + b}) / ((x + ${a})(x + ${b}))`;
          return make({
            label: 'Add fractions', prompt: 'Which is equivalent?', visual: eq(`1/(x + ${a}) + 1/(x + ${b})`),
            answer: ans,
            wrongs: [`2 / (2x + ${a + b})`, `(x + ${a + b}) / ((x + ${a})(x + ${b}))`, `(2x + ${a * b}) / ((x + ${a})(x + ${b}))`],
            steps: [`Common denominator: (x + ${a})(x + ${b})`, `Rewrite: (x + ${b}) / CD + (x + ${a}) / CD`, `Add the tops: 2x + ${a + b}. So <b>${ans}</b>`],
            hint: 'Get a common denominator first, just like regular fractions.',
          });
        },
      },
    },
    {
      id: 'rad', unit: 'adv', sat: false, icon: '💎', name: 'Radicals & complex', blurb: 'Algebra 2 only. Roots and i.',
      gen: {
        easy() {
          const a = rand(2, 6), b = pick([2, 3, 5, 6, 7, 10, 11]), inside = a * a * b;
          return make({
            label: 'Simplify', prompt: 'Simplify the root:', visual: eq(`√${inside}`),
            answer: `${a}√${b}`, wrongs: [`${a}√${b + 1}`, `${a + 1}√${b}`, `${b}√${a}`, `${a * a}√${b}`],
            steps: [`Find a perfect-square factor: ${inside} = ${a * a} × ${b}`, `√${a * a} = ${a}, so <b>${a}√${b}</b>`],
            hint: 'Look for a perfect square (4, 9, 16, 25, 36) that divides it.',
          });
        },
        medium() {
          const a = rand(2, 8), b = pick([2, 3, 5, 7, 11]);
          return make({
            label: 'Rationalize', prompt: 'Get the root out of the bottom:', visual: eq(`${a} / √${b}`),
            answer: `${a}√${b} / ${b}`, wrongs: [`${a} / ${b}`, `${a * b}√${b}`, `√${a * b}`, `${a}√${b}`],
            steps: [`Multiply top and bottom by √${b}.`, `${a}√${b} / (√${b} · √${b}) = <b>${a}√${b} / ${b}</b>`],
            hint: `√${b} × √${b} = ${b}`,
          });
        },
        hard() {
          let a, b, c, d, re, im;
          do {
            a = rand(-5, 5) || 1; b = rand(-5, 5) || 1; c = rand(-5, 5) || 2; d = rand(-5, 5) || 1;
            re = a * c - b * d; im = a * d + b * c;
          } while (im === 0);
          const cx = (r, i) => (r === 0 ? `${lead(i, 'i')}` : `${n(r)}${term(i, 'i')}`);
          const ans = cx(re, im);
          return make({
            label: 'Complex numbers', prompt: 'Multiply:', visual: eq(`(${n(a)}${term(b, 'i')})(${n(c)}${term(d, 'i')})`),
            answer: ans, wrongs: [cx(a * c + b * d, im), cx(re, -im), cx(a * c, im)],
            steps: [
              `FOIL: ${a * c}${term(a * d, 'i')}${term(b * c, 'i')}${term(b * d, 'i²')}`,
              `i² = −1, so ${b * d}i² = ${n(-b * d)}`,
              `Combine: <b>${ans}</b>`,
            ],
            hint: 'FOIL, then swap i² for −1.',
          });
        },
      },
    },

    // ───────── Unit 3: Problem-Solving & Data ─────────
    {
      id: 'pct', unit: 'psda', icon: '🏷️', name: 'Percents', blurb: 'Sales, discounts, and the trick questions.',
      gen: {
        easy() {
          const it = pick(ITEMS.filter((i) => i.p[0] >= 15));
          const P = 20 * rand(2, 6), d = pick([10, 15, 20, 25, 30, 40, 50]), off = (P * d) / 100, S = P - off;
          return make({
            label: 'Sale! 🏷️',
            prompt: `A ${money(P)} ${it.one} ${it.e} is ${d}% off. What’s the sale price?`,
            answer: money(S), value: S, unit: '$',
            wrongs: [money(off), money(P - d), money(P + off), money(S - 5)],
            steps: [`${d}% of ${money(P)} = ${dec(d / 100)} × ${P} = ${money(off)} off`, `${money(P)} − ${money(off)} = <b>${money(S)}</b>`, `Shortcut: you pay ${100 - d}%, and ${dec((100 - d) / 100)} × ${P} = ${money(S)}`],
            hint: `Find ${d}% of ${money(P)}, then subtract it.`,
            bridge: `In algebra: sale price = ${P}(1 − ${dec(d / 100)}). Percent off means multiply by (1 − rate).`,
          });
        },
        medium() {
          const it = pick(ITEMS.filter((i) => i.p[0] >= 15));
          const O = 20 * rand(2, 8), d = pick([10, 20, 25, 40, 50]), S = (O * (100 - d)) / 100;
          return make({
            label: 'Work backward',
            prompt: `After a ${d}% discount, a ${it.one} ${it.e} costs ${money(S)}. What was the original price?`,
            answer: money(O), value: O, unit: '$',
            wrongs: [money(+(S * (1 + d / 100)).toFixed(2)), money(S + d), money(+(S * (1 - d / 100)).toFixed(2)), money(O + 10)],
            steps: [`The sale price is ${100 - d}% of the original: ${dec((100 - d) / 100)} × original = ${S}`, `Original = ${S} ÷ ${dec((100 - d) / 100)} = <b>${money(O)}</b>`],
            hint: `${money(S)} is what’s left after ${d}% off. That’s ${100 - d}% of the original.`,
          });
        },
        hard() {
          const a = pick([10, 20, 30, 50]), net = (a * a) / 100;
          return make({
            label: 'Trick question 👀',
            prompt: `Sneakers 👟 go up ${a}% in price. A month later, they go down ${a}%. Overall, what happened to the price?`,
            answer: `It went down ${net}%`,
            wrongs: ['No change: they cancel out', `It went up ${net}%`, `It went down ${a}%`],
            steps: [
              `Say they start at $100. Up ${a}%: $100 × ${dec(1 + a / 100)} = $${100 + a}`,
              `Down ${a}%: $${100 + a} × ${dec(1 - a / 100)} = $${dec((100 + a) * (1 - a / 100))}`,
              `$100 → $${dec(100 - net)}: <b>down ${net}%</b>. The second ${a}% is taken from a bigger number!`,
            ],
            hint: 'Try it with a $100 price and actually do both steps.',
          });
        },
      },
    },
    {
      id: 'ratio', unit: 'psda', icon: '🍗', name: 'Ratios & rates', blurb: 'Birdies math, recipes, and unit swaps.',
      gen: {
        easy() {
          const k = pick([2, 3, 4, 5]), M = pick([3, 4, 5, 6]), W = k * M, N = rand(M + 1, 15);
          return make({
            label: 'Birdies rush 🍗',
            prompt: `The Birdies fryer makes ${W} tenders every ${M} minutes. At that rate, how many tenders in ${N} minutes?`,
            answer: String(k * N), value: k * N,
            wrongs: [String(W * N), String(W + N), String(k * N + k), String(k * N - k)],
            steps: [`Find the rate: ${W} ÷ ${M} = ${k} tenders per minute.`, `${k} × ${N} = <b>${k * N}</b> tenders`],
            hint: 'How many tenders in 1 minute?',
          });
        },
        medium() {
          const [A, B] = twoItems(false);
          const a = rand(2, 5);
          let b = rand(2, 7);
          if (b === a) b++;
          const m = rand(2, 6), T = (a + b) * m;
          return make({
            label: 'Ratio',
            prompt: `In your accessory drawer, the ratio of ${A.many} to ${B.many} is ${a} : ${b}. There are ${T} in all. How many ${B.many}?`,
            visual: eqv(tok(A, a), op(':'), tok(B, b)),
            answer: String(b * m), value: b * m,
            wrongs: [String(a * m), String(T - b), String(b * m + m), (T * b) % a === 0 ? String((T * b) / a) : String(b * m - m)],
            steps: [`The ratio has ${a} + ${b} = ${a + b} parts.`, `Each part is ${T} ÷ ${a + b} = ${m}.`, `${cap(B.many)}: ${b} × ${m} = <b>${b * m}</b>`],
            hint: 'Add the ratio numbers to find the total parts.',
          });
        },
        hard() {
          if (chance(0.5)) {
            const v = pick([15, 30, 45, 60]), ans = (v * 22) / 15;
            return make({
              label: 'Unit swap',
              prompt: `Your scooter goes ${v} miles per hour. How many <b>feet per second</b> is that? (1 mile = 5,280 feet)`,
              answer: `${ans} ft/s`, value: ans, unit: 'ft/s',
              wrongs: [`${v * 88} ft/s`, `${v * 60} ft/s`, `${ans + 11} ft/s`, `${ans * 2} ft/s`],
              steps: [`${v} miles/hour × 5,280 = ${(v * 5280).toLocaleString()} feet/hour`, '1 hour = 60 × 60 = 3,600 seconds', `${(v * 5280).toLocaleString()} ÷ 3,600 = <b>${ans} ft/s</b>`],
              hint: 'Change miles to feet, then hours to seconds.',
            });
          }
          const cups = pick([2, 3]), serv = pick([4, 8]), want = pick([10, 12, 20]), ans = (cups * want) / serv;
          return make({
            label: 'Scale the recipe',
            prompt: `Birdies’ honey sauce uses ${cups} cups of honey for ${serv} servings. How many cups for ${want} servings?`,
            answer: `${dec(ans)} cups`, value: ans, unit: 'cups',
            wrongs: [`${cups * want} cups`, `${dec(want / serv)} cups`, `${dec(ans + 0.5)} cups`, `${dec(ans + 1)} cups`],
            steps: [`Cups per serving: ${cups} ÷ ${serv} = ${dec(cups / serv)}`, `${dec(cups / serv)} × ${want} = <b>${dec(ans)} cups</b>`],
            hint: 'Find how much honey ONE serving needs.',
          });
        },
      },
    },
    {
      id: 'stats', unit: 'psda', icon: '📊', name: 'Mean & median', blurb: 'Averages, middles, and outliers.',
      gen: {
        easy() {
          let xs, M;
          do {
            M = rand(6, 9);
            xs = Array.from({ length: 4 }, () => rand(M - 3, Math.min(10, M + 2)));
            xs.push(5 * M - xs.reduce((s, v) => s + v, 0));
          } while (xs[4] < 1 || xs[4] > 10);
          shuffle(xs);
          const med = [...xs].sort((a, b) => a - b)[2];
          return make({
            label: 'Judges’ scores 📣',
            prompt: `Judges scored your cheer routine: ${xs.join(', ')}. What’s the mean (average) score?`,
            answer: String(M), value: M,
            wrongs: [String(med), String(M + 1), String(M - 1), String(5 * M)],
            steps: [`Add them: ${xs.join(' + ')} = ${5 * M}`, `Divide by how many (5): ${5 * M} ÷ 5 = <b>${M}</b>`],
            hint: 'Add them all up, then divide by how many there are.',
          });
        },
        medium() {
          const xs = shuffle(Array.from({ length: 23 }, (_, i) => i + 8)).slice(0, 6);
          const s = [...xs].sort((a, b) => a - b), med = (s[2] + s[3]) / 2, mean = xs.reduce((t, v) => t + v, 0) / 6;
          return make({
            label: 'Tip check 💸',
            prompt: `Your Birdies tips (in dollars) this week: ${xs.join(', ')}. What’s the median?`,
            answer: money(med), value: med, unit: '$',
            wrongs: [money((xs[2] + xs[3]) / 2), money(s[2]), money(s[3]), money(+mean.toFixed(2)), ...near(med, [-2, 2, 3], money)],
            steps: [`Put them in order first: ${s.join(', ')}`, `Six numbers, so average the middle two: (${s[2]} + ${s[3]}) ÷ 2 = <b>${money(med)}</b>`],
            hint: 'Sort them first! The median is the middle.',
          });
        },
        hard() {
          if (chance(0.5)) {
            const base = pick([40, 45, 50]), xs = [base, base + 5, base + 10, base + 5, base], big = pick([150, 200, 250]);
            return make({
              label: 'Outlier alert 🚨',
              prompt: `Your tips on 5 nights: ${xs.map(money).join(', ')}. Then one huge night: ${money(big)}. What happens when you add it?`,
              answer: 'The mean goes up a lot, but the median barely changes',
              wrongs: ['The median goes up a lot, but the mean barely changes', 'The mean and median go up by the same amount', 'Neither one changes'],
              steps: ['An outlier drags the <b>mean</b> toward it, because every value gets added in.', 'The <b>median</b> only cares about the middle, so it barely moves.'],
              hint: 'Which one uses every number: the mean or the median?',
            });
          }
          let xs, M, need;
          do {
            M = pick([80, 85, 90]);
            xs = Array.from({ length: 4 }, () => rand(72, 98));
            need = 5 * M - xs.reduce((t, v) => t + v, 0);
          } while (need < 60 || need > 100);
          const sum = 5 * M - need;
          return make({
            label: 'Grade goals 🎯',
            prompt: `You want an average of ${M} on 5 quizzes. Your first four: ${xs.join(', ')}. What do you need on the fifth?`,
            answer: String(need), value: need,
            wrongs: [String(M), String(need + 5), String(need - 5), String(Math.round(sum / 4))],
            steps: [`An average of ${M} on 5 quizzes = ${M} × 5 = ${5 * M} total points.`, `So far: ${xs.join(' + ')} = ${sum}`, `You need ${5 * M} − ${sum} = <b>${need}</b>`],
            hint: 'Average × count = total points you need.',
          });
        },
      },
    },
    {
      id: 'prob', unit: 'psda', icon: '🎲', name: 'Probability & tables', blurb: 'Two-way tables, the SAT favorite.',
      gen: {
        easy() {
          const t = twoWay(), j = rand(0, 1), c = t.ctx;
          return make({
            label: 'Probability', prompt: `One ${c.who} is picked at random. What’s the probability ${c.pron} ${c.colIs[j]}?`, visual: t.html,
            answer: frac(t.colT[j], t.T), value: t.colT[j] / t.T,
            wrongs: [frac(t.m[0][j], t.T), frac(t.colT[j], t.colT[1 - j]), frac(t.colT[1 - j], t.T), frac(t.m[0][j], t.rowT[0]), frac(t.colT[j] + 1, t.T)],
            steps: [`Total ${c.who}s: ${t.T}`, `${c.cols[j]}: ${t.colT[j]}`, `Probability = ${t.colT[j]} / ${t.T} = <b>${frac(t.colT[j], t.T)}</b>`],
            hint: 'Probability = (the ones you want) ÷ (everyone).',
          });
        },
        medium() {
          const t = twoWay(), i = rand(0, 1), j = rand(0, 1), c = t.ctx, cell = t.m[i][j];
          return make({
            label: 'Given that…', prompt: `If a randomly chosen ${c.who} ${c.rowIs[i]}, what’s the probability ${c.pron} ${c.colIs[j]}?`, visual: t.html,
            answer: frac(cell, t.rowT[i]), value: cell / t.rowT[i],
            wrongs: [frac(cell, t.T), frac(cell, t.colT[j]), frac(t.rowT[i], t.T), frac(t.rowT[i] - cell, t.rowT[i]), frac(cell + 1, t.rowT[i])],
            steps: [`“If ${c.pron} ${c.rowIs[i]}” means only look at the <b>${c.rows[i]}</b> row: ${t.rowT[i]} total.`, `Of those, ${cell} ${c.colIs[j]}.`, `Probability = <b>${frac(cell, t.rowT[i])}</b>`],
            hint: '“Given that” shrinks the denominator to just that group.',
          });
        },
        hard() {
          const t = twoWay(), i = rand(0, 1), j = rand(0, 1), c = t.ctx, cell = t.m[i][j];
          return make({
            label: 'Read carefully', prompt: `Of the ${c.colGroup[j]}, what fraction are ${c.rowAre[i]}?`, visual: t.html,
            answer: frac(cell, t.colT[j]), value: cell / t.colT[j],
            wrongs: [frac(cell, t.rowT[i]), frac(cell, t.T), frac(t.colT[j], t.T), frac(t.colT[j] - cell, t.colT[j]), frac(cell + 1, t.colT[j])],
            steps: [`Only look at the <b>${c.cols[j]}</b> column: ${t.colT[j]} total.`, `Of those, ${cell} are ${c.rows[i].toLowerCase()}.`, `Fraction = <b>${frac(cell, t.colT[j])}</b>`],
            hint: 'Which column or row is the “of the …” group? That’s your denominator.',
          });
        },
      },
    },

    // ───────── Unit 4: Geometry & Trig ─────────
    {
      id: 'pyth', unit: 'geo', icon: '📐', name: 'Right triangles', blurb: 'a² + b² = c², everywhere.',
      gen: {
        easy() {
          const [a, b, c] = triple();
          return make({
            label: 'Find the long side', prompt: 'How long is the side marked “?”', visual: tri({ v: a, h: b, c: '?' }),
            answer: String(c), value: c,
            wrongs: [String(a + b), String(a * a + b * b), String(c + 1), String(c - 1)],
            steps: [`a² + b² = c²: ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`, `c = √${a * a + b * b} = <b>${c}</b>`],
            hint: 'Square both short sides, add, then take the square root.',
          });
        },
        medium() {
          const [a, b, c] = triple();
          return make({
            label: 'Find the missing side', prompt: 'How long is the side marked “?”', visual: tri({ v: '?', h: b, c }),
            answer: String(a), value: a,
            wrongs: [String(c - b), String(c + b), String(c * c - b * b), String(a + 1)],
            steps: [`a² + ${b}² = ${c}²`, `a² = ${c * c} − ${b * b} = ${a * a}`, `a = √${a * a} = <b>${a}</b>`],
            hint: 'The hypotenuse is the longest side. Subtract the squares.',
          });
        },
        hard() {
          const [a, b, c] = triple();
          if (chance(0.5)) {
            return make({
              label: 'Gym ladder 🪜',
              prompt: `A ${c}-foot ladder leans against the gym wall for the pep rally banner. Its base is ${b} feet from the wall. How high up the wall does it reach?`,
              answer: `${a} ft`, value: a, unit: 'ft',
              wrongs: [`${c - b} ft`, `${c + b} ft`, `${a + 2} ft`, `${c} ft`],
              steps: ['The ladder is the hypotenuse.', `h² + ${b}² = ${c}² → h² = ${c * c} − ${b * b} = ${a * a}`, `h = <b>${a} ft</b>`],
              hint: 'Draw it: the wall, the ground, and the ladder make a right triangle.',
            });
          }
          const x1 = rand(-6, 4), y1 = rand(-6, 4), sx = pick([1, -1]), sy = pick([1, -1]);
          const x2 = x1 + sx * b, y2 = y1 + sy * a;
          return make({
            label: 'Distance', prompt: `What is the distance between (${n(x1)}, ${n(y1)}) and (${n(x2)}, ${n(y2)})?`,
            answer: String(c), value: c,
            wrongs: [String(a + b), String(a * a + b * b), String(c + 2), String(Math.abs(x2 + y2 - x1 - y1) || c - 3)],
            steps: [`Across: ${b}. Up/down: ${a}.`, `d² = ${b}² + ${a}² = ${a * a + b * b}`, `d = <b>${c}</b>`],
            hint: 'Make a right triangle: the across change and the up/down change are the legs.',
          });
        },
      },
    },
    {
      id: 'trig', unit: 'geo', icon: '🔺', name: 'Trig (SOH-CAH-TOA)', blurb: 'Sine, cosine, tangent, special triangles.',
      gen: {
        easy() {
          const [v, b, c] = triple(), fn = pick(['sin', 'cos', 'tan']);
          const R = { sin: [v, c], cos: [b, c], tan: [v, b] }, [p, q] = R[fn];
          const rule = { sin: 'SOH: sin = Opposite ÷ Hypotenuse', cos: 'CAH: cos = Adjacent ÷ Hypotenuse', tan: 'TOA: tan = Opposite ÷ Adjacent' }[fn];
          return make({
            label: 'SOH-CAH-TOA', prompt: `What is ${fn} θ?`, visual: tri({ v, h: b, c, angle: true }),
            answer: frac(p, q), value: p / q,
            wrongs: [frac(q, p), ...Object.values(R).filter(([x, y]) => x !== p || y !== q).map(([x, y]) => frac(x, y))],
            steps: [rule, `From θ: opposite = ${v}, adjacent = ${b}, hypotenuse = ${c}`, `${fn} θ = ${p}/${q} = <b>${frac(p, q)}</b>`],
            hint: 'SOH-CAH-TOA. Which sides touch θ, and which is across from it?',
          });
        },
        medium() {
          const [p, q, r] = pick(TRIPLES);
          return make({
            label: 'SAT classic', prompt: `In a right triangle, sin(x°) = ${frac(p, r)}. What is cos((90 − x)°)?`,
            answer: frac(p, r), value: p / r,
            wrongs: [frac(q, r), frac(r, p), frac(p, q)],
            steps: ['The two small angles of a right triangle add up to 90°.', 'So sin(x°) = cos((90 − x)°). They are always equal!', `<b>${frac(p, r)}</b>`],
            hint: 'sin of an angle = cos of the other small angle.',
          });
        },
        hard() {
          const s = rand(2, 9);
          if (chance(0.5)) {
            const long = chance(0.5);
            return make({
              label: 'Special triangle',
              prompt: `A 30°-60°-90° triangle has a hypotenuse of ${2 * s}. How long is the side opposite the ${long ? '60°' : '30°'} angle?`,
              answer: long ? `${s}√3` : String(s), value: long ? undefined : s,
              wrongs: [`${s}√2`, `${2 * s}√3`, long ? String(s) : `${s}√3`, String(2 * s)],
              steps: ['30-60-90 sides are in the ratio 1 : √3 : 2.', `Hypotenuse = 2 × short side, so the short side = ${s}.`, long ? `Long side = short × √3 = <b>${s}√3</b>` : `<b>${s}</b>`],
              hint: 'Short side : long side : hypotenuse = 1 : √3 : 2',
            });
          }
          return make({
            label: 'Special triangle',
            prompt: `A 45°-45°-90° triangle has legs of length ${s}. How long is the hypotenuse?`,
            answer: `${s}√2`, wrongs: [String(2 * s), `${s}√3`, `${2 * s}√2`, String(s * s)],
            steps: ['45-45-90 sides are in the ratio 1 : 1 : √2.', `Hypotenuse = leg × √2 = <b>${s}√2</b>`],
            hint: 'Leg : leg : hypotenuse = 1 : 1 : √2',
          });
        },
      },
    },
    {
      id: 'circle', unit: 'geo', icon: '⭕', name: 'Circles', blurb: 'Area, circumference, equations.',
      gen: {
        easy() {
          const r = rand(2, 9);
          return make({
            label: 'Area', prompt: `A round cheer mat has a radius of ${r} feet. What is its area?`,
            answer: `${r * r}π sq ft`, wrongs: [`${2 * r}π sq ft`, `${r}π sq ft`, `${4 * r * r}π sq ft`, `${r * r + 1}π sq ft`],
            steps: ['Area = πr²', `π × ${r}² = <b>${r * r}π</b> square feet`],
            hint: 'Area of a circle = π × radius × radius.',
          });
        },
        medium() {
          const r = rand(2, 9);
          return make({
            label: 'Circle to area', prompt: `A circular mirror 🪞 has a circumference of ${2 * r}π inches. What is its area?`,
            answer: `${r * r}π sq in`, wrongs: [`${2 * r}π sq in`, `${4 * r * r}π sq in`, `${r}π sq in`],
            steps: [`Circumference = 2πr, so 2πr = ${2 * r}π and r = ${r}`, `Area = πr² = <b>${r * r}π</b> sq in`],
            hint: 'Use the circumference to find the radius first.',
          });
        },
        hard() {
          const h = rand(-6, 6) || 2, k = rand(-6, 6) || -1, r = rand(2, 7);
          const visual = eq(`(x${term(-h)})² + (y${term(-k)})² = ${r * r}`);
          if (chance(0.5)) {
            return make({
              label: 'Circle equation', prompt: 'What is the radius of this circle?', visual,
              answer: String(r), value: r, wrongs: [String(r * r), String(2 * r), String(r + 1)],
              steps: ['Circle form: (x − h)² + (y − k)² = r²', `r² = ${r * r}, so r = <b>${r}</b>`],
              hint: 'The number on the right is the radius squared.',
            });
          }
          const fmt = (u, v) => `(${n(u)}, ${n(v)})`;
          return make({
            label: 'Circle equation', prompt: 'What is the center of this circle?', visual,
            answer: fmt(h, k), wrongs: [fmt(-h, -k), fmt(-h, k), fmt(h, -k)],
            steps: ['Circle form: (x − h)² + (y − k)² = r², center (h, k)', `The signs inside flip: center = <b>${fmt(h, k)}</b>`],
            hint: 'Flip the signs of the numbers inside the parentheses.',
          });
        },
      },
    },
    {
      id: 'area', unit: 'geo', icon: '🥤', name: 'Area & volume', blurb: 'Posters, cups, and scale factors.',
      gen: {
        easy() {
          if (chance(0.5)) {
            const w = rand(12, 30), h = rand(10, 24);
            return make({
              label: 'Poster area', prompt: `Your pep rally poster is ${w} inches wide and ${h} inches tall. What is its area?`,
              answer: `${w * h} sq in`, value: w * h, unit: 'sq in',
              wrongs: [`${2 * (w + h)} sq in`, `${w + h} sq in`, `${w * h + w} sq in`],
              steps: ['Area of a rectangle = width × height', `${w} × ${h} = <b>${w * h} sq in</b>`],
              hint: 'Width times height.',
            });
          }
          const b = 2 * rand(4, 12), h = rand(5, 15);
          return make({
            label: 'Pennant area', prompt: `A triangle cheer pennant has a base of ${b} inches and a height of ${h} inches. What is its area?`,
            answer: `${(b * h) / 2} sq in`, value: (b * h) / 2, unit: 'sq in',
            wrongs: [`${b * h} sq in`, `${b + h} sq in`, `${(b * h) / 2 + h} sq in`],
            steps: ['Area of a triangle = ½ × base × height', `½ × ${b} × ${h} = <b>${(b * h) / 2} sq in</b>`],
            hint: 'A triangle is half of a rectangle.',
          });
        },
        medium() {
          const r = rand(2, 4), h = rand(5, 9);
          return make({
            label: 'Smoothie cup 🥤', prompt: `A cylinder-shaped smoothie cup has a radius of ${r} inches and a height of ${h} inches. How much does it hold?`,
            answer: `${r * r * h}π cubic in`, wrongs: [`${2 * r * h}π cubic in`, `${r * h}π cubic in`, `${4 * r * r * h}π cubic in`],
            steps: ['Volume of a cylinder = πr²h', `π × ${r}² × ${h} = π × ${r * r} × ${h} = <b>${r * r * h}π</b> cubic inches`],
            hint: 'Area of the circle bottom × height.',
          });
        },
        hard() {
          const k = pick([2, 3, 4]);
          if (chance(0.5)) {
            return make({
              label: 'Scale factor', prompt: `You blow up a photo so every side is ${k} times longer. How many times bigger is its area?`,
              answer: `${k * k} times`, value: k * k, wrongs: [`${k} times`, `${2 * k} times`, `${k ** 3} times`],
              steps: [`Area uses two lengths (width × height).`, `Each grows ${k}×, so area grows ${k} × ${k} = <b>${k * k} times</b>`],
              hint: 'Area is two-dimensional.',
            });
          }
          return make({
            label: 'Scale factor', prompt: `A giant cup is ${k} times taller, wider, and deeper than a normal one. How many times more does it hold?`,
            answer: `${k ** 3} times`, value: k ** 3, wrongs: [`${k} times`, `${k * k} times`, `${3 * k} times`],
            steps: ['Volume uses three lengths.', `Each grows ${k}×, so volume grows ${k} × ${k} × ${k} = <b>${k ** 3} times</b>`],
            hint: 'Volume is three-dimensional.',
          });
        },
      },
    },

    // ───────── Unit 5: Test Strategies (Princeton Review-style) ─────────
    {
      id: 'backsolve', unit: 'str', icon: '🔙', name: 'Backsolving', blurb: 'Try the answer choices instead of solving.',
      gen: {
        easy() {
          const it = pick(ITEMS.filter((i) => i.p[0] <= 10)), p = pick(it.p), k = rand(3, 9), L = rand(2, 9), B = p * k + L;
          const ch = [k - 2, k - 1, k, k + 1].filter((v) => v > 0);
          while (ch.length < 4) ch.push(ch[ch.length - 1] + 1);
          const sorted = ch.sort((a, b) => a - b), mid = sorted[1];
          return {
            label: 'Backsolve it', strategy: true,
            prompt: `You had ${money(B)}, bought some ${it.many} ${it.e} at ${money(p)} each, and have ${money(L)} left. How many did you buy?`,
            choices: sorted.map(String), correct: sorted.indexOf(k), value: k, answer: String(k),
            steps: [
              `<b>Don’t set up an equation.</b> The answer is one of the four choices, so test them.`,
              `Start in the middle. Try ${mid}: ${mid} × ${money(p)} = ${money(p * mid)}, leaving ${money(B - p * mid)}. ${mid === k ? 'That matches!' : B - p * mid > L ? `Too much left, so you need <b>more</b> ${it.many}.` : `Not enough left, so you need <b>fewer</b> ${it.many}.`}`,
              `Try ${k}: ${k} × ${money(p)} = ${money(p * k)}, leaving ${money(L)}. ✓ Answer: <b>${k}</b>`,
            ],
            hint: 'Pick a middle choice and plug it into the story. Too big or too small tells you which way to go.',
          };
        },
        medium() {
          let a, r;
          do { a = rand(2, 5); r = rand(1, 4); } while (a === r);
          const p = rand(-5, 5) || 2, q = rand(-6, 6) || -3, x = rand(-5, 8), s = a * (x + p) + q - r * x;
          const L = (v) => a * (v + p) + q, R = (v) => r * v + s;
          const sorted = [x - 3, x - 1, x, x + 2].sort((u, v) => u - v), mid = sorted[1];
          const dir = (L(mid) - R(mid)) * (a - r) < 0 ? 'bigger' : 'smaller';
          return {
            label: 'Backsolve it', strategy: true,
            prompt: 'Which value of <i>x</i> makes this true? Try the choices instead of solving.',
            visual: eq(`${a}(x${term(p)})${term(q)} = ${lead(r, 'x')}${term(s)}`),
            choices: sorted.map((v) => `x = ${n(v)}`), correct: sorted.indexOf(x), value: x, answer: `x = ${n(x)}`,
            steps: [
              `Choices are in order, so start with the second one, x = ${n(mid)}.`,
              `Left: ${a}(${paren(mid)}${term(p)})${term(q)} = ${n(L(mid))}. Right: ${lead(r, 'x')}${term(s)} = ${n(R(mid))}. ${mid === x ? 'Equal! ✓' : `Not equal, and the left side needs to be ${dir}, so move that way.`}`,
              `x = ${n(x)}: Left = ${n(L(x))}, Right = ${n(R(x))}. Equal! ✓`,
            ],
            hint: 'Plug each choice into BOTH sides. The right answer makes them equal.',
          };
        },
        hard() {
          let r, s;
          do { r = rand(-6, 6); s = rand(-6, 6); } while (!r || !s || r === s);
          const b = -(r + s), c = r * s, big = Math.max(r, s);
          const cand = new Set([big, big + 1, big + 2, big - 1, Math.min(r, s) + 1, -big]);
          const sorted = [...cand].filter((v) => v !== Math.min(r, s)).slice(0, 4).sort((u, v) => u - v);
          if (!sorted.includes(big)) sorted[3] = big;
          sorted.sort((u, v) => u - v);
          const f = (v) => v * v + b * v + c;
          return {
            label: 'Backsolve it', strategy: true,
            prompt: 'What is the <b>largest</b> value of <i>x</i> that makes this true?',
            visual: eq(`x²${term(b, 'x')}${term(c)} = 0`),
            choices: sorted.map((v) => n(v)), correct: sorted.indexOf(big), value: big, answer: n(big),
            steps: [
              '“Largest” means start from the biggest choice and work down. The first one that works wins.',
              ...sorted.slice().reverse().filter((v) => v >= big).map((v) => `x = ${n(v)}: (${n(v)})²${term(b, `(${n(v)})`)}${term(c)} = ${n(f(v))}${f(v) === 0 ? ' ✓' : ' ✗'}`),
              `Largest solution: <b>${n(big)}</b> (the other is ${n(Math.min(r, s))}).`,
            ],
            hint: 'The question says “largest”, so test the biggest choice first.',
          };
        },
      },
    },
    {
      id: 'plugin', unit: 'str', icon: '🔢', name: 'Plug in a number', blurb: 'Variables in the answers? Make up a number.',
      gen: {
        easy() {
          const k = pick([2, 3, 4, 5]), m = pick([2, 3, 4]), v = 1;
          return make({
            label: 'Plug in a number', strategy: true,
            prompt: `If y = ${k}x and z = ${m}y, then z is how many times x?`,
            answer: String(k * m), value: k * m,
            wrongs: [String(k + m), String(k), String(m), String(k * m + 1)],
            steps: [`Make up an easy number: let x = ${v}.`, `Then y = ${k} and z = ${m} × ${k} = ${k * m}.`, `z ÷ x = ${k * m} ÷ ${v} = <b>${k * m}</b> times`],
            hint: 'Let x = 1 and follow the chain.',
          });
        },
        medium() {
          const a = rand(1, 6), b = rand(1, 6), x = 2, v = (c) => 2 * (x + a) - (x - b);
          const ans = `x${term(2 * a + b)}`;
          return make({
            label: 'Plug in a number', strategy: true,
            prompt: 'Which expression is equivalent? Try plugging in x = 2.',
            visual: eq(`2(x + ${a}) − (x − ${b})`),
            answer: ans, wrongs: [`x${term(2 * a - b)}`, `3x${term(2 * a + b)}`, `x${term(a + b)}`, `x${term(2 * a - 2 * b)}`],
            steps: [
              `Let x = 2. The original: 2(2 + ${a}) − (2 − ${b}) = ${2 * (2 + a)} − (${n(2 - b)}) = ${v()}.`,
              `Now test the choices with x = 2. ${ans} → 2${term(2 * a + b)} = ${2 + 2 * a + b} ✓`,
              `Only one choice gives ${v()}, so it’s <b>${ans}</b>.`,
            ],
            hint: 'Pick x = 2, get a number from the original, then see which choice gives the same number.',
          });
        },
        hard() {
          const base = pick([50, 20, 25, 200]), ans = { 50: 'x/2', 20: 'x/5', 25: 'x/4', 200: '2x' }[base];
          return make({
            label: 'Plug in a number', strategy: true,
            prompt: `x% of ${base} is equal to which expression?`,
            answer: ans, wrongs: ['x/2', 'x/5', 'x/4', '2x', `${base}x`, 'x/100'].filter((w) => w !== ans),
            steps: [
              'Percents? Plug in x = 10, it keeps the math easy.',
              `10% of ${base} = ${base / 10}.`,
              `Which choice equals ${base / 10} when x = 10? ${ans} → ${base / 10} ✓`,
            ],
            hint: 'For percent questions, plug in 10 or 100.',
          });
        },
      },
    },
    {
      id: 'ballpark', unit: 'str', icon: '🎯', name: 'Ballparking', blurb: 'Estimate first, then eliminate.',
      gen: {
        easy() {
          const it = pick(ITEMS.filter((i) => i.p[0] >= 15));
          const P = pick([47.99, 59.99, 79.99, 119.99, 149.99]), d = pick([20, 25, 30, 40, 50]);
          const R = Math.round(P + 0.01), ans = Math.round((R * (100 - d)) / 100);
          return make({
            label: 'Ballpark it', strategy: true,
            prompt: `A ${money(P)} ${it.one} ${it.e} is ${d}% off. <b>About</b> what will you pay?`,
            answer: money(ans), value: ans, unit: '$',
            wrongs: [money(Math.round((R * d) / 100)), money(R), money(ans + 20), money(Math.max(5, ans - 15))],
            steps: [`Round first: ${money(P)} is basically ${money(R)}.`, `${d}% off means you pay ${100 - d}%. ${100 - d}% of ${money(R)} ≈ ${money(ans)}.`, `Only one choice is close: <b>${money(ans)}</b>`],
            hint: 'Round the price to a friendly number before doing anything.',
          });
        },
        medium() {
          let N;
          do { N = rand(20, 150); } while (Number.isInteger(Math.sqrt(N)));
          const lo = Math.floor(Math.sqrt(N)), hi = lo + 1;
          const closer = N - lo * lo < hi * hi - N ? lo : hi;
          return make({
            label: 'Ballpark it', strategy: true,
            prompt: `√${N} is closest to which whole number?`,
            answer: String(closer), value: closer,
            wrongs: [String(closer === lo ? hi : lo), String(closer + 2), String(Math.max(1, closer - 2)), String(Math.round(N / 2))],
            steps: [`Find the perfect squares around ${N}: ${lo}² = ${lo * lo} and ${hi}² = ${hi * hi}.`, `${N} is closer to ${closer * closer}, so √${N} ≈ <b>${closer}</b>`],
            hint: 'Which perfect squares is it between?',
          });
        },
        hard() {
          const a = pick([198, 302, 497, 1004, 248]), b = pick([0.51, 0.24, 0.98, 0.33]);
          const ra = Math.round(a / 100) * 100, rb = { 0.51: 0.5, 0.24: 0.25, 0.98: 1, 0.33: 1 / 3 }[b];
          const ans = Math.round(ra * rb);
          return make({
            label: 'Ballpark it', strategy: true,
            prompt: `Without a calculator: ${a} × ${b} is closest to?`,
            answer: String(ans), value: ans,
            wrongs: [String(ans * 2), String(Math.round(ans / 2)), String(ans * 4), String(ans + 70)],
            steps: [`Round both: ${a} ≈ ${ra} and ${b} ≈ ${rb === 1 / 3 ? '⅓' : rb}.`, `${ra} × ${rb === 1 / 3 ? '⅓' : rb} = ${ans}.`, `Closest choice: <b>${ans}</b>. Cross out anything far from that.`],
            hint: 'Round each number to something friendly, then multiply.',
          });
        },
      },
    },
    {
      id: 'mistake', unit: 'str', icon: '🕵️', name: 'Spot the mistake', blurb: 'Find the wrong step. Harder than it sounds.',
      gen: {
        easy() { return mistakeProblem('easy'); },
        medium() { return mistakeProblem('medium'); },
        hard() { return mistakeProblem('hard'); },
      },
    },
  ];

  // Builds a worked solution with (usually) one wrong step. Later steps follow from the error, so only one step is at fault.
  const workHTML = (lines) => `<ol class="work">${lines.map((l, i) => `<li><span>Step ${i + 1}</span>${l}</li>`).join('')}</ol>`;
  function mistakeProblem(level) {
    const none = chance(0.2);
    let eqn, lines, bad, why, fix;
    if (level === 'easy') {
      const a = rand(2, 6), p = rand(1, 6), x = rand(1, 8), c = a * (x + p);
      eqn = `${a}(x + ${p}) = ${c}`;
      const kind = none ? 0 : rand(1, 3);
      if (kind === 1) {
        lines = [`${a}x + ${p} = ${c}`, `${a}x = ${c - p}`, `x = ${frac(c - p, a)}`];
        why = `Step 1 only multiplied the x by ${a}. The ${a} has to multiply <b>both</b> things inside: ${a}x + ${a * p}.`;
      } else if (kind === 2) {
        lines = [`${a}x + ${a * p} = ${c}`, `${a}x = ${c + a * p}`, `x = ${frac(c + a * p, a)}`];
        why = `Step 2 added ${a * p} instead of subtracting it. To undo “+ ${a * p}”, subtract: ${a}x = ${c - a * p}.`;
      } else if (kind === 3) {
        lines = [`${a}x + ${a * p} = ${c}`, `${a}x = ${c - a * p}`, `x = ${c - a * p - a}`];
        why = `Step 3 subtracted ${a} instead of dividing by ${a}. ${c - a * p} ÷ ${a} = ${x}.`;
      } else {
        lines = [`${a}x + ${a * p} = ${c}`, `${a}x = ${c - a * p}`, `x = ${x}`];
      }
      bad = kind; fix = `x = ${x}`;
    } else if (level === 'medium') {
      const a = rand(4, 8), c = rand(2, a - 2), x = rand(-4, 7), b = rand(1, 9), d = (a - c) * x + b;
      const m = a - c, L = (k, v) => lead(k, v);
      eqn = `${a}x + ${b} = ${L(c, 'x')}${term(d)}`;
      const kind = none ? 0 : rand(1, 3);
      if (kind === 1) {
        lines = [`${L(a + c, 'x')} + ${b}${term(0)} = ${n(d)}`, `${L(a + c, 'x')} = ${n(d - b)}`, `x = ${frac(d - b, a + c)}`];
        why = `Step 1 moved ${L(c, 'x')} to the left but didn’t flip its sign. Subtracting ${L(c, 'x')} from both sides gives ${L(m, 'x')} + ${b} = ${n(d)}.`;
      } else if (kind === 2) {
        lines = [`${L(m, 'x')} + ${b} = ${n(d)}`, `${L(m, 'x')} = ${n(d + b)}`, `x = ${frac(d + b, m)}`];
        why = `Step 2 added ${b} to the right side. To undo “+ ${b}” you subtract: ${L(m, 'x')} = ${n(d - b)}.`;
      } else if (kind === 3) {
        lines = [`${L(m, 'x')} + ${b} = ${n(d)}`, `${L(m, 'x')} = ${n(d - b)}`, `x = ${n(d - b - m)}`];
        why = `Step 3 subtracted ${m} instead of dividing. ${n(d - b)} ÷ ${m} = ${n(x)}.`;
      } else {
        lines = [`${L(m, 'x')} + ${b} = ${n(d)}`, `${L(m, 'x')} = ${n(d - b)}`, `x = ${n(x)}`];
      }
      bad = kind; fix = `x = ${n(x)}`;
    } else {
      const a = rand(2, 5), k = rand(-4, 6), b = rand(1, 9), c = -a * k + b, s = pick(['<', '>']);
      eqn = `${b} − ${a}x ${s} ${n(c)}`;
      const kind = none ? 0 : rand(1, 3);
      const flip = FLIP[s];
      if (kind === 1) {
        lines = [`−${a}x ${s} ${n(c + b)}`, `x ${flip} ${frac(c + b, -a)}`];
        why = `Step 1 added ${b} instead of subtracting it. Undo “${b} −” by subtracting ${b}: −${a}x ${s} ${n(c - b)}.`;
      } else if (kind === 2) {
        lines = [`−${a}x ${s} ${n(c - b)}`, `x ${s} ${n(k)}`];
        why = `Step 2 divided by −${a} but kept the sign. Dividing by a negative <b>flips</b> it: x ${flip} ${n(k)}.`;
      } else if (kind === 3) {
        lines = [`−${a}x ${s} ${n(c - b)}`, `x ${flip} ${n(-k)}`];
        why = `Step 2 flipped the sign (good!) but dropped the negative when dividing. ${n(c - b)} ÷ (−${a}) = ${n(k)}.`;
      } else {
        lines = [`−${a}x ${s} ${n(c - b)}`, `x ${flip} ${n(k)}`];
      }
      bad = kind === 3 ? 2 : kind; fix = `x ${flip} ${n(k)}`;
    }
    const opts = lines.map((_, i) => `Step ${i + 1}`).concat('No mistake');
    const answer = bad ? `Step ${bad}` : 'No mistake';
    return {
      label: 'Spot the mistake', strategy: true,
      prompt: `Kiki solved <b>${eqn}</b>. Which step is the <b>first</b> mistake?`,
      visual: workHTML(lines),
      choices: opts, correct: opts.indexOf(answer), answer,
      steps: bad ? [why, `Done right, the answer is <b>${fix}</b>.`] : ['Every step is correct.', `The answer really is <b>${fix}</b>. Nice eye.`],
      hint: 'Check each step against the one before it. What operation did they do to both sides?',
    };
  }

  // Real-Life mode: swap bare x and y for items. "5x + 6 = x + 14" → "5🎀 + 6 = 🎀 + 14"
  function storyify(html, legend) {
    if (!html) return html;
    return String(html).split(/(<[^>]+>)/).map((seg) => (seg.startsWith('<') ? seg : seg
      .replace(/(?<![A-Za-z])x(?![A-Za-z\-])/g, legend.x.e)
      .replace(/(?<![A-Za-z])y(?![A-Za-z\-])/g, legend.y.e))).join('');
  }
  function legend() {
    const [a, b] = shuffle(ITEMS.slice()).slice(0, 2);
    return { x: a, y: b };
  }

  const UNITS = [
    { id: 'alg', name: 'Algebra', sat: 'Algebra', blurb: 'Equations, inequalities, lines & systems', color: '#FF4B91', dark: '#D63375', tint: '#FFE4EF' },
    { id: 'adv', name: 'Advanced Math', sat: 'Advanced Math', blurb: 'Functions, quadratics, exponents & more', color: '#9B6BFF', dark: '#7A4BE0', tint: '#EFE7FF' },
    { id: 'psda', name: 'Data & Percents', sat: 'Problem-Solving & Data', blurb: 'Percents, rates, stats & probability', color: '#22C483', dark: '#169E68', tint: '#DDF8EC' },
    { id: 'geo', name: 'Geometry & Trig', sat: 'Geometry & Trig', blurb: 'Triangles, trig, circles, area & volume', color: '#1CB0F6', dark: '#1590CF', tint: '#DDF2FD' },
    { id: 'str', name: 'Test Strategies', sat: 'Score boosters', blurb: 'Backsolve, plug in, ballpark, and catch mistakes', color: '#FF9640', dark: '#D9731F', tint: '#FFEBDD', strategy: true },
  ];
  const LEVELS = {
    easy: { name: 'Warm-Up', xp: 10, desc: 'Real-life stories with 🎀 and 👠' },
    medium: { name: 'Full Face', xp: 15, desc: 'Regular x’s. You’ve got this.' },
    hard: { name: 'Runway', xp: 20, desc: 'SAT-level and trickier' },
  };
  const MASTERY = ['Not started', 'Attempted', 'Familiar', 'Proficient', 'Mastered'];
  const skillById = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
  const unitById = Object.fromEntries(UNITS.map((u) => [u.id, u]));

  function problem(id, level) {
    const s = skillById[id];
    return { ...s.gen[level](), skill: id, level, domain: s.unit };
  }

  return { SKILLS, UNITS, LEVELS, MASTERY, skillById, unitById, problem, ITEMS, storyify, legend };
})();
