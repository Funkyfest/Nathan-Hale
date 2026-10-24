// Headless verification for a single-file HTML slide deck.
// Usage: node verify-deck.mjs path/to/deck.html [expectedSlides]
import { resolve, dirname } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';

// Find playwright: local install, then PLAYWRIGHT_MODULE, then the cloud session's shared copy.
const require = createRequire(import.meta.url);
const candidates = ['playwright', process.env.PLAYWRIGHT_MODULE, '/opt/node-tools/node_modules/playwright'].filter(Boolean);
let chromium;
for (const c of candidates) { try { ({ chromium } = require(c)); break; } catch {} }
if (!chromium) { console.error('playwright not found; npm i -D playwright or set PLAYWRIGHT_MODULE'); process.exit(2); }
const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;

const deck = resolve(process.argv[2] || 'index.html');
const expected = Number(process.argv[3] || 0);
const shots = resolve(dirname(deck), 'shots');
mkdirSync(shots, { recursive: true });

const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const viewports = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
let failed = false;

for (const [name, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + deck);
  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  if (expected && total !== expected) { console.log(`[${name}] FAIL slide count ${total}, expected ${expected}`); failed = true; }
  for (let i = 0; i < total; i++) {
    if (i > 0) await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600); // let the 0.35s fade settle
    const r = await page.evaluate(() => {
      const s = document.querySelector('.slide.active');
      return { id: s.id, overflows: s.scrollHeight > s.clientHeight + 2, wide: document.documentElement.scrollWidth > innerWidth };
    });
    if (r.wide) { console.log(`[${name}] FAIL horizontal overflow on ${r.id}`); failed = true; }
    if (r.overflows && name === 'desktop') { console.log(`[${name}] FAIL content overflows on ${r.id}`); failed = true; }
    if (r.overflows && name === 'phone') console.log(`[${name}] note: ${r.id} scrolls on phone`);
    await page.screenshot({ path: `${shots}/${name}-${r.id}.png` });
  }
  const nextDisabled = await page.evaluate(() => document.getElementById('next')?.disabled ?? null);
  if (nextDisabled !== true) { console.log(`[${name}] FAIL Next button not disabled on last slide`); failed = true; }
  if (errors.length) { console.log(`[${name}] FAIL errors:`, errors); failed = true; }
  console.log(`[${name}] ${total} slides, ${errors.length} errors`);
  await page.close();
}
await browser.close();
console.log(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
process.exit(failed ? 1 : 0);
