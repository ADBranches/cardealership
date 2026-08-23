import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// TIME SLOTS
const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
];

// POST /api/bookings/create - Book a test drive
router.post('/create', async (req, res) => {
    try {
        const {
            user_id,
            car_id,
            car_model,
            date,
            time_slot,
            user_name,
            user_email,
            user_phone
        } = req.body;

        // Validation
        if (!user_id || !car_id || !date || !time_slot) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['user_id', 'car_id', 'date', 'time_slot']
            });
        }

        // Check if time slot is valid
        if (!TIME_SLOTS.includes(time_slot)) {
            return res.status(400).json({
                error: 'Invalid time slot',
                availableSlots: TIME_SLOTS
            });
        }

        // Check if already booked
        const existingBooking = await db.collection('bookings').findOne({
            carId: parseInt(car_id),
            date: date,
            timeSlot: time_slot,
            status: { $ne: 'cancelled' }
        });

        if (existingBooking) {
            return res.status(409).json({
                error: 'Time slot already booked for this car',
                conflict: true,
                bookedBy: existingBooking.user_name
            });
        }

        // Create booking
        const newBooking = {
            userId: parseInt(user_id),
            carId: parseInt(car_id),
            carModel: car_model || 'Unknown Model',
            date: date,
            timeSlot: time_slot,
            user_name: user_name || 'Guest',
            user_email: user_email || '',
            user_phone: user_phone || '',
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const result = await db.collection('bookings').insertOne(newBooking);

        res.status(201).json({
            success: true,
            booking: { id: result.insertedId, ...newBooking },
            message: `Test drive booked for ${date} at ${time_slot}`
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/bookings/check-availability - Check available slots
router.get('/check-availability', async (req, res) => {
    try {
        const { car_id, date } = req.query;

        if (!car_id || !date) {
            return res.status(400).json({
                error: 'Missing required query parameters',
                required: ['car_id', 'date']
            });
        }

        // Get all bookings for this car/date
        const bookings = await db.collection('bookings')
            .find({
                carId: parseInt(car_id),
                date: date,
                status: { $ne: 'cancelled' }
            })
            .toArray();

        const bookedSlots = bookings.map(b => b.timeSlot);
        const availableSlots = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));

        res.json({
            success: true,
            car_id,
            date,
            availableSlots,
            allSlots: TIME_SLOTS,
            message: availableSlots.length > 0
                ? 'Available slots found'
                : 'No available slots for this date'
        });

    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/bookings/user/:user_id - Get user's bookings
router.get('/user/:user_id', async (req, res) => {
    try {
        const user_id = parseInt(req.params.user_id);

        if (!user_id) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const userBookings = await db.collection('bookings')
            .find({
                userId: user_id,
                status: { $ne: 'cancelled' }
            })
            .sort({ date: 1 })
            .toArray();

        res.json({
            success: true,
            user_id,
            total: userBookings.length,
            bookings: userBookings
        });

    } catch (error) {
        console.error('User bookings error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// PUT /api/bookings/:id/cancel - Cancel a booking
router.put('/:id/cancel', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const booking = await db.collection('bookings')
            .findOne({ id: id });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking already cancelled' });
        }

        await db.collection('bookings')
            .updateOne(
                { id: id },
                {
                    $set: {
                        status: 'cancelled',
                        updatedAt: new Date().toISOString()
                    }
                }
            );

        const updatedBooking = await db.collection('bookings')
            .findOne({ id: id });

        res.json({
            success: true,
            booking: updatedBooking,
            message: 'Booking cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

export default router;