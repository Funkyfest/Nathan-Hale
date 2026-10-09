// End-to-end click-through at iPhone size. Usage: node test/e2e.mjs [screenshotDir]
// Needs Playwright (NODE_PATH pointing at a global install is fine).
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const FILE = 'file://' + path.resolve(here, '../../kiki.html');
const OUT = process.argv[2] || path.resolve(here, '../.shots');
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); };
const shot = (page, name, full = false) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });

async function answer(page, which, right) {
  const q = await page.evaluate((w) => {
    const s = w === 'lesson' ? KIKI_DEBUG.lesson : KIKI_DEBUG.test;
    const p = w === 'lesson' ? s.qs[s.i] : s.qs[s.i];
    return { type: p.type, correct: p.correct, value: p.value, n: p.choices.length };
  }, which);
  if (q.type === 'mc') {
    await page.click(`.choice[data-i="${right ? q.correct : (q.correct + 1) % q.n}"]`);
  } else {
    const s = String(right ? q.value : q.value + 1).slice(0, 7);
    for (const ch of s) await page.click(`.key[data-k="${ch === '-' ? '−' : ch}"]`);
  }
  return q.type;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, timezoneId: 'America/Chicago', hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_CERT|net::/.test(m.text())) errors.push(m.text()); });
page.on('dialog', (d) => d.accept());

await page.goto(FILE);
await page.waitForTimeout(500);

// Onboarding
await shot(page, '01-onboard-hello');
await page.click('[data-act="ob-next"]');
await shot(page, '02-onboard-goal');
await page.click('[data-act="ob-goal"][data-g="60"]');
await page.click('[data-act="ob-next"]');
await shot(page, '03-onboard-how');
await page.click('[data-act="ob-done"]');
await page.waitForTimeout(400);
check('onboarding completes', await page.isVisible('.tabbar'));
await shot(page, '04-learn', true);
await shot(page, '04b-learn-top');

// Skill sheet + lesson
await page.click('.node.current');
await page.waitForTimeout(350);
await shot(page, '05-skill-sheet');
await page.click('[data-act="start"]');
await page.waitForTimeout(300);
check('lesson hides tab bar', !(await page.isVisible('.tabbar')));
await shot(page, '06-lesson-question');
await answer(page, 'lesson', false);
await page.click('[data-act="check"]');
await page.waitForTimeout(500);
await shot(page, '07-lesson-wrong');
const redoQueued = await page.evaluate(() => KIKI_DEBUG.lesson.qs.length === 7);
check('miss queues a redo', redoQueued);
await page.keyboard.press('Enter');
await page.waitForTimeout(200);
let sawGrid = false, sawRight = false;
for (let i = 0; i < 12; i++) {
  if (!(await page.evaluate(() => !!KIKI_DEBUG.lesson))) break;
  const t = await answer(page, 'lesson', true);
  if (t === 'grid') {
    const box = await page.textContent('#gdisp');
    if (/alg|adv|psda|geo/.test(box)) check('typed-answer box shows only the answer', false, box);
    if (!sawGrid) { sawGrid = true; await shot(page, '08-lesson-grid-typed'); }
  }
  await page.click('[data-act="check"]');
  await page.waitForTimeout(250);
  if (!sawRight) { sawRight = true; await page.waitForTimeout(300); await shot(page, '09-lesson-right'); }
  const okFoot = await page.isVisible('.lesson-foot.ok');
  if (!okFoot) check('correct answer accepted', false, await page.evaluate(() => JSON.stringify(KIKI_DEBUG.lesson.qs[KIKI_DEBUG.lesson.i].answer)));
  await page.click('[data-act="continue"]');
  await page.waitForTimeout(150);
}
check('lesson finished into celebration', await page.isVisible('.flow'));
await page.waitForTimeout(1100);
await shot(page, '10-flow-lesson');
for (let i = 0; i < 6 && (await page.isVisible('[data-act="flow-next"]')); i++) {
  const type = await page.evaluate(() => KIKI_DEBUG.flow && KIKI_DEBUG.flow.steps[KIKI_DEBUG.flow.i].type);
  if (i > 0) { await page.waitForTimeout(900); await shot(page, `11-flow-${i}-${type}`); }
  await page.click('[data-act="flow-next"]');
  await page.waitForTimeout(300);
}
const st = await page.evaluate(() => ({ streak: KIKI_DEBUG.store.liveStreak(), xp: KIKI_DEBUG.store.s.xp, lv: KIKI_DEBUG.store.level('lin') }));
check('streak started', st.streak === 1, JSON.stringify(st));
check('xp earned', st.xp > 0, JSON.stringify(st));
check('skill leveled', st.lv >= 1, JSON.stringify(st));
await shot(page, '12-learn-after');

