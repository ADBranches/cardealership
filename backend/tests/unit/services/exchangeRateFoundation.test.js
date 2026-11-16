import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolveExchangeRateConfig } from '../../../config/exchangeRates.js';
import { createExchangeRateProvider } from '../../../services/exchangeRates/exchangeRateProvider.js';
import { createMockExchangeRateProvider } from '../../../services/exchangeRates/mockExchangeRateProvider.js';
import { normalizeExchangeRates, normalizeRates } from '../../../services/exchangeRates/normalizeExchangeRates.js';
import { EXCHANGE_RATE_ERROR_CODES as codes } from '../../../contracts/exchangeRate.contract.js';

const fixed = '2026-09-18T10:00:00.000Z';
const response = { baseCurrency: 'UGX', provider: 'mock', rates: { UGX: 1, USD: 0.00027 }, retrievedAt: fixed };

test('configuration normalizes and deduplicates currencies and rejects unsafe values', () => {
  const config = resolveExchangeRateConfig({ EXCHANGE_RATE_BASE_CURRENCY: ' ugx ', EXCHANGE_RATE_SUPPORTED_CURRENCIES: 'UGX,usd,USD' });
  assert.equal(config.baseCurrency, 'UGX');
  assert.deepEqual(config.supportedCurrencies, ['UGX', 'USD']);
  assert.ok(Object.isFrozen(config.supportedCurrencies));
  assert.throws(() => resolveExchangeRateConfig({ EXCHANGE_RATE_CACHE_TTL_MS: '5000abc' }));
  assert.throws(() => resolveExchangeRateConfig({ EXCHANGE_RATE_SUPPORTED_CURRENCIES: 'USD' }));
  assert.throws(() => resolveExchangeRateConfig({ EXCHANGE_RATE_PROVIDER: 'unapproved' }));
});

test('production defaults to disabled and refuses mock configuration and direct construction', () => {
  assert.equal(resolveExchangeRateConfig({ NODE_ENV: 'production' }).provider, 'disabled');
  assert.throws(() => resolveExchangeRateConfig({ NODE_ENV: 'production', EXCHANGE_RATE_PROVIDER: 'mock' }), /prohibited/);
  const moduleUrl = new URL('../../../services/exchangeRates/mockExchangeRateProvider.js', import.meta.url).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import { createMockExchangeRateProvider } from ${JSON.stringify(moduleUrl)}; createMockExchangeRateProvider();`], {
    env: { PATH: process.env.PATH, NODE_ENV: 'production', EXCHANGE_RATE_PROVIDER: 'disabled' }, encoding: 'utf8',
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Synthetic exchange rates are prohibited in production/);
});

test('provider contract rejects invalid adapters', () => {
  assert.throws(() => createExchangeRateProvider({}));
  const provider = { fetchRates() {} };
  assert.equal(createExchangeRateProvider(provider), provider);
});

test('rate normalization rejects duplicate normalized codes and non-plain data', () => {
  assert.throws(() => normalizeRates({ usd: 1, USD: 2 }), /Duplicate currency/);
  assert.throws(() => normalizeRates(new Date()));
  assert.throws(() => normalizeRates({ USD: '1' }));
  assert.deepEqual(normalizeRates(new Map([['usd', 1]])), { USD: 1 });
});

test('normalization validates requested currency, timestamps, provider and cache expiry', () => {
  assert.throws(() => normalizeExchangeRates(response, { cacheTtlMs: 1000, expectedBaseCurrency: 'USD' }), { code: codes.INVALID_BASE_CURRENCY });
  for (const retrievedAt of [null, 'invalid-date', '']) assert.throws(() => normalizeExchangeRates({ ...response, retrievedAt }, { cacheTtlMs: 1000 }));
  assert.throws(() => normalizeExchangeRates({ ...response, provider: ' ' }, { cacheTtlMs: 1000 }));
  for (const cacheTtlMs of [0, -1, Infinity, '1000', 1.5]) assert.throws(() => normalizeExchangeRates(response, { cacheTtlMs }));
  assert.equal(normalizeExchangeRates(response, { cacheTtlMs: 1000 }).expiresAt.toISOString(), '2026-09-18T10:00:01.000Z');
});

test('mock provider correctly rebases rates and rejects unsupported currencies', async () => {
  const provider = createMockExchangeRateProvider({ now: () => new Date(fixed) });
  const result = await provider.fetchRates('USD');
  assert.equal(result.rates.USD, 1);
  assert.equal(result.rates.UGX, 1 / 0.00027);
  assert.equal(result.baseCurrency, 'USD');
  assert.equal(result.provider, 'mock');
  await assert.rejects(provider.fetchRates('JPY'), { code: codes.INVALID_BASE_CURRENCY });
});
