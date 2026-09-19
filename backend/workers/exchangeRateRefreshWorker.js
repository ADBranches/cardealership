import configuration from "../config/exchangeRates.js";
import {
  exchangeRateService,
} from "../services/exchangeRates/exchangeRateService.js";

export const createExchangeRateRefreshWorker = (
  options = {},
) => {
  const service = options.service || exchangeRateService;
  const intervalMs =
    options.intervalMs || configuration.refreshIntervalMs;
  const timers = options.timers || {
    setInterval,
    clearInterval,
  };

  if (
    !service ||
    typeof service.refreshRates !== "function"
  ) {
    throw new TypeError(
      "Exchange-rate service must implement refreshRates.",
    );
  }

  let timerHandle = null;
  let refreshInFlight = null;

  const tick = () => {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = Promise.resolve(
      service.refreshRates(),
    ).finally(() => {
      refreshInFlight = null;
    });

    return refreshInFlight;
  };

  const start = () => {
    if (timerHandle) return false;

    timerHandle = timers.setInterval(() => {
      void tick();
    }, intervalMs);

    if (typeof timerHandle.unref === "function") {
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
    tick,
    start,
    stop,
    isRunning: () => Boolean(timerHandle),
    isRefreshInFlight: () => Boolean(refreshInFlight),
  });
};

export const exchangeRateRefreshWorker =
  createExchangeRateRefreshWorker();
