import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

export const budgets = { chunk: 500_000, entry: 400_000, home: 517_690 };

// Follow static imports only; dynamic imports are loaded on demand.
export function staticFiles(manifest, keys) {
  const seen = new Set();
  const files = new Set();
  function visit(key) {
    if (seen.has(key)) return;
    seen.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Missing manifest entry: ${key}`);
    if (/\.m?js$/.test(chunk.file)) files.add(chunk.file);
    for (const dependency of chunk.imports ?? []) visit(dependency);
  }
  for (const key of keys) visit(key);
  return [...files];
}

export function auditBundle(manifest, readAsset) {
  const entry = Object.keys(manifest).filter(key => manifest[key].isEntry);
  const home = 'src/pages/Home/HomePage.tsx';
  if (entry.length !== 1 || !manifest[home]?.isDynamicEntry) throw new Error('Expected one entry and a lazy homepage in the build manifest');
  const all = [...new Set(Object.values(manifest).map(chunk => chunk.file).filter(file => /\.m?js$/.test(file)))];
  const sizes = new Map(all.map(file => {
    const data = readAsset(file);
    return [file, { bytes: data.length, gzip: gzipSync(data).length }];
  }));
  const sum = files => files.reduce((total, file) => ({ bytes: total.bytes + sizes.get(file).bytes, gzip: total.gzip + sizes.get(file).gzip }), { bytes: 0, gzip: 0 });
  const initial = sum(staticFiles(manifest, entry));
  const landing = sum(staticFiles(manifest, [...entry, home]));
  const largest = Math.max(...[...sizes.values()].map(size => size.bytes));
  const problems = [];
  if (largest > budgets.chunk) problems.push(`Largest JavaScript chunk exceeds ${budgets.chunk} bytes`);
  if (initial.bytes > budgets.entry) problems.push(`Entry JavaScript exceeds ${budgets.entry} bytes`);
  if (landing.bytes >= budgets.home) problems.push(`Homepage JavaScript does not improve on the verified ${budgets.home}-byte baseline`);
  if (Object.keys(manifest).some(key => key.includes('/TestTasks/'))) problems.push('Development test page is present in the production build');
  return { initial, landing, largest, total: sum(all), chunks: all.length, problems };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const dist = new URL('../dist/', import.meta.url);
    const manifest = JSON.parse(readFileSync(new URL('.vite/manifest.json', dist), 'utf8'));
    const result = auditBundle(manifest, file => readFileSync(new URL(file, dist)));
    console.log(JSON.stringify({ budgets, ...result }, null, 2));
    process.exitCode = result.problems.length ? 1 : 0;
  } catch (error) {
    console.error(`Bundle verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}
