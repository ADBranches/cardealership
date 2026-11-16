import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), 'utf8'));
const run = (...args) => spawnSync(process.execPath, ['scripts/run-tests.mjs', ...args], { cwd: root, encoding: 'utf8' });

test('frontend runner discovers every manual test', () => {
  const result = run('--dry-run');
  assert.equal(result.status, 0);
  const expected = readdirSync(new URL('../src/tests/', import.meta.url)).filter(name => name.endsWith('.manual.ts')).sort().map(name => `src/tests/${name}`);
  assert.deepEqual(result.stdout.trim().split('\n'), expected);
});

test('all retained historical aliases expand to existing test commands', () => {
  for (const name of Object.keys(read('scripts/test-suites.json'))) {
    const result = run(name, '--dry-run');
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
    assert.ok(result.stdout.trim(), name);
  }
  assert.notEqual(run('unknown-suite', '--dry-run').status, 0);
});

test('package names and dependency metadata match committed lockfiles', () => {
  for (const prefix of ['', 'backend/']) {
    const pkg = read(`${prefix}package.json`);
    const lock = read(`${prefix}package-lock.json`);
    assert.equal(pkg.name, lock.name);
    assert.equal(pkg.name, lock.packages[''].name);
    assert.deepEqual(pkg.dependencies, lock.packages[''].dependencies);
    assert.deepEqual(pkg.devDependencies, lock.packages[''].devDependencies);
  }
  const pkg = read('package.json');
  assert.ok(pkg.dependencies.react && pkg.dependencies['react-dom']);
  assert.equal(pkg.peerDependencies, undefined);
  assert.equal(pkg.main, undefined);
});
