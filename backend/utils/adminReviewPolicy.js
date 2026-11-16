import { validateCarUpdatePayloadContract } from '../middleware/validateCarPayload.js';

// Include the destination itself to make retries idempotent.
const bookingSources = Object.freeze({
  pending: ['pending'],
  confirmed: ['pending', 'confirmed'],
  completed: ['confirmed', 'completed'],
  cancelled: ['pending', 'confirmed', 'cancelled'],
});

export function allowedBookingSources(status) {
  return typeof status === 'string' && Object.hasOwn(bookingSources, status)
    ? bookingSources[status] : null;
}

export function validRecordId(id) {
  return (typeof id === 'number' || typeof id === 'string') &&
    /^\d+$/.test(String(id)) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
}

const legacyFields = new Set(['name', 'brand', 'price', 'year', 'status', 'description', 'image_url']);
const inventoryStatuses = new Set(['available', 'sold', 'pending', 'rejected', 'reserved', 'pending test drive']);

export function validateAdminCarUpdate(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return ['A vehicle update object is required.'];
  const errors = [];
  const entries = Object.entries(payload);
  if (!entries.length) errors.push('At least one vehicle field is required.');
  const canonical = {};
  for (const [field, value] of entries) {
    if (!legacyFields.has(field)) { errors.push(`Unsupported update field: ${field}.`); continue; }
    if (['name', 'price', 'year', 'description'].includes(field)) canonical[field] = value;
    if (field === 'brand' && (typeof value !== 'string' || !value.trim() || /<script|javascript:/i.test(value))) errors.push('Brand must be valid text.');
    if (field === 'status' && (typeof value !== 'string' || !inventoryStatuses.has(value.toLowerCase()))) errors.push('Invalid vehicle status.');
    if (field === 'image_url' && value !== null) {
      if (typeof value !== 'string' || !/^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i.test(value)) errors.push('Invalid image URL.');
    }
  }
  if (Object.keys(canonical).length) errors.push(...validateCarUpdatePayloadContract(canonical).errors);
  return errors;
}

export function canEditInventoryStatus(current, requested) {
  const from = String(current).toLowerCase();
  const to = String(requested).toLowerCase();
  if (from === to) return true;
  // Listing approval/rejection must use dedicated review actions.
  if (['pending', 'rejected', 'sold'].includes(from) || ['pending', 'rejected'].includes(to)) return false;
  return inventoryStatuses.has(from) && inventoryStatuses.has(to);
}
