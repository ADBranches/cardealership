import configuration from '../config/exchangeRates.js';
import { exchangeRateRefreshWorker } from './exchangeRateRefreshWorker.js';
const attached = new WeakSet();

// Register synchronously after app.listen(), before the listening event fires.
export function attachExchangeRateWorker(server, { worker = exchangeRateRefreshWorker, enabled = configuration.provider !== 'disabled', logger = console } = {}) {
  if (!server || typeof server.once !== 'function' || typeof server.removeListener !== 'function' || typeof worker.start !== 'function' || typeof worker.tick !== 'function' || typeof worker.stop !== 'function' || typeof logger.warn !== 'function') throw new TypeError('Invalid exchange-rate worker lifecycle.');
  if (!enabled || attached.has(server)) return false;
  attached.add(server);
  const warn = () => { try { logger.warn('Exchange-rate refresh unavailable; the API will use only acceptable cached data.'); } catch { /* Logging cannot crash the API. */ } };
  let closed = false;
  const start = () => {
    worker.start();
    Promise.resolve().then(() => { if (!closed) return worker.tick(); }).catch(warn);
  };
  server.once('close', () => {
    closed = true;
    server.removeListener('listening', start);
    worker.stop();
    attached.delete(server);
  });
  if (server.listening) start();
  else server.once('listening', start);
  return true;
}
