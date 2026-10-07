import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './load.mjs';

let NOW = new Date(2026, 9, 1, 15, 0).getTime();
class FakeDate extends Date {
  constructor(...a) { if (a.length) super(...a); else super(NOW); }
  static now() { return NOW; }
}
const at = (y, m, d, h = 15) => { NOW = new Date(y, m - 1, d, h).getTime(); };
const mem = {};
const localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; }, removeItem: (k) => { delete mem[k]; } };
const KK = load(['math.js', 'content.js', 'store.js'], { Date: FakeDate, localStorage, btoa, atob, escape, unescape });
const S = KK.store;

test('streak grows day by day, resets after a miss, and freezes cover gaps', () => {
  S.reset();
  at(2026, 10, 1);
  assert.equal(S.extendStreak().extended, true);
  assert.equal(S.s.streak, 1);
  assert.equal(S.extendStreak().extended, false, 'second lesson same day does not double count');
  at(2026, 10, 2, 23);
  S.extendStreak();
  assert.equal(S.s.streak, 2);
  at(2026, 10, 4);
  assert.equal(S.liveStreak(), 0, 'missed a day with no freeze');
  S.extendStreak();
  assert.equal(S.s.streak, 1);
  S.s.freezes = 2;
  at(2026, 10, 7);
  assert.equal(S.liveStreak(), 1, 'two missed days, two freezes: still alive');
  const r = S.extendStreak();
  assert.equal(r.used, 2);
  assert.equal(S.s.streak, 2);
  assert.equal(S.s.freezes, 0);
});

test('day math survives daylight saving and month/year boundaries', () => {
  assert.equal(S.daysBetween('2026-11-01', '2026-11-02'), 1);
  assert.equal(S.daysBetween('2026-03-07', '2026-03-09'), 2);
  assert.equal(S.daysBetween('2026-12-31', '2027-01-01'), 1);
  assert.equal(S.addDays('2026-03-01', -1), '2026-02-28');
  at(2026, 11, 1, 23);
  S.reset(); S.extendStreak();
  at(2026, 11, 2, 0);
  S.extendStreak();
  assert.equal(S.s.streak, 2, 'just after midnight on the DST change still counts as the next day');
});

test('daily goal pays out once', () => {
  S.reset(); at(2026, 10, 10);
  const g0 = S.s.gems;
  assert.equal(S.addXP(40), false);
  assert.equal(S.addXP(30), true);
  assert.equal(S.addXP(30), false);
  assert.equal(S.s.gems, g0 + 10);
});

test('quests: stable for a day, always include XP, pay once', () => {
  S.reset(); at(2026, 10, 11);
  const a = S.quests().map((q) => q.id), b = S.quests().map((q) => q.id);
  assert.deepEqual(a, b);
  assert.equal(a[0], 'xp');
  assert.equal(new Set(a).size, 3);
  S.addXP(100);
  const paid = S.claimQuests();
  assert.ok(paid.some((q) => q.id === 'xp'));
  assert.equal(S.claimQuests().length, 0, 'no double pay');
});

test('Dad report round-trips and rejects injected markup', () => {
  S.reset(); at(2026, 10, 12);
  S.skill('lin').level = 3; S.skill('lin').correct = 9; S.skill('lin').total = 10;
  S.addXP(45); S.extendStreak();
  S.s.sat.push({ d: '2026-10-12', score: 560, c: 12, n: 22 });
  const r = S.decodeReport(S.encodeReport());
  assert.equal(r.skills.lin.level, 3);
  assert.equal(r.streak, 1);
  assert.equal(r.sat[0].score, 560);
  assert.equal(r.week.length, 7);

  const evil = Buffer.from(JSON.stringify({
    x: '<img src=x onerror=alert(1)>', s: -5, l: '<script>',
    k: { '<b>': [4, 1, 1], lin: ['<i>', 'x', 2] },
    w: { '2026-10-12': '<svg>', bad: 9 }, a: [['<x>', 1, 1, 1], ['2026-10-12', 9999, 1, 1]], bd: ['first', '<img>'],
  })).toString('base64url');
  const e = S.decodeReport(evil);
  const all = JSON.stringify(e);
  assert.doesNotMatch(all, /[<>]/);
  assert.equal(e.xp, 0);
  assert.equal(e.streak, 0);
  assert.equal(e.last, null);
  assert.deepEqual(Object.keys(e.skills), ['lin']);
  assert.equal(e.sat.length, 1);
  assert.equal(e.sat[0].score, 800);
  assert.deepEqual([...e.badges], ['first']);
  assert.equal(S.decodeReport('not-a-code!!'), null);
});

test('SAT estimate is monotonic and bounded', () => {
  let prev = 0;
  for (let i = 0; i <= 22; i++) {
    const v = S.estimate(i / 22);
    assert.ok(v >= prev && v >= 200 && v <= 800);
    prev = v;
  }
  assert.equal(S.estimate(0), 200);
  assert.equal(S.estimate(1), 800);
});
