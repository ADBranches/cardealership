import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { attachExchangeRateWorker } from '../../../workers/exchangeRateWorkerLifecycle.js';

function fixture() {
  const server = new EventEmitter();
  const calls = { start: 0, tick: 0, stop: 0, warnings: 0 };
  const worker = { start() { calls.start++; }, async tick() { calls.tick++; throw new Error('private provider information'); }, stop() { calls.stop++; } };
  const logger = { warn(message) { calls.warnings++; assert.doesNotMatch(message, /private provider information/); } };
  return { server, worker, logger, calls };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('worker starts only when listening, immediately refreshes, handles errors, stops on close', async () => {
  const f = fixture();
  assert.equal(attachExchangeRateWorker(f.server, { ...f, enabled: true }), true);
  assert.equal(attachExchangeRateWorker(f.server, { ...f, enabled: true }), false);
  assert.equal(f.calls.start, 0);
  f.server.emit('listening');
  await settle();
  assert.deepEqual(f.calls, { start: 1, tick: 1, stop: 0, warnings: 1 });
  f.server.emit('close');
  assert.equal(f.calls.stop, 1);
});

test('disabled provider never starts or refreshes the worker', async () => {
  const f = fixture();
  assert.equal(attachExchangeRateWorker(f.server, { ...f, enabled: false }), false);
  f.server.emit('listening'); f.server.emit('close');
  await settle();
  assert.deepEqual(f.calls, { start: 0, tick: 0, stop: 0, warnings: 0 });
});

test('closing before listening prevents scheduling or a delayed refresh', async () => {
  const f = fixture();
  attachExchangeRateWorker(f.server, { ...f, enabled: true });
  f.server.emit('close'); f.server.emit('listening');
  await settle();
  assert.equal(f.calls.start, 0); assert.equal(f.calls.tick, 0);
});
