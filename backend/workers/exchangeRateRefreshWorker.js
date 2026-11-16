import configuration from '../config/exchangeRates.js';
import { exchangeRateService } from '../services/exchangeRates/exchangeRateService.js';

export function createExchangeRateRefreshWorker(options = {}) {
  const service = options.service ?? exchangeRateService;
  const intervalMs = options.intervalMs ?? configuration.refreshIntervalMs;
  const baseCurrency = options.baseCurrency ?? configuration.baseCurrency;
  const timers = options.timers ?? { setInterval, clearInterval };
  const onError = options.onError ?? (() => console.warn('Scheduled exchange-rate refresh unavailable.'));
  if (typeof service.refreshRates !== 'function' || !Number.isSafeInteger(intervalMs) || intervalMs <= 0 || intervalMs > 2_147_483_647) throw new TypeError('Invalid exchange-rate worker configuration.');
  if (typeof timers.setInterval !== 'function' || typeof timers.clearInterval !== 'function' || typeof onError !== 'function') throw new TypeError('Invalid worker timers or error handler.');
  let timerHandle = null;
  let pending = null;
  function tick() {
    if (pending) return pending;
    let result;
    try { result = service.refreshRates(baseCurrency); } catch (error) { result = Promise.reject(error); }
    pending = Promise.resolve(result).finally(() => { pending = null; });
    return pending;
  }
  function start() {
    if (timerHandle !== null) return false;
    timerHandle = timers.setInterval(() => { tick().catch(() => { try { onError(); } catch { /* Logging cannot break refresh scheduling. */ } }); }, intervalMs);
    timerHandle?.unref?.();
    return true;
  }
  function stop() {
    if (timerHandle === null) return false;
    timers.clearInterval(timerHandle);
    timerHandle = null;
    return true;
  }
  return Object.freeze({ tick, start, stop, isRunning: () => timerHandle !== null, isRefreshInFlight: () => pending !== null });
}

export const exchangeRateRefreshWorker = createExchangeRateRefreshWorker();
