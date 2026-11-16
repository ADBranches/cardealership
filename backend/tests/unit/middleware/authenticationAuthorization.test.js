import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../../../config/db.js';
import { signToken } from '../../../utils/jwt.js';
import { authenticateToken, isAdmin, protect, adminOnly } from '../../../middleware/authMiddleware.js';

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('canonical middleware aliases share one implementation', () => {
  assert.equal(protect, authenticateToken);
  assert.equal(adminOnly, isAdmin);
});

test('missing bearer token is rejected', async () => {
  const res = response();
  await authenticateToken({ headers: {} }, res, () => assert.fail('unexpected next'));
  assert.equal(res.statusCode, 401);
});

test('database role overrides stale admin token claims', async (t) => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'integration-review-test-secret';
  t.after(() => {
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
  });
  t.mock.method(db, 'query', async () => ({ rows: [{ id: 7, role: 'user' }] }));
  const req = { headers: { authorization: `Bearer ${signToken({ id: 7, role: 'admin' })}` } };
  const res = response();
  let nextCalls = 0;
  await authenticateToken(req, res, () => { nextCalls++; });
  assert.equal(nextCalls, 1);
  assert.equal(req.user.role, 'user');
  isAdmin(req, res, () => assert.fail('stale admin claim authorized'));
  assert.equal(res.statusCode, 403);
});

test('canonical admin role is authorized', () => {
  let calls = 0;
  isAdmin({ user: { role: 'admin' } }, response(), () => { calls++; });
  assert.equal(calls, 1);
});
