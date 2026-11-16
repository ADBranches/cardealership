import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const registry = JSON.parse(readFileSync(new URL('./test-suites.json', import.meta.url), 'utf8'));
const frontend = readdirSync(path.join(root, 'src/tests')).filter(name => name.endsWith('.manual.ts')).sort().map(name => `src/tests/${name}`);
const special = { frontend, all: [...frontend, '@backend'], backend: ['@backend'], 'car-image-cleanup': ['backend/tests/carImageCleanup.manual.js'], 'sprint9': ['@backend'] };

function expand(name, ancestors = []) {
  if (name === '@backend' || name === '@build') return [name];
  if (/^(src\/tests\/[\w-]+\.manual\.ts|backend\/tests\/[\w-]+\.manual\.js)$/.test(name)) {
    if (!existsSync(path.join(root, name))) throw new Error(`Missing test file: ${name}`);
    return [name];
  }
  if (ancestors.includes(name)) throw new Error(`Cyclic test suite: ${name}`);
  const entries = Object.hasOwn(special, name) ? special[name] : Object.hasOwn(registry, name) ? registry[name] : null;
  if (!entries) throw new Error(`Unknown test suite: ${name}. Run npm run test:list.`);
  return entries.flatMap(entry => expand(entry, [...ancestors, name]));
}

const names = process.argv.slice(2);
if (names.includes('--list')) {
  for (const name of [...new Set([...Object.keys(special), ...Object.keys(registry)])].sort()) console.log(`${name}: ${new Set(expand(name)).size} command(s)`);
  process.exit(0);
}
const dryRun = names.includes('--dry-run');
const selected = names.filter(name => name !== '--dry-run');
let tests;
try { tests = [...new Set((selected.length ? selected : ['frontend']).flatMap(name => expand(name)))]; }
catch (error) { console.error(error.message); process.exit(1); }
if (dryRun) { console.log(tests.join('\n')); process.exit(0); }

let failures = 0;
for (const entry of tests) {
  console.log(`\n===== ${entry} =====`);
  if (entry === '@build' && failures) { console.log('Build skipped because the preceding tests failed.'); continue; }
  const cwd = entry === '@backend' ? path.join(root, 'backend') : root;
  const args = entry === '@backend' ? ['scripts/run-tests.js'] : entry === '@build' ? ['node_modules/vite/bin/vite.js', 'build'] : entry.endsWith('.ts') ? ['--import', 'tsx', entry] : [entry];
  const env = entry === '@build' ? process.env : { ...process.env, NODE_ENV: 'test' };
  const result = spawnSync(process.execPath, args, { cwd, env, stdio: 'inherit' });
  if (result.status !== 0 || result.error) { failures++; console.error(`FAILED: ${entry}`); }
}
console.log(`\nTest commands: ${tests.length}; failures: ${failures}`);
process.exitCode = failures ? 1 : 0;
