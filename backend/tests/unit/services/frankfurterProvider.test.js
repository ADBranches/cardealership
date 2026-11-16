import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrankfurterProvider } from '../../../services/exchangeRates/frankfurterProvider.js';
import { EXCHANGE_RATE_ERROR_CODES as codes } from '../../../contracts/exchangeRate.contract.js';

const now = () => new Date('2026-09-18T10:00:00Z');
const rows = [{ base: 'UGX', quote: 'USD', date: '2026-09-17', rate: 0.00027 }, { base: 'UGX', quote: 'KES', date: '2026-09-18', rate: 0.0348 }];
const provider = fetchImpl => createFrankfurterProvider({ supportedCurrencies: ['UGX', 'USD', 'KES'], now, fetchImpl, requestTimeoutMs: 30 });
const json = value => new Response(JSON.stringify(value));

test('fixed HTTPS endpoint and exact quote set; oldest observed date remains distinct from retrieval', async () => {
  const result = await provider(async (url, options) => {
    assert.equal(url.origin, 'https://api.frankfurter.dev');
    assert.equal(url.pathname, '/v2/rates');
    assert.equal(url.searchParams.get('base'), 'UGX');
    assert.equal(url.searchParams.get('quotes'), 'USD,KES');
    assert.equal(options.redirect, 'error');
    return json(rows);
  }).fetchRates('ugx');
  assert.deepEqual(result.rates, { UGX: 1, USD: 0.00027, KES: 0.0348 });
  assert.equal(result.observedAt, '2026-09-17T00:00:00.000Z');
  assert.equal(result.retrievedAt, now().toISOString());
});

test('incomplete, duplicate, unexpected, wrong-base and invalid numeric rows are rejected', async () => {
  for (const invalid of [[], [rows[0]], [rows[0], rows[0]], [rows[0], { ...rows[1], quote: 'GBP' }], [rows[0], { ...rows[1], base: 'USD' }], [rows[0], { ...rows[1], rate: 0 }], [rows[0], { ...rows[1], rate: '1' }]]) {
    await assert.rejects(provider(async () => json(invalid)).fetchRates('UGX'), { code: codes.MALFORMED_RESPONSE });
  }
});

test('impossible and future observation dates are rejected', async () => {
  for (const date of ['2026-02-30', '2026-09-19', '2026-9-17', null]) await assert.rejects(provider(async () => json([{ ...rows[0], date }, rows[1]])).fetchRates('UGX'), { code: codes.MALFORMED_RESPONSE });
});

test('malformed JSON and oversized body are rejected', async () => {
  for (const body of ['{', 'x'.repeat(65_537)]) await assert.rejects(provider(async () => new Response(body)).fetchRates('UGX'), { code: codes.MALFORMED_RESPONSE });
});

test('provider rejects unsupported base without contacting network', async () => {
  await assert.rejects(provider(async () => assert.fail('network call')).fetchRates('JPY'), { code: codes.INVALID_BASE_CURRENCY });
});

test('HTTP failures and network failures expose stable sanitized codes', async () => {
  await assert.rejects(provider(async () => new Response(null, { status: 429 })).fetchRates('UGX'), { code: codes.PROVIDER_RATE_LIMITED });
  await assert.rejects(provider(async () => new Response(null, { status: 503 })).fetchRates('UGX'), { code: codes.PROVIDER_UNAVAILABLE });
  await assert.rejects(provider(async () => { throw new Error('private network detail'); }).fetchRates('UGX'), { code: codes.PROVIDER_UNAVAILABLE, message: 'Reference provider unavailable.' });
});

test('timeout aborts the fetch', async () => {
  await assert.rejects(provider(async (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))).fetchRates('UGX'), { code: codes.PROVIDER_TIMEOUT });
});
