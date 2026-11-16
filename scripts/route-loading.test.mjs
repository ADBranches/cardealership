import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { auditBundle, staticFiles } from './check-bundle.mjs';

const source = readFileSync(new URL('../src/app/App.tsx', import.meta.url), 'utf8');
const feedback = readFileSync(new URL('../src/app/components/routing/RouteFeedback.tsx', import.meta.url), 'utf8');
const home = 'src/pages/Home/HomePage.tsx';
const manifest = {
  'index.html': { file: 'entry.js', isEntry: true, imports: ['shared'], dynamicImports: [home, 'admin'] },
  shared: { file: 'shared.js' },
  [home]: { file: 'home.js', isDynamicEntry: true, imports: ['shared'] },
  admin: { file: 'admin.js', isDynamicEntry: true },
};

test('each page is lazy and existing auth guards precede admin content', () => {
  for (const name of ['HomePage', 'LoginPage', 'RegisterPage', 'Admin', 'AdminDashboard', 'AdminChatPage', 'SettingsPage', 'VehicleDetailsPage']) {
    assert.match(source, new RegExp(`const ${name} = lazy\\(`));
  }
  assert.match(source, /user\?\.role !== "admin"[\s\S]*?<AdminChatProvider>/);
  assert.match(source, /path="\/Admin"[\s\S]*?<ProtectedRoute>[\s\S]*?<AdminChatLayout/);
  assert.match(source, /path="\/settings"[\s\S]*?<ProtectedRoute>[\s\S]*?<SettingsPage/);
  assert.match(source, /path="\/login"[\s\S]*?<PublicOnlyRoute>[\s\S]*?<LoginPage/);
  assert.match(source, /import\.meta\.env\.DEV \? lazy/);
  assert.match(source, /path="\/test" element=\{\s*<ProtectedRoute>\s*<DevelopmentAdminRoute>/);
  assert.match(source, /function DevelopmentAdminRoute[\s\S]*?user\?\.role === "admin"/);
});

test('route loading and error recovery expose accessible, generic feedback', () => {
  assert.match(source, /<RouteErrorBoundary>\s*<Suspense fallback=\{<RouteLoading \/>\}>/);
  assert.match(feedback, /role="status"/);
  assert.match(feedback, /role="alert"/);
  assert.match(feedback, /window\.location\.reload\(\)/);
  assert.doesNotMatch(feedback, /error\.message|error\.stack/);
});

test('bundle calculation excludes unrelated dynamic imports and deduplicates shared chunks', () => {
  assert.deepEqual(staticFiles(manifest, ['index.html', home]), ['entry.js', 'shared.js', 'home.js']);
  const result = auditBundle(manifest, () => Buffer.alloc(100));
  assert.equal(result.initial.bytes, 200);
  assert.equal(result.landing.bytes, 300);
  assert.equal(result.total.bytes, 400);
  assert.deepEqual(result.problems, []);
});

test('oversized chunks and development pages fail the budget', () => {
  const result = auditBundle({ ...manifest, 'src/pages/TestTasks/TestTasks.tsx': { file: 'test.js' } }, () => Buffer.alloc(600_000));
  assert.equal(result.problems.length, 4);
  assert.throws(() => staticFiles(manifest, ['missing']), /Missing manifest entry/);
});
