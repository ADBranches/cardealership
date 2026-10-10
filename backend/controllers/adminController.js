// backend/controllers/adminController.js
import pool from '../config/db.js';

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
    try {
        const carsResult = await pool.query('SELECT COUNT(*) FROM cars');
        const usersResult = await pool.query('SELECT COUNT(*) FROM users');
        const bookingsResult = await pool.query('SELECT COUNT(*) FROM bookings');
        const pendingResult = await pool.query(
            "SELECT COUNT(*) FROM bookings WHERE status = 'pending'"
        );

        res.json({
            totalCars: parseInt(carsResult.rows[0].count),
            totalUsers: parseInt(usersResult.rows[0].count),
            totalBookings: parseInt(bookingsResult.rows[0].count),
            pendingBookings: parseInt(pendingResult.rows[0].count)
        });
    } catch (error) {
        console.error('Error getting admin stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all bookings (admin view)
export const getAllBookings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, 
                   u.name as user_name, 
                   u.email as user_email,
                   c.make, c.model, c.year
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN cars c ON b.car_id = c.id
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting all bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pending vehicle approvals
export const getPendingApprovals = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM cars WHERE status = 'pending' ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting pending vehicles:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve a vehicle listing
export const approveVehicle = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'UPDATE cars SET status = $1, approved_at = NOW() WHERE id = $2 RETURNING *',
            ['approved', id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error approving vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reject a vehicle listing
export const rejectVehicle = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE cars SET status = $1, rejection_reason = $2 WHERE id = $3 RETURNING *',
            ['rejected', reason, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error rejecting vehicle:', error);
        res.status(500).json({ message: 'Server error' });
    }
};