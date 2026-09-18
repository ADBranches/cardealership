"use strict";

const configuration = require("../config/exchangeRates");

const createExchangeRateRefreshWorker = (options = {}) => {
  const service = options.service;
  const intervalMs = options.intervalMs || configuration.refreshIntervalMs;
  const baseCurrency = options.baseCurrency || configuration.baseCurrency;
  const timers = options.timers || Object.freeze({ setInterval, clearInterval });

  if (!service || typeof service.refreshRates !== "function") {
    throw new TypeError("Worker service must implement refreshRates.");
  }

  let timerHandle = null;
  let refreshPromise = null;

  const tick = () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = Promise.resolve()
      .then(() => service.refreshRates(baseCurrency))
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  };

  const start = () => {
    if (timerHandle) return false;

    timerHandle = timers.setInterval(() => {
      tick().catch(() => undefined);
    }, intervalMs);

    if (timerHandle && typeof timerHandle.unref === "function") {
      timerHandle.unref();
    }

    return true;
  };

  const stop = () => {
    if (!timerHandle) return false;
    timers.clearInterval(timerHandle);
    timerHandle = null;
    return true;
  };

  return Object.freeze({
    start,
    stop,
    tick,
    isRunning: () => timerHandle !== null,
    isRefreshInFlight: () => refreshPromise !== null
  });
};

module.exports = Object.freeze({
  createExchangeRateRefreshWorker
});
