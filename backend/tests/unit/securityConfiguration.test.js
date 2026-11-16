import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRuntimeSecurity, resolveAdministratorReset } from '../../config/security.js';

test('production fails closed on absent or weak JWT credentials', () => {
  assert.throws(() => resolveRuntimeSecurity({ NODE_ENV: 'production' }), /JWT_SECRET/);
  assert.throws(() => resolveRuntimeSecurity({ NODE_ENV: 'production', JWT_SECRET: 'short' }), /JWT_SECRET/);
  assert.throws(() => resolveRuntimeSecurity({ NODE_ENV: 'production', JWT_SECRET: 'a'.repeat(48) }), /JWT_SECRET/);
});

test('production requires explicit HTTPS origins', () => {
  const base = { NODE_ENV: 'production', JWT_SECRET: 'test-only-pseudo-random-string-123456789' };
  assert.throws(() => resolveRuntimeSecurity(base), /CORS_ALLOWED_ORIGINS/);
  for (const origin of ['*', 'http://example.test', 'https://example.test/path', 'https://user@example.test']) {
    assert.throws(() => resolveRuntimeSecurity({ ...base, CORS_ALLOWED_ORIGINS: origin }), /CORS_ALLOWED_ORIGINS/);
  }
  assert.deepEqual(resolveRuntimeSecurity({ ...base, CORS_ALLOWED_ORIGINS: 'https://example.test, https://example.test' }).origins, ['https://example.test']);
});

test('development keeps local frontend origins', () => {
  assert.ok(resolveRuntimeSecurity({}).origins.includes('http://localhost:5173'));
});

test('administrator reset requires explicit valid credentials and rejects oversized bcrypt input', () => {
  assert.throws(() => resolveAdministratorReset({}), /ADMIN_RESET_EMAIL/);
  assert.throws(() => resolveAdministratorReset({ ADMIN_RESET_EMAIL: 'admin@example.test', ADMIN_RESET_PASSWORD: 'short' }), /ADMIN_RESET_PASSWORD/);
  assert.throws(() => resolveAdministratorReset({ ADMIN_RESET_EMAIL: 'admin@example.test', ADMIN_RESET_PASSWORD: 'x'.repeat(73) }), /ADMIN_RESET_PASSWORD/);
  assert.equal(resolveAdministratorReset({ ADMIN_RESET_EMAIL: ' Admin@example.test ', ADMIN_RESET_PASSWORD: 'sample-test-only-password' }).email, 'admin@example.test');
});
