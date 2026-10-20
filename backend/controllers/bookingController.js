import db from '../config/db.js';
import { validateBookingRequest } from '../utils/validators.js';
import * as availabilityService from '../services/availabilityService.js';

export async function createBooking(req, res) {
  try {
    const { car_id, booking_date, time_slot, notes } = req.body;
    const user_id = req.user.id;

    const validation = validateBookingRequest({ car_id, booking_date, time_slot, notes });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const limitCheck = await availabilityService.checkUserBookingLimits(user_id);
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    const car = await db.query('SELECT id FROM cars WHERE id = ?', [car_id]);
    if (car.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const availability = await availabilityService.checkSlotAvailability(null, car_id, booking_date, time_slot);
    if (!availability.available) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked',
        conflict: availability.conflict
      });
    }

    const dup = await db.query(
      `SELECT id FROM bookings WHERE user_id = ? AND car_id = ? AND booking_date = ?
       AND status NOT IN ('cancelled','completed')`,
      [user_id, car_id, booking_date]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You already have a booking for this car on this date' });
    }

    const result = await db.query(
      `INSERT INTO bookings (user_id, car_id, booking_date, time_slot, notes, status)
       VALUES (?, ?, ?, ?, ?, 'pending')
       RETURNING *`,
      [user_id, car_id, booking_date, time_slot, notes || null]
    );

    res.status(201).json({ success: true, message: 'Booking created successfully!', booking: result.rows[0] });
  } catch (err) {
    console.error('createBooking error:', err.message);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}

export async function getAvailableSlots(req, res) {
  try {
    const { carId, date } = req.params;
    const availability = await availabilityService.getAvailableSlots(carId, date);
    res.json({ success: true, ...availability });
  } catch (err) {
    console.error('getAvailableSlots error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getWeeklyAvailability(req, res) {
  try {
    const { carId } = req.params;
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const availability = await availabilityService.getWeeklyAvailability(carId, startDate);
    res.json({ success: true, week: availability });
  } catch (err) {
    console.error('getWeeklyAvailability error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function checkAvailability(req, res) {
  try {
    const { car_id, booking_date, time_slot } = req.query;
    if (!car_id || !booking_date || !time_slot) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    const availability = await availabilityService.checkSlotAvailability(null, car_id, booking_date, time_slot);
    res.json({
      success: true,
      isAvailable: availability.available,
      car_id, booking_date, time_slot,
      message: availability.available ? 'Available' : 'Already booked'
    });
  } catch (err) {
    console.error('checkAvailability error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const result = await db.query(
      `UPDATE bookings SET status='cancelled', updated_at=CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ? AND status IN ('pending','confirmed')
       RETURNING *`,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking cancelled', booking: result.rows[0] });
  } catch (err) {
    console.error('cancelBooking error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getUserBookings(req, res) {
  try {
    const user_id = req.user.id;
    const result = await db.query(
      `SELECT b.*, c.name as car_name, c.brand
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [user_id]
    );
    res.json({ success: true, count: result.rows.length, bookings: result.rows });
  } catch (err) {
    console.error('getUserBookings error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}