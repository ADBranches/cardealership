import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
function collect(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(file) : entry.isFile() && entry.name.endsWith('.test.js') ? [file] : [];
  });
}
const files = [...collect(path.join(root, 'tests/integration')), ...collect(path.join(root, 'tests/unit'))].sort();
if (!files.length) { console.error('No automated backend tests found.'); process.exit(1); }
if (process.argv.includes('--list')) { console.log(files.map(file => path.relative(root, file)).join('\n')); process.exit(0); }
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...files], { cwd: root, env: { ...process.env, NODE_ENV: 'test' }, stdio: 'inherit' });
process.exitCode = result.status === 0 && !result.error ? 0 : 1;
