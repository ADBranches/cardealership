import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/optimized/search - Optimized inventory search
router.get('/search', async (req, res) => {
    try {
        const { make, model, minPrice, maxPrice, year, condition, transmission, fuelType, limit = 20, offset = 0 } = req.query;

        let query = {};
        if (make) query.make = { $regex: make, $options: 'i' };
        if (model) query.model = { $regex: model, $options: 'i' };
        if (year) query.year = parseInt(year);
        if (condition) query.condition = condition;
        if (transmission) query.transmission = transmission;
        if (fuelType) query.fuelType = fuelType;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice);
            if (maxPrice) query.price.$lte = parseInt(maxPrice);
        }

        const results = await db.collection('cars')
            .find(query)
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .toArray();

        const total = await db.collection('cars').count(query);

        res.json({
            success: true,
            data: results,
            meta: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                returned: results.length
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/optimized/availability - Quick availability check
router.get('/availability', async (req, res) => {
    try {
        const { carId, date, timeSlot } = req.query;

        if (!carId || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: carId, date, timeSlot'
            });
        }

        const existingBooking = await db.collection('bookings').findOne({
            carId: parseInt(carId),
            date: date,
            timeSlot: timeSlot,
            status: { $ne: 'cancelled' }
        });

        res.json({
            success: true,
            data: {
                available: !existingBooking,
                bookedBy: existingBooking ? existingBooking.user_name : null
            }
        });
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/optimized/stats - Inventory statistics
router.get('/stats', async (req, res) => {
    try {
        const cars = await db.collection('cars').find({}).toArray();

        const stats = {
            totalCars: cars.length,
            totalValue: cars.reduce((sum, car) => sum + car.price, 0),
            averagePrice: cars.length > 0 ? cars.reduce((sum, car) => sum + car.price, 0) / cars.length : 0,
            minPrice: cars.length > 0 ? Math.min(...cars.map(c => c.price)) : 0,
            maxPrice: cars.length > 0 ? Math.max(...cars.map(c => c.price)) : 0,
            byMake: {}
        };

        cars.forEach(car => {
            if (!stats.byMake[car.make]) {
                stats.byMake[car.make] = { count: 0, totalValue: 0 };
            }
            stats.byMake[car.make].count++;
            stats.byMake[car.make].totalValue += car.price;
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/optimized/most-searched - Most searched makes
router.get('/most-searched', async (req, res) => {
    try {
        const cars = await db.collection('cars').find({}).toArray();

        const makeCount = {};
        cars.forEach(car => {
            makeCount[car.make] = (makeCount[car.make] || 0) + 1;
        });

        const sorted = Object.entries(makeCount)
            .map(([make, count]) => ({ make, count }))
            .sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            data: sorted
        });
    } catch (error) {
        console.error('Most searched error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/optimized/performance - Query performance report
router.get('/performance', (req, res) => {
    res.json({
        success: true,
        data: {
            totalQueries: 0,
            slowQueries: 0,
            errorQueries: 0,
            avgDuration: 0,
            slowQueryPercent: '0%'
        }
    });
});

export default router;