// SAT
await page.click('.tab[data-tab="sat"]');
await page.waitForTimeout(300);
await shot(page, '13-sat-tab', true);
await page.click('[data-act="test"][data-n="10"]');
await page.waitForTimeout(300);
await shot(page, '14-sat-question');
for (let i = 0; i < 10; i++) {
  await answer(page, 'test', i % 3 !== 0);
  if (i === 2) await page.click('[data-act="flag"]');
  await page.click('[data-act="tnext"]');
  await page.waitForTimeout(80);
}
await page.waitForTimeout(250);
await shot(page, '15-sat-navigator');
await page.click('[data-act="tsubmit"]');
await page.waitForTimeout(1200);
await shot(page, '16-sat-results');
await shot(page, '16b-sat-results-full', true);
const sat = await page.evaluate(() => KIKI_DEBUG.store.s.sat.slice(-1)[0]);
check('SAT scored 6/10 (answered 6 right)', sat && sat.c === 6, JSON.stringify(sat));
for (let i = 0; i < 6 && (await page.isVisible('[data-act="flow-next"]')); i++) { await page.click('[data-act="flow-next"]'); await page.waitForTimeout(250); }
await shot(page, '17-sat-after', true);

// Quests, Shop, Me
await page.click('.tab[data-tab="quests"]');
await shot(page, '18-quests', true);
await page.click('.tab[data-tab="shop"]');
const gems = await page.evaluate(() => KIKI_DEBUG.store.s.gems);
if (gems >= 40) await page.click('[data-act="buy"][data-id="bow"]');
await page.waitForTimeout(300);
await shot(page, '19-shop', true);
check('bought bow', gems < 40 || (await page.evaluate(() => KIKI_DEBUG.store.s.wearing === 'bow')), `gems ${gems}`);
await page.click('.tab[data-tab="me"]');
await shot(page, '20-me', true);

// Dad report
const code = await page.evaluate(() => KIKI_DEBUG.store.encodeReport());
const dad = await ctx.newPage();
dad.on('pageerror', (e) => errors.push('dad: ' + e.message));
await dad.goto(`${FILE}?d=${code}`);
await dad.waitForTimeout(400);
await shot(dad, '21-dad-report', true);
check('Dad report renders', await dad.isVisible('.dad-top'));

// Tampered link must not run script
let popped = false;
const evil = await ctx.newPage();
evil.on('dialog', (d) => { popped = true; d.dismiss(); });
const payload = Buffer.from(JSON.stringify({ t: 1, k: { '<img src=x onerror=alert(1)>': [4, 1, 1] }, w: { '2026-10-07': '<img src=x onerror=alert(2)>' }, bd: ['<img src=x onerror=alert(3)>'] })).toString('base64url');
await evil.goto(`${FILE}?d=${payload}`);
await evil.waitForTimeout(400);
check('tampered link is harmless', !popped && !(await evil.$('img')));

// Narrow phone
const small = await browser.newContext({ viewport: { width: 360, height: 740 }, deviceScaleFactor: 2 });
const sp = await small.newPage();
await sp.goto(FILE);
await sp.evaluate(() => { KIKI_DEBUG.store.s.onboarded = true; KIKI_DEBUG.store.save(); });
await sp.reload();
const overflow = await sp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('no sideways scroll at 360px', overflow <= 0, `overflow ${overflow}px`);
await sp.screenshot({ path: `${OUT}/22-learn-360.png` });

// ── v2 features ──
const p2 = await ctx.newPage();
p2.on('pageerror', (e) => errors.push('v2: ' + e.message));
p2.on('dialog', (d) => d.accept());
await p2.goto(FILE);
await p2.evaluate(() => { const S = KIKI_DEBUG.store; S.s.onboarded = true; S.skill('lin').level = 2; S.save(); });
await p2.reload(); await p2.waitForTimeout(400);

