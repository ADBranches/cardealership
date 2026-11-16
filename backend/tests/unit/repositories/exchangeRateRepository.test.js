import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createExchangeRateRepository, normalizeRates } from '../../../repositories/exchangeRateRepository.js';
import { createSnapshot } from '../../fixtures/exchangeRateFixtures.js';

function databaseFixture(t) {
  const raw = new DatabaseSync(':memory:');
  t.after(() => raw.close());
  return { raw, async query(sql, parameters = []) {
    const statement = raw.prepare(sql.replace(/\$\d+/g, '?'));
    return /^\s*SELECT/i.test(sql) || /\bRETURNING\b/i.test(sql)
      ? { rows: statement.all(...parameters) }
      : { rows: [], rowCount: statement.run(...parameters).changes };
  } };
}

test('repository accepts and persists a valid normalized snapshot', async t => {
  const db = databaseFixture(t);
  const repository = createExchangeRateRepository(db);
  const result = await repository.saveFreshSnapshot(createSnapshot({ baseCurrency: 'ugx', rates: { ugx: 1, usd: 0.00027 } }));
  assert.equal(result.baseCurrency, 'UGX');
  assert.equal(result.rates.USD, 0.00027);
  assert.equal(result.freshnessState, 'fresh');
  assert.equal(result.retrievedAt.toISOString(), '2026-09-18T10:00:00.000Z');
  assert.deepEqual(await repository.findLatestSnapshot('UGX'), result);
});

test('repository rejects empty rates and invalid snapshot metadata before accessing disk', async () => {
  const repository = createExchangeRateRepository({ query() { throw new Error('must not access database'); } });
  for (const overrides of [{ rates: {} }, { rates: { UGX: 2 } }, { provider: ' ' }, { expiresAt: 'invalid' }, { expiresAt: '2020-01-01' }]) {
    await assert.rejects(repository.saveFreshSnapshot(createSnapshot(overrides)), TypeError);
  }
});

test('rate normalization rejects zero, negative, infinite and non-numeric rates', () => {
  for (const invalidRate of [0, -1, Infinity, NaN, '1']) assert.throws(() => normalizeRates({ USD: invalidRate }), TypeError);
});

test('latest usable lookup excludes expired and future snapshots with deterministic sorting', async t => {
  const db = databaseFixture(t);
  const repository = createExchangeRateRepository(db);
  const first = await repository.saveFreshSnapshot(createSnapshot());
  const newestSameTime = await repository.saveFreshSnapshot(createSnapshot());
  await repository.saveFreshSnapshot(createSnapshot({ retrievedAt: '2026-09-18T13:00:00.000Z', expiresAt: '2026-09-18T15:00:00.000Z' }));
  assert.ok(newestSameTime.id > first.id);
  const usable = await repository.findLatestUsableSnapshot('ugx', new Date('2026-09-18T11:00:00Z'));
  assert.equal(usable.id, newestSameTime.id);
  assert.equal(await repository.findLatestUsableSnapshot('UGX', new Date('2026-09-18T12:00:00Z')), null);
  assert.equal(await repository.findLatestSnapshot('USD'), null);
});

test('schema creates both required lookup indexes once across concurrent lookups', async t => {
  const db = databaseFixture(t);
  const repository = createExchangeRateRepository(db);
  await Promise.all([repository.findLatestSnapshot('UGX'), repository.findLatestSnapshot('USD')]);
  const indexes = db.raw.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='exchange_rate_snapshots' ORDER BY name").all();
  assert.deepEqual(indexes.map(row => row.name), ['exchange_rate_expiry_lookup', 'exchange_rate_latest_snapshot']);
});

test('failed initialization is retryable and invalid database adapters are rejected', async () => {
  assert.throws(() => createExchangeRateRepository({}), TypeError);
  let attempts = 0;
  const repository = createExchangeRateRepository({ async query(sql) {
    if (sql.startsWith('CREATE TABLE') && ++attempts === 1) throw new Error('database temporarily unavailable');
    return { rows: [] };
  } });
  await assert.rejects(repository.findLatestSnapshot('UGX'), /temporarily unavailable/);
  assert.equal(await repository.findLatestSnapshot('UGX'), null);
  assert.equal(attempts, 2);
});

test('additive migration preserves old mock snapshots and stores reference observation dates', async t => {
  const db = databaseFixture(t);
  db.raw.exec(`CREATE TABLE exchange_rate_snapshots (id INTEGER PRIMARY KEY, base_currency TEXT, rates TEXT, provider TEXT, retrieved_at TEXT, expires_at TEXT);
    INSERT INTO exchange_rate_snapshots VALUES (1, 'UGX', '{"UGX":1}', 'mock', '2026-09-18T10:00:00.000Z', '2026-09-18T12:00:00.000Z');`);
  const repo = createExchangeRateRepository(db);
  const old = await repo.findLatestSnapshot('UGX');
  assert.equal(old.observedAt.toISOString(), old.retrievedAt.toISOString());
  const fresh = await repo.saveFreshSnapshot(createSnapshot({ provider: 'frankfurter', observedAt: '2026-09-17T00:00:00Z' }));
  assert.equal(fresh.observedAt.toISOString(), '2026-09-17T00:00:00.000Z');
  assert.deepEqual(await repo.findLatestSnapshot('UGX'), fresh);
  await assert.rejects(repo.saveFreshSnapshot(createSnapshot({ provider: 'frankfurter' })), /observation date/);
});
