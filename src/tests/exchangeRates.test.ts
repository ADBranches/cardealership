import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CURRENCY_PREFERENCE_KEY, formatVehiclePrice, isCurrency, parseRateSnapshot, readCurrencyPreference, requestRateSnapshot, saveCurrencyPreference, usableRate } from "../features/currency/exchangeRates.ts";

const now = Date.parse("2026-09-18T11:00:00.000Z");
const reference = {
  success: true, baseCurrency: "UGX", provider: "frankfurter", source: "reference_provider", freshness: "fresh",
  rates: { UGX: 1, USD: 0.00027, EUR: 0.00023, GBP: 0.0002, KES: 0.0348 },
  observedAt: "2026-09-17T00:00:00.000Z", retrievedAt: "2026-09-18T10:00:00.000Z", expiresAt: "2026-09-18T12:00:00.000Z", usableUntil: "2026-09-18T12:00:00.000Z",
};
const mock = { ...reference, provider: "mock", source: "mock_provider" };

test("allowlist accepts only explicitly supported display currencies", () => {
  for (const currency of ["UGX", "USD", "EUR", "GBP", "KES"]) assert.ok(isCurrency(currency));
  for (const invalid of ["usd", "USD/EUR", "__proto__", "JPY", null, 12]) assert.equal(isCurrency(invalid), false);
});

test("currency preference defaults to UGX and persists only the allowlisted display code", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.equal(readCurrencyPreference(storage), "UGX");
  saveCurrencyPreference(storage, "KES");
  assert.equal(values.get(CURRENCY_PREFERENCE_KEY), "KES");
  assert.equal(readCurrencyPreference(storage), "KES");
  values.set(CURRENCY_PREFERENCE_KEY, "invalid");
  assert.equal(readCurrencyPreference(storage), "UGX");
});

test("blocked browser storage cannot break the storefront", () => {
  const storage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(readCurrencyPreference(storage), "UGX"); assert.doesNotThrow(() => saveCurrencyPreference(storage, "USD"));
});

test("reference snapshot validates provenance, chronology and supported rate values", () => {
  const snapshot = parseRateSnapshot(reference, now);
  assert.equal(snapshot.provider, "frankfurter"); assert.equal(snapshot.observedAt, Date.parse(reference.observedAt));
  assert.equal(usableRate(snapshot, "USD", now), 0.00027);
  assert.ok(Object.isFrozen(snapshot.rates));
  assert.equal(snapshot.validUntil, now + 60_000);
});

test("synthetic rates are rejected unless explicitly allowed by development mode", () => {
  assert.throws(() => parseRateSnapshot(mock, now));
  assert.equal(parseRateSnapshot(mock, now, true).provider, "mock");
  assert.throws(() => parseRateSnapshot({ ...mock, source: "reference_provider" }, now, true));
});

test("invalid origins, base, freshness and malformed rates fail closed", () => {
  for (const payload of [null, {}, { ...reference, success: false }, { ...reference, baseCurrency: "USD" }, { ...reference, provider: "other" }, { ...reference, source: "mock_provider" }, { ...reference, freshness: "unavailable" }, { ...reference, freshness: "fallback" }, { ...reference, rates: { UGX: 0, USD: 1 } }, { ...reference, rates: { UGX: 1, USD: "1" } }, { ...reference, rates: { UGX: 1, USD: Infinity } }, { ...reference, rates: { UGX: 1, USD: -1 } }, { ...reference, rates: { UGX: 1, usd: 1 } }]) assert.throws(() => parseRateSnapshot(payload, now));
});

test("missing quote is unavailable; canonical UGX remains usable", () => {
  const snapshot = parseRateSnapshot({ ...reference, rates: { UGX: 1, USD: 0.00027 } }, now);
  assert.equal(usableRate(snapshot, "KES", now), null); assert.equal(usableRate(null, "UGX", now), 1);
});

test("expired, impossibly dated and future snapshots are rejected", () => {
  for (const overrides of [{ observedAt: "2026-02-30T00:00:00.000Z" }, { observedAt: "2026-09-10T00:00:00.000Z" }, { observedAt: "2026-09-18T11:00:00.000Z" }, { retrievedAt: "2026-09-18T11:02:00.000Z" }, { expiresAt: "2026-09-18T10:30:00.000Z" }]) assert.throws(() => parseRateSnapshot({ ...reference, ...overrides }, now));
});