// Real-Life mode: a Full Face (level-2) linear lesson shows items instead of x, and the toggle flips it
await p2.click('.node[data-id="lin"]'); await p2.waitForTimeout(250);
await p2.click('[data-act="start"]'); await p2.waitForTimeout(250);
for (let i = 0; i < 6; i++) {
  const lvl = await p2.evaluate(() => KIKI_DEBUG.lesson.qs[KIKI_DEBUG.lesson.i].level);
  if (lvl === 'medium') break;
  await answer(p2, 'lesson', true); await p2.click('[data-act="check"]'); await p2.waitForTimeout(120); await p2.click('[data-act="continue"]'); await p2.waitForTimeout(120);
}
const legendOn = await p2.isVisible('.legend-x');
const eqOn = await p2.textContent('.visual');
await shot(p2, '23-real-life-mode');
check('Real-Life mode shows legend and no plain x', legendOn && !/(^|[^a-z])x([^a-z]|$)/.test(eqOn.replace(/[^\x00-\x7F]/g, '')), eqOn);
await p2.click('[data-act="story"]'); await p2.waitForTimeout(200);
const eqOff = await p2.textContent('.visual');
check('toggle shows plain x', /x/.test(eqOff) && !(await p2.isVisible('.legend-x')), eqOff);
await shot(p2, '24-plain-x');
await p2.click('[data-act="story"]'); await p2.waitForTimeout(150);
// ON FIRE mode after 5 in a row (combo persists across questions)
let fire = false;
for (let i = 0; i < 9; i++) {
  if (await p2.evaluate(() => !KIKI_DEBUG.lesson)) break;
  await answer(p2, 'lesson', true); await p2.click('[data-act="check"]'); await p2.waitForTimeout(150);
  if (await p2.evaluate(() => document.querySelector('.lesson.fire') !== null)) { fire = true; await shot(p2, '25-on-fire'); }
  await p2.click('[data-act="continue"]'); await p2.waitForTimeout(120);
}
check('ON FIRE mode at a 5-combo', fire);
await p2.waitForTimeout(900);
await shot(p2, '26-level-up-ring');
for (let i = 0; i < 6 && (await p2.isVisible('[data-act="flow-next"]')); i++) { await p2.click('[data-act="flow-next"]'); await p2.waitForTimeout(250); }
await p2.waitForTimeout(700);
check('path draws a trail', (await p2.$$('.path .trail path')).length >= 5);
await shot(p2, '27-path-after-levelup');

// Strategies: Spot the Mistake lesson renders worked steps
await p2.evaluate(() => document.querySelector('.node[data-id="mistake"]').scrollIntoView());
await p2.click('.node[data-id="mistake"]'); await p2.waitForTimeout(250);
await p2.click('[data-act="start"]'); await p2.waitForTimeout(250);
check('spot-the-mistake shows worked steps', (await p2.$$('.work li')).length >= 2 && (await p2.isVisible('.strat-tag')));
await shot(p2, '28-spot-the-mistake');
await p2.click('[data-act="quit"]'); await p2.waitForTimeout(150); await p2.click('[data-act="quit-leave"]'); await p2.waitForTimeout(250);

// Spaced review: make a skill look a week old, expect the review card, run the touch-up
await p2.evaluate(() => { const S = KIKI_DEBUG.store; S.skill('lin').level = 3; S.skill('lin').last = S.addDays(S.today(), -8); S.save(); });
await p2.reload(); await p2.waitForTimeout(400);
check('review card appears for a fading skill', await p2.isVisible('.review-card') && (await p2.$$('.node.fading')).length === 1);
await shot(p2, '29-review-card');
await p2.click('[data-act="review"]'); await p2.waitForTimeout(250);
check('touch-up lesson starts', (await p2.textContent('.lesson-kind')).includes('Touch-up'));
await p2.click('[data-act="quit"]'); await p2.waitForTimeout(150); await p2.click('[data-act="quit-leave"]'); await p2.waitForTimeout(250);

// Unit test: locked until every skill is started, then levels up fully-correct skills
check('unit test locked at first', (await p2.$$('.node.trophy.locked')).length >= 1);
await p2.evaluate(() => { const S = KIKI_DEBUG.store; for (const id of ['lin', 'ineq', 'linfn', 'sys']) { S.skill(id).level = Math.max(1, S.level(id)); } S.save(); });
await p2.reload(); await p2.waitForTimeout(400);
await p2.click('.node.trophy[data-unit="alg"]'); await p2.waitForTimeout(250);
await shot(p2, '30-unit-test-sheet');
await p2.click('[data-act="start-unit"]'); await p2.waitForTimeout(250);
for (let i = 0; i < 10; i++) { await answer(p2, 'lesson', true); await p2.click('[data-act="check"]'); await p2.waitForTimeout(100); await p2.click('[data-act="continue"]'); await p2.waitForTimeout(100); }
await p2.waitForTimeout(900);
const unitFlow = await p2.evaluate(() => KIKI_DEBUG.flow && KIKI_DEBUG.flow.steps[0]);
check('unit test passed with level-ups', unitFlow && unitFlow.type === 'unit' && unitFlow.passed && unitFlow.ups.length >= 1, JSON.stringify(unitFlow && { passed: unitFlow.passed, ups: unitFlow.ups }));
await shot(p2, '31-unit-test-passed', true);
for (let i = 0; i < 6 && (await p2.isVisible('[data-act="flow-next"]')); i++) { await p2.click('[data-act="flow-next"]'); await p2.waitForTimeout(250); }
check('trophy shows best score', (await p2.textContent('.node-row:has(.trophy[data-unit="alg"]) .node-label')).includes('100%'));
await p2.click('.tab[data-tab="sat"]'); await p2.waitForTimeout(300);
check('SAT tab lists work-on-next skills', (await p2.$$('.next-item')).length >= 1);
await shot(p2, '32-sat-work-on-next');

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();

for (const r of results) console.log(`${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : `  → ${r.detail}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} FAILED` : `\nAll ${results.length} checks passed`);
process.exit(failed ? 1 : 0);
