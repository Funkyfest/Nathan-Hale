import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Runs the browser source files in a sandbox and returns the shared KK namespace.
export function load(files, globals = {}) {
  const src = files.map((f) => readFileSync(new URL(`../src/${f}`, import.meta.url), 'utf8')).join('\n');
  const ctx = vm.createContext({ console, ...globals });
  vm.runInContext(`const KK = {};\n${src}\nglobalThis.KK = KK;`, ctx);
  return ctx.KK;
}
