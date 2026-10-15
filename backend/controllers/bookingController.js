// backend/controllers/bookingController.js
import pool from '../config/db.js';
import { validateBookingRequest } from '../utils/validators.js';
import * as availabilityService from '../services/availabilityService.js';

export const createBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const { car_id, booking_date, time_slot, notes } = req.body;
    const user_id = req.user?.id || 1;

    const validation = validateBookingRequest({ car_id, booking_date, time_slot, notes });
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const limitCheck = await availabilityService.checkUserBookingLimits(user_id);
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    await client.query('BEGIN');

    const carCheck = await client.query('SELECT id FROM cars WHERE id = $1', [car_id]);
    if (carCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const availability = await availabilityService.checkSlotAvailability(client, car_id, booking_date, time_slot);
    if (!availability.available) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked',
        conflict: availability.conflict
      });
    }

    const duplicateCheck = await client.query(
      `SELECT id FROM bookings WHERE user_id = $1 AND car_id = $2 AND booking_date = $3
       AND status NOT IN ('cancelled', 'completed')`,
      [user_id, car_id, booking_date]
    );
    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'You already have a booking for this car on this date' });
    }

    const result = await client.query(
      `INSERT INTO bookings (user_id, car_id, booking_date, time_slot, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [user_id, car_id, booking_date, time_slot, notes || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Booking created successfully!', booking: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  } finally {
    client.release();
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { carId, date } = req.params;
    const availability = await availabilityService.getAvailableSlots(carId, date);
    res.json({ success: true, ...availability });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getWeeklyAvailability = async (req, res) => {
  try {
    const { carId } = req.params;
    const startDate = req.query.startDate || new Date().toISOString().split('T')[0];
    const availability = await availabilityService.getWeeklyAvailability(carId, startDate);
    res.json({ success: true, week: availability });
  } catch (error) {
    console.error('Error getting weekly availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { car_id, booking_date, time_slot } = req.query;
    if (!car_id || !booking_date || !time_slot) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
    const client = await pool.connect();
    try {
      const availability = await availabilityService.checkSlotAvailability(client, car_id, booking_date, time_slot);
      res.json({
        success: true,
        isAvailable: availability.available,
        car_id, booking_date, time_slot,
        message: availability.available ? 'Available' : 'Already booked'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id || 1;
    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed') RETURNING *`,
      [id, user_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking cancelled', booking: result.rows[0] });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user?.id || 1;
    const result = await pool.query(
      `SELECT b.*, c.name as car_name, c.brand FROM bookings b
       JOIN cars c ON b.car_id = c.id WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
      [user_id]
    );
    res.json({ success: true, count: result.rows.length, bookings: result.rows });
  } catch (error) {
    console.error('Error getting user bookings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};