// backend/controllers/bookingController.js
import pool from '../config/db.js';

// Create a new booking
export const createBooking = async (req, res) => {
    const { car_id, booking_date, time_slot, notes } = req.body;
    const user_id = req.user.id;
    
    try {
        // Check if car exists and is available
        const carCheck = await pool.query(
            'SELECT * FROM cars WHERE id = $1 AND status = $2',
            [car_id, 'available']
        );
        
        if (carCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Car not available for booking' });
        }
        
        // Check for conflicting bookings
        const conflictCheck = await pool.query(
            `SELECT * FROM bookings 
             WHERE car_id = $1 
             AND booking_date = $2 
             AND time_slot = $3 
             AND status != 'cancelled'`,
            [car_id, booking_date, time_slot]
        );
        
        if (conflictCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Time slot already booked' });
        }
        
        // Create booking
        const result = await pool.query(
            `INSERT INTO bookings (user_id, car_id, booking_date, time_slot, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [user_id, car_id, booking_date, time_slot, notes, 'pending']
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
    const user_id = req.user.id;
    
    try {
        const result = await pool.query(`
            SELECT b.*, 
                   c.make, c.model, c.year, c.price, c.image_url
            FROM bookings b
            JOIN cars c ON b.car_id = c.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `, [user_id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting user bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    try {
        const query = isAdmin
            ? 'SELECT * FROM bookings WHERE id = $1'
            : 'SELECT * FROM bookings WHERE id = $1 AND user_id = $2';
        
        const params = isAdmin ? [id] : [id, user_id];
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update booking
export const updateBooking = async (req, res) => {
    const { id } = req.params;
    const { booking_date, time_slot, notes } = req.body;
    const user_id = req.user.id;
    
    try {
        const result = await pool.query(
            `UPDATE bookings 
             SET booking_date = COALESCE($1, booking_date),
                 time_slot = COALESCE($2, time_slot),
                 notes = COALESCE($3, notes),
                 updated_at = NOW()
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [booking_date, time_slot, notes, id, user_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
    
    try {
        const result = await pool.query(
            'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
            ['cancelled', id, user_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json({ message: 'Booking cancelled successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};