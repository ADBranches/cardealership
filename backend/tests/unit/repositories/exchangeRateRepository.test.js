"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const ExchangeRateSnapshot = require("../../../models/ExchangeRateSnapshot");
const { createExchangeRateRepository, normalizeRates } = require("../../../repositories/exchangeRateRepository");

const createQuery = (result, activity) => ({
  sort(sortDefinition) {
    activity.sortDefinition = sortDefinition;
    return this;
  },
  lean() {
    activity.leanCalled = true;
    return this;
  },
  async exec() {
    activity.execCalled = true;
    return result;
  }
});

test("model accepts a valid normalized snapshot", () => {
  const snapshot = new ExchangeRateSnapshot({
    baseCurrency: "UGX",
    rates: { UGX: 1, USD: 0.00027 },
    provider: "mock",
    retrievedAt: new Date("2026-09-18T10:00:00.000Z"),
    expiresAt: new Date("2026-09-18T12:00:00.000Z"),
    freshnessState: "fresh"
  });
  assert.equal(snapshot.validateSync(), undefined);
});

test("model rejects an empty rate map", () => {
  const snapshot = new ExchangeRateSnapshot({
    baseCurrency: "UGX",
    rates: {},
    provider: "mock",
    retrievedAt: new Date("2026-09-18T10:00:00.000Z"),
    expiresAt: new Date("2026-09-18T12:00:00.000Z"),
    freshnessState: "fresh"
  });
  assert.ok(snapshot.validateSync());
});

test("rate normalization rejects zero, negative, infinite, and non-numeric rates", () => {
  for (const invalidRate of [0, -1, Infinity, NaN, "1"]) {
    assert.throws(() => normalizeRates({ USD: invalidRate }), TypeError);
  }
});

test("repository saves a normalized fresh snapshot", async () => {
  const activity = {};
  const fakeModel = {
    async create(payload) {
      activity.createdPayload = payload;
      return payload;
    },
    findOne() {
      return createQuery(null, activity);
    }
  };
  const repository = createExchangeRateRepository(fakeModel);
  const result = await repository.saveFreshSnapshot({
    baseCurrency: "ugx",
    rates: { ugx: 1, usd: 0.00027 },
    provider: "mock",
    retrievedAt: "2026-09-18T10:00:00.000Z",
    expiresAt: "2026-09-18T12:00:00.000Z"
  });
  assert.equal(result.baseCurrency, "UGX");
  assert.equal(result.rates.USD, 0.00027);
  assert.equal(result.freshnessState, "fresh");
});

test("latest usable lookup applies deterministic sorting", async () => {
  const activity = {};
  const expectedSnapshot = { baseCurrency: "UGX", provider: "mock" };
  const fakeModel = {
    async create(payload) {
      return payload;
    },
    findOne(filter) {
      activity.filter = filter;
      return createQuery(expectedSnapshot, activity);
    }
  };
  const repository = createExchangeRateRepository(fakeModel);
  const result = await repository.findLatestUsableSnapshot("ugx", new Date("2026-09-18T11:00:00.000Z"));
  assert.deepEqual(activity.filter, { baseCurrency: "UGX", expiresAt: { $gt: new Date("2026-09-18T11:00:00.000Z") } });
  assert.deepEqual(activity.sortDefinition, { retrievedAt: -1, _id: -1 });
  assert.equal(activity.leanCalled, true);
  assert.equal(activity.execCalled, true);
  assert.deepEqual(result, expectedSnapshot);
});

test("model registers only the required exchange-rate indexes", () => {
  const indexNames = ExchangeRateSnapshot.schema.indexes().map((indexDefinition) => indexDefinition[1].name).sort();
  assert.deepEqual(indexNames, ["exchange_rate_expiry_lookup", "exchange_rate_latest_snapshot"]);
});
