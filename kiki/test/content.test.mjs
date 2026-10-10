import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const KK = load(['math.js', 'content.js']);
const { SKILLS, problem } = KK.content;
const { gridOk, parse } = KK.math;
const LEVELS = ['easy', 'medium', 'hard'];
const RUNS = 400;
const strip = (s) => String(s).replace(/<[^>]+>/g, ' ');

test('every skill and level generates valid, well-formed problems', () => {
  for (const s of SKILLS) {
    for (const L of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const p = problem(s.id, L);
        const where = `${s.id}.${L}: ${strip(p.prompt)} ${strip(p.visual || '')}`;
        assert.ok(p.choices.length >= 3, `${where} has only ${p.choices.length} choices`);
        assert.ok(p.correct >= 0, `${where} answer missing from choices`);
        assert.equal(new Set(p.choices).size, p.choices.length, `${where} duplicate choices`);
        assert.ok(p.steps.length >= 2, `${where} needs steps`);
        const text = [p.prompt, p.visual, ...p.choices, ...p.steps, p.hint, p.bridge].filter(Boolean).map(strip).join(' ');
        assert.doesNotMatch(text, /NaN|undefined|Infinity|\[object/, `${where} has broken text`);
        const shown = [p.prompt, p.visual, ...p.choices].filter(Boolean).map(strip).join(' ');
        assert.doesNotMatch(shown, /\+ −|− −|\+ \+|\b1x\b|\b0x\b|\+ 0\b|− 0\b/, `${where} has ugly math: ${shown}`);
        assert.doesNotMatch(text, /\+ −|− −|\+ \+|\b1x\b|\b0x\b/, `${where} has ugly math in steps: ${text}`);
      }
    }
  }
});

test('numeric answers match their displayed choice', () => {
  for (const s of SKILLS) {
    for (const L of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const p = problem(s.id, L);
        if (!Number.isFinite(p.value)) continue;
        const shown = p.choices[p.correct].replace(/^(x = |Day )/, '').replace(/ (ft\/s|ft|s|cups|sq in|cubic in|times|hours)$/, '').replace(/%$/, '');
        assert.ok(gridOk(shown, p.value), `${s.id}.${L}: choice "${p.choices[p.correct]}" ≠ value ${p.value}`);
      }
    }
  }
});

test('word problems are solvable and correct', () => {
  for (let i = 0; i < RUNS; i++) {
    const p = problem('lin', 'easy');
    const nums = strip(p.prompt).match(/\$\d+/g).map((s) => +s.slice(1));
    const k = +strip(p.prompt).match(/buy (\d+)/)[1];
    const [fee, total] = [nums[0], nums[1]];
    assert.equal((total - fee) / k, p.value);
  }
});

test('grid-in accepts SAT-style equivalent answers', () => {
  assert.ok(gridOk('3/4', 0.75));
  assert.ok(gridOk('.75', 0.75));
  assert.ok(gridOk('0.75', 0.75));
  assert.ok(gridOk('−2', -2));
  assert.ok(gridOk('-2', -2));
  assert.ok(gridOk('6/8', 0.75));
  assert.ok(gridOk('.666', 2 / 3));
  assert.ok(gridOk('.667', 2 / 3));
  assert.ok(gridOk('$12.50', 12.5));
  assert.ok(!gridOk('.67', 2 / 3), 'too few decimal places');
  assert.ok(!gridOk('3/0', 0));
  assert.ok(!gridOk('abc', 1));
  assert.ok(!gridOk('', 0));
  assert.ok(Number.isNaN(parse('1 1/2')), 'mixed numbers are not allowed on the SAT');
});