test("server-approved stale fallback is bounded and expires locally", () => {
  const snapshot = parseRateSnapshot({ ...reference, source: "database_cache", freshness: "fallback", expiresAt: "2026-09-18T10:30:00.000Z" }, now);
  assert.equal(snapshot.freshness, "fallback");
  assert.equal(usableRate(snapshot, "USD", now), 0.00027);
  assert.equal(usableRate(snapshot, "USD", now + 60_000), null);
});

test("backend usability deadline is authoritative, including short fallback windows", () => {
  const snapshot = parseRateSnapshot({ ...reference, source: "database_cache", freshness: "fallback", expiresAt: "2026-09-18T10:30:00.000Z", usableUntil: "2026-09-18T11:00:01.000Z" }, now);
  assert.equal(usableRate(snapshot, "USD", now + 999), 0.00027);
  assert.equal(usableRate(snapshot, "USD", now + 1000), null);
  for (const usableUntil of [undefined, "2026-09-18T10:59:59.000Z", "2026-09-18T12:00:01.000Z"]) assert.throws(() => parseRateSnapshot({ ...reference, usableUntil }, now));
});

test("converted estimates preserve original UGX input and use the expected rate", () => {
  const car = Object.freeze({ price: 30_000_000 });
  assert.match(formatVehiclePrice(car.price, "UGX")!, /UGX\s+30,000,000/);
  assert.match(formatVehiclePrice(car.price, "USD", 0.00027)!, /USD\s+8,100/);
  assert.match(formatVehiclePrice(car.price, "KES", 0.0348)!, /KES\s+1,044,000/);
  assert.equal(car.price, 30_000_000);
});

test("invalid prices, missing rates and overflow cannot produce misleading estimates", () => {
  for (const value of [NaN, Infinity, 0, -1, Number.MAX_SAFE_INTEGER + 1]) assert.equal(formatVehiclePrice(value, "UGX"), null);
  for (const value of [null, 0, -1, Infinity, NaN, Number.MAX_SAFE_INTEGER]) assert.equal(formatVehiclePrice(30_000_000, "USD", value), null);
  assert.equal(formatVehiclePrice(30_000_000, "USD"), null);
});

test("API request uses only the configured API adapter, UGX base, no credentials or redirects", async () => {
  const controller = new AbortController();
  const snapshot = await requestRateSnapshot(async (path, init) => {
    assert.equal(path, "/api/exchange-rates?baseCurrency=UGX");
    assert.equal(init.method, "GET"); assert.equal(init.credentials, "omit"); assert.equal(init.cache, "no-store"); assert.equal(init.redirect, "error"); assert.equal(init.signal, controller.signal);
    return new Response(JSON.stringify(reference));
  }, controller.signal, false, () => now);
  assert.equal(snapshot.rates.USD, 0.00027);
});

test("HTTP errors, invalid JSON and aborted requests reject safely", async () => {
  const controller = new AbortController(); controller.abort();
  for (const fetcher of [async () => new Response(null, { status: 503 }), async () => new Response("invalid JSON"), async () => { throw controller.signal.reason; }]) await assert.rejects(requestRateSnapshot(fetcher, controller.signal, false, () => now));
});

test("storefront composition mounts shared provider and selectors without changing financing input", () => {
  const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.match(source("../main.tsx"), /<CurrencyProvider>\s*<App\s*\/>\s*<\/CurrencyProvider>/);
  assert.match(source("../features/cars/components/VehicleInventorySection.tsx"), /<CurrencySelector\s*\/>/);
  assert.match(source("../features/cars/components/VehicleCard.tsx"), /<CurrencyPrice amountUGX=\{vehicle.price\}/);
  const details = source("../pages/Cars/VehicleDetailsPage.tsx");
  assert.match(details, /<CurrencySelector\s*\/>/); assert.match(details, /amountUGX=\{car.price\}/); assert.match(details, /<FinancingQuoteFlow vehicle=\{car\}/);
});
