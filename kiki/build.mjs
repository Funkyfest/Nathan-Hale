// Bundles kiki/src into one self-contained HTML file: ../kiki.html
import { readFileSync, writeFileSync } from 'node:fs';

const src = (f) => readFileSync(new URL(`./src/${f}`, import.meta.url), 'utf8');
const JS = ['math.js', 'content.js', 'store.js', 'mascot.js', 'sound.js', 'fx.js', 'app.js'];

const js = `(() => {\n'use strict';\nconst KK = {};\n${JS.map((f) => `// ── ${f}\n${src(f)}`).join('\n')}\n})();`;
if (/<\/script/i.test(js)) throw new Error('JS must not contain a closing script tag');

const html = src('index.html')
  .replace('/*@css*/', () => src('styles.css'))
  .replace('/*@js*/', () => js);

const out = new URL('../kiki.html', import.meta.url);
writeFileSync(out, html);
console.log(`Built kiki.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
