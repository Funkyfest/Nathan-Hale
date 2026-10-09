import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

const KK = load(['math.js', 'content.js']);
const { problem, storyify, legend, SKILLS } = KK.content;
const strip = (s) => String(s).replace(/<[^>]+>/g, ' ');

test('Real-Life mode swaps only bare x and y', () => {
  const L = { x: { e: '🎀' }, y: { e: '👠' } };
  assert.equal(storyify('5x + 6 = x + 14', L), '5🎀 + 6 = 🎀 + 14');
  assert.equal(storyify('x² − 4x + 3', L), '🎀² − 4🎀 + 3');
  assert.equal(storyify('3x + 2y = 12', L), '3🎀 + 2👠 = 12');
  assert.equal(storyify('<i>x</i> = −3', L), '<i>🎀</i> = −3');
  assert.equal(storyify('the x-coordinate of max', L), 'the x-coordinate of max', 'words and hyphenated uses stay');
  assert.equal(storyify('exponent', L), 'exponent');
  const lg = legend();
  assert.notEqual(lg.x.e, lg.y.e);
});

test('backsolving choices are sorted and contain the answer', () => {
  for (let i = 0; i < 300; i++) {
    for (const L of ['easy', 'medium', 'hard']) {
      const p = problem('backsolve', L);
      const nums = p.choices.map((c) => Number(c.replace(/^x = /, '').replace('−', '-')));
      assert.ok(nums.every((v, k) => k === 0 || v > nums[k - 1]), `${L}: not ascending ${p.choices}`);
      assert.equal(p.choices[p.correct], p.answer);
    }
  }
});

test('spot-the-mistake marks the first wrong step correctly', () => {
  let noMistake = 0;
  for (let i = 0; i < 600; i++) {
    const L = ['easy', 'medium', 'hard'][i % 3], p = problem('mistake', L);
    const steps = strip(p.visual).match(/Step \d/g).length;
    assert.ok(p.choices.length === steps + 1, `${L}: ${p.choices}`);
    assert.equal(p.choices[p.correct], p.answer);
    if (p.answer === 'No mistake') noMistake++;
    assert.doesNotMatch(strip(p.visual), /NaN|undefined/);
  }
  assert.ok(noMistake > 40 && noMistake < 250, `no-mistake share looks off: ${noMistake}/600`);
});

test('strategy problems are flagged and attached to the strategies unit', () => {
  const str = SKILLS.filter((s) => s.unit === 'str').map((s) => s.id);
  assert.deepEqual([...str], ['backsolve', 'plugin', 'ballpark', 'mistake']);
  for (const id of str) assert.equal(problem(id, 'medium').strategy, true);
});
