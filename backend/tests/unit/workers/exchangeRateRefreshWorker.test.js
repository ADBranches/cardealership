import test from 'node:test';
import assert from 'node:assert/strict';
import { createExchangeRateRefreshWorker } from '../../../workers/exchangeRateRefreshWorker.js';

test("worker starts and stops without leaving an active timer", () => {
  const activity = { cleared: false, unreferenced: false };
  const timerHandle = {
    unref() {
      activity.unreferenced = true;
    }
  };
  const worker = createExchangeRateRefreshWorker({
    service: { refreshRates: async () => ({}) },
    timers: {
      setInterval: () => timerHandle,
      clearInterval: (handle) => {
        activity.cleared = handle === timerHandle;
      }
    }
  });

  assert.equal(worker.start(), true);
  assert.equal(worker.start(), false);
  assert.equal(worker.isRunning(), true);
  assert.equal(activity.unreferenced, true);
  assert.equal(worker.stop(), true);
  assert.equal(worker.isRunning(), false);
  assert.equal(activity.cleared, true);
});

test("concurrent ticks share one refresh execution", async () => {
  let refreshCalls = 0;
  let releaseRefresh;
  const pendingRefresh = new Promise((resolve) => {
    releaseRefresh = resolve;
  });
  const worker = createExchangeRateRefreshWorker({
    service: {
      refreshRates: async () => {
        refreshCalls += 1;
        await pendingRefresh;
        return {};
      }
    }
  });

  const firstTick = worker.tick();
  const secondTick = worker.tick();
  assert.equal(firstTick, secondTick);
  await Promise.resolve();
  assert.equal(refreshCalls, 1);
  releaseRefresh();
  await firstTick;
  assert.equal(worker.isRefreshInFlight(), false);
});

test('worker catches synchronous and asynchronous refresh failures and can retry', async () => {
  let count = 0;
  const worker = createExchangeRateRefreshWorker({ service: { refreshRates() { if (++count === 1) throw new Error('temporary failure'); return Promise.resolve('recovered'); } } });
  await assert.rejects(worker.tick(), /temporary failure/);
  assert.equal(worker.isRefreshInFlight(), false);
  assert.equal(await worker.tick(), 'recovered');
});
