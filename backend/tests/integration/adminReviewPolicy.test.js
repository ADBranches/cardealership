import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedBookingSources, validRecordId, validateAdminCarUpdate, canEditInventoryStatus } from '../../utils/adminReviewPolicy.js';

test('booking transitions reject reopening terminal states and skipping confirmation', () => {
  assert.deepEqual(allowedBookingSources('confirmed'), ['pending', 'confirmed']);
  assert.deepEqual(allowedBookingSources('completed'), ['confirmed', 'completed']);
  assert.deepEqual(allowedBookingSources('cancelled'), ['pending', 'confirmed', 'cancelled']);
  assert.deepEqual(allowedBookingSources('pending'), ['pending']);
  assert.equal(allowedBookingSources('__proto__'), null);
  assert.equal(allowedBookingSources('invalid'), null);
});

test('administrator edits reject invalid fields and identifiers', () => {
  for (const id of [0, -1, 'xyz', true, 1.5]) assert.equal(validRecordId(id), false);
  assert.equal(validRecordId('12'), true);
  for (const body of [{ price: -1 }, { year: 1700 }, { status: 'arbitrary' }, { name: '' }, { image_url: 'javascript:alert(1)' }, { owner_id: 1 }, [], null, {}]) {
    assert.ok(validateAdminCarUpdate(body).length, JSON.stringify(body));
  }
  assert.deepEqual(validateAdminCarUpdate({ name: 'Toyota', brand: 'Toyota', price: 15000, year: 2024, status: 'available', image_url: 'https://example.com/car.jpg' }), []);
});

test('generic inventory edits cannot approve, reject, or reopen sold listings', () => {
  assert.equal(canEditInventoryStatus('pending', 'Available'), false);
  assert.equal(canEditInventoryStatus('rejected', 'available'), false);
  assert.equal(canEditInventoryStatus('sold', 'Available'), false);
  assert.equal(canEditInventoryStatus('Available', 'rejected'), false);
  assert.equal(canEditInventoryStatus('Available', 'Sold'), true);
  assert.equal(canEditInventoryStatus('pending', 'pending'), true);
});
