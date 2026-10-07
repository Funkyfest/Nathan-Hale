KK.math = (() => {
  const MINUS = '−';
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  }
  const n = (v) => (v < 0 ? MINUS + Math.abs(v) : String(v));
  const paren = (v) => (v < 0 ? `(${n(v)})` : n(v));
  const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const sup = (v) => String(v).split('').map((c) => SUP[c] || c).join('');
  const body = (abs, v) => (v === '' ? String(abs) : abs === 1 ? v : `${abs}${v}`);
  // Leading term of an expression: 3x, −x, 5
  const lead = (c, v = '') => (c === 0 ? (v ? '' : '0') : (c < 0 ? MINUS : '') + body(Math.abs(c), v));
  // Following term: " + 3x", " − 5"; empty when zero
  const term = (c, v = '') => (c === 0 ? '' : ` ${c < 0 ? MINUS : '+'} ${body(Math.abs(c), v)}`);
  function poly(coefs, x = 'x') {
    const deg = coefs.length - 1;
    let out = '';
    coefs.forEach((c, i) => {
      if (!c) return;
      const p = deg - i;
      const v = p === 0 ? '' : p === 1 ? x : x + sup(p);
      out += out ? term(c, v) : lead(c, v);
    });
    return out || '0';
  }
  function frac(a, b) {
    if (b < 0) { a = -a; b = -b; }
    const g = gcd(a, b);
    a /= g; b /= g;
    return b === 1 ? n(a) : `${n(a)}/${b}`;
  }
  function money(v) {
    const abs = Math.abs(v);
    const s = abs.toLocaleString('en-US', {
      minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return (v < 0 ? MINUS : '') + '$' + s;
  }
  const dec = (v) => String(+v.toFixed(2));

  // Grid-in answers: integers, decimals, fractions, negatives.
  function parse(s) {
    s = String(s).trim().replace(/[−–—]/g, '-').replace(/[$,]/g, '');
    const NUM = '-?(?:\\d+\\.?\\d*|\\.\\d+)';
    if (new RegExp(`^${NUM}/${NUM}$`).test(s)) {
      const [a, b] = s.split('/').map(Number);
      return b === 0 ? NaN : a / b;
    }
    if (new RegExp(`^${NUM}$`).test(s)) return Number(s);
    return NaN;
  }
  // Like the SAT: exact value, or a decimal with 3+ places that rounds/truncates to it.
  function gridOk(input, value) {
    const v = parse(input);
    if (!Number.isFinite(v)) return false;
    if (Math.abs(v - value) < 1e-9) return true;
    const s = String(input);
    const places = (s.split('.')[1] || '').replace(/\D/g, '').length;
    return !s.includes('/') && places >= 3 && Math.abs(v - value) < 0.001;
  }

  // Build up to 4 distinct shuffled choices containing the answer.
  function choices(answer, wrongs, max = 4) {
    const set = new Set([answer]);
    for (const w of shuffle(wrongs.slice())) {
      if (set.size >= max) break;
      if (w !== null && w !== undefined && w !== '' && !/NaN|Infinity|undefined/.test(w)) set.add(w);
    }
    const list = shuffle([...set]);
    return { list, idx: list.indexOf(answer) };
  }
  const near = (ans, deltas, fmt = n, ok = () => true) =>
    deltas.map((d) => +(ans + d).toFixed(4)).filter((v) => v !== ans && ok(v)).map(fmt);

  return { MINUS, rand, pick, chance, shuffle, gcd, n, paren, sup, lead, term, poly, frac, money, dec, parse, gridOk, choices, near };
})();
