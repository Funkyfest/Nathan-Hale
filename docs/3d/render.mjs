// Renders each 3-D scene to ../figures/*.png with headless Chromium.
// Usage: npm install && CHROMIUM=/path/to/chrome node render.mjs [scene ...]
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const OUT = { campus: "fig01-campus", cutaway: "fig02-cutaway", hall: "fig04-hall", rack: "fig05-rack", pod: "fig09-pod" };
const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(OUT);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".ttf": "font/ttf" };
const server = createServer(async (req, res) => {
  const p = join(here, decodeURIComponent(new URL(req.url, "http://x").pathname));
  let body;
  try { body = await readFile(p); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }); res.end(body);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 8 / 3 });
page.on("pageerror", e => console.error("pageerror:", e.message)); page.on("console", m => console.error("console:", m.text())); page.on("requestfailed", r => console.error("failed:", r.url()));
for (const n of names) {
  await page.goto(`http://127.0.0.1:${port}/render.html?s=${n}&w=1200&h=750`);
  await page.waitForFunction("window.__done === true", null, { timeout: 180000 });
  await page.locator("#wrap").screenshot({ path: join(here, "..", "figures", OUT[n] + ".png") });
  console.log("rendered", n);
}
await browser.close(); server.close();
