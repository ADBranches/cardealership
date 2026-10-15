// backend/utils/validators.js
const BUSINESS_HOURS = { start: 9, end: 18, days: [1, 2, 3, 4, 5, 6] };
export const VALID_TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

export function validateBookingDate(dateString) {
  const errors = [];
  if (!dateString) { errors.push('Booking date is required'); return { valid: false, errors }; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) { errors.push('Date must be YYYY-MM-DD'); return { valid: false, errors }; }
  const bookingDate = new Date(dateString);
  const today = new Date(); today.setHours(0,0,0,0);
  if (isNaN(bookingDate.getTime())) { errors.push('Invalid date'); return { valid: false, errors }; }
  if (bookingDate < today) errors.push('Cannot book a past date');
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 60);
  if (bookingDate > maxDate) errors.push('Max 60 days in advance');
  if (!BUSINESS_HOURS.days.includes(bookingDate.getDay())) errors.push('Mon-Sat only');
  return { valid: errors.length === 0, errors };
}

export function validateTimeSlot(timeSlot) {
  const errors = [];
  if (!timeSlot) errors.push('Time slot is required');
  else if (!VALID_TIME_SLOTS.includes(timeSlot)) errors.push('Invalid time slot');
  return { valid: errors.length === 0, errors };
}

export function validateCarId(carId) {
  const errors = [];
  if (!carId) errors.push('Car ID is required');
  else if (isNaN(parseInt(carId))) errors.push('Car ID must be a number');
  return { valid: errors.length === 0, errors };
}

export function validateBookingRequest(data) {
  const errors = [];
  errors.push(...validateBookingDate(data.booking_date).errors);
  errors.push(...validateTimeSlot(data.time_slot).errors);
  errors.push(...validateCarId(data.car_id).errors);
  if (data.notes && data.notes.length > 500) errors.push('Notes max 500 chars');
  return { valid: errors.length === 0, errors };
}

export { BUSINESS_HOURS };