import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { createExchangeRateRepository } from "../../backend/repositories/exchangeRateRepository.js";
import { createExchangeRateService } from "../../backend/services/exchangeRates/exchangeRateService.js";
import { createFrankfurterProvider } from "../../backend/services/exchangeRates/frankfurterProvider.js";
import { createExchangeRateRouter } from "../../backend/routes/exchangeRateRoutes.js";
import { formatVehiclePrice, requestRateSnapshot, usableRate } from "../features/currency/exchangeRates.ts";

const require = createRequire(new URL("../../backend/package.json", import.meta.url));
const express = require("express");

test("provider → SQLite → HTTP → storefront: conversion, cache, fallback and expiration", async t => {
  const database = new DatabaseSync(":memory:");
  t.after(() => database.close());
  const repository = createExchangeRateRepository({ async query(sql: string, params: (string | number)[] = []) {
    const statement = database.prepare(sql.replace(/\$\d+/g, "?"));
    return /^\s*SELECT/i.test(sql) || /\bRETURNING\b/i.test(sql)
      ? { rows: statement.all(...params) }
      : { rows: [], rowCount: statement.run(...params).changes };
  } });
  let time = Date.parse("2026-09-18T10:00:00.000Z"), requests = 0, offline = false;
  const now = () => new Date(time);
  const provider = createFrankfurterProvider({ supportedCurrencies: ["UGX", "USD"], now, fetchImpl: async () => {
    requests++;
    if (offline) throw new Error("provider unavailable");
    return new Response(JSON.stringify([{ base: "UGX", quote: "USD", rate: 0.00027, date: "2026-09-17" }]));
  } });
  const service = createExchangeRateService({ provider, repository, now, config: { provider: "frankfurter", supportedCurrencies: ["UGX", "USD"], cacheTtlMs: 1000, maxStaleMs: 2000, retryBackoffMs: 1000 } });
  const app = express();
  app.use("/api/exchange-rates", createExchangeRateRouter(service));
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise<void>(resolve => { server.close(() => resolve()); server.closeAllConnections(); }));
  await new Promise<void>((resolve, reject) => { server.once("listening", resolve); server.once("error", reject); });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const fetcher = (path: string, init: RequestInit) => fetch(`http://127.0.0.1:${address.port}${path}`, init);
  const getRates = () => requestRateSnapshot(fetcher, new AbortController().signal, false, () => time);
  const vehicle = Object.freeze({ price: 30_000_000 });

  const fresh = await getRates();
  assert.equal(fresh.source, "reference_provider");
  assert.match(formatVehiclePrice(vehicle.price, "USD", usableRate(fresh, "USD", time))!, /USD\s+8,100/);
  assert.equal(requests, 1);
  assert.equal((await repository.findLatestSnapshot("UGX")).provider, "frankfurter");
  assert.equal((await getRates()).source, "database_cache");
  assert.equal(requests, 1);

  time += 1500; offline = true;
  const fallback = await getRates();
  assert.equal(fallback.freshness, "fallback");
  assert.equal(fallback.source, "database_cache");
  assert.equal(requests, 2);

  time += 2000;
  await assert.rejects(getRates(), /unavailable/i);
  assert.equal(formatVehiclePrice(vehicle.price, "USD", usableRate(fallback, "USD", time)), null);
  assert.match(formatVehiclePrice(vehicle.price, "UGX")!, /UGX\s+30,000,000/);
  assert.equal(vehicle.price, 30_000_000);
});
