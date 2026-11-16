import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const ui = path.join(root, 'src/components/ui');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const source = walk(path.join(root, 'src')).filter(file => /\.(tsx?|jsx?|css)$/.test(file));

test('all shared UI references resolve to retained components', () => {
  for (const file of source) {
    const contents = readFileSync(file, 'utf8');
    for (const match of contents.matchAll(/(?:components\/ui\/|\/ui\/)([\w-]+)/g)) {
      assert.ok(['.tsx', '.ts'].some(ext => existsSync(path.join(ui, match[1] + ext))), `${file}: ${match[1]}`);
    }
  }
});

test('every retained Radix dependency has a source import', () => {
  const imports = source.map(file => readFileSync(file, 'utf8')).join('\n');
  const radix = Object.keys(manifest.dependencies).filter(name => name.startsWith('@radix-ui/'));
  for (const name of radix) assert.ok(imports.includes(`"${name}"`) || imports.includes(`'${name}'`), name);
  for (const match of imports.matchAll(/["'](@radix-ui\/[\w-]+)["']/g)) assert.ok(manifest.dependencies[match[1]], match[1]);
  assert.ok(!Object.keys(manifest.dependencies).some(name => /^(?:@mui\/|@emotion\/|mongoose$|bcryptjs$)/.test(name)));
});
