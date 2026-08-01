import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// GET /api/admin/metrics - Full dashboard metrics
router.get('/', async (req, res) => {
    try {
        const cars = await db.collection('cars').find({}).toArray();
        const bookings = await db.collection('bookings').find({}).toArray();
        const sales = await db.collection('sales').find({}).toArray();
        const users = await db.collection('users').find({}).toArray();
        
        // Inventory metrics
        const inventoryMetrics = {
            totalCars: cars.length,
            totalValue: cars.reduce((sum, car) => sum + car.price, 0),
            averagePrice: cars.length > 0 ? cars.reduce((sum, car) => sum + car.price, 0) / cars.length : 0,
            byMake: {}
        };
        
        cars.forEach(car => {
            if (!inventoryMetrics.byMake[car.make]) {
                inventoryMetrics.byMake[car.make] = { count: 0, totalValue: 0 };
            }
            inventoryMetrics.byMake[car.make].count++;
            inventoryMetrics.byMake[car.make].totalValue += car.price;
        });
        
        // Booking metrics
        const bookingMetrics = {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            thisMonth: bookings.filter(b => b.date && b.date.startsWith('2026-08')).length
        };
        
        // Revenue metrics
        const revenueMetrics = {
            totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
            totalSales: sales.length,
            averageSale: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length : 0
        };
        
        // User metrics
        const userMetrics = {
            totalUsers: users.length,
            byRole: {}
        };
        
        users.forEach(user => {
            const role = user.role || 'user';
            userMetrics.byRole[role] = (userMetrics.byRole[role] || 0) + 1;
        });
        
        res.json({
            success: true,
            data: {
                inventory: inventoryMetrics,
                bookings: bookingMetrics,
                revenue: revenueMetrics,
                users: userMetrics,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/admin/metrics/inventory - Inventory metrics only
router.get('/inventory', async (req, res) => {
    try {
        const cars = await db.collection('cars').find({}).toArray();
        
        const metrics = {
            totalCars: cars.length,
            totalValue: cars.reduce((sum, car) => sum + car.price, 0),
            averagePrice: cars.length > 0 ? cars.reduce((sum, car) => sum + car.price, 0) / cars.length : 0,
            byMake: {}
        };
        
        cars.forEach(car => {
            if (!metrics.byMake[car.make]) {
                metrics.byMake[car.make] = { count: 0, totalValue: 0 };
            }
            metrics.byMake[car.make].count++;
            metrics.byMake[car.make].totalValue += car.price;
        });
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Inventory metrics error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/admin/metrics/bookings - Booking metrics only
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await db.collection('bookings').find({}).toArray();
        
        const metrics = {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            thisMonth: bookings.filter(b => b.date && b.date.startsWith('2026-08')).length,
            byCar: {}
        };
        
        bookings.forEach(booking => {
            const model = booking.carModel || 'Unknown';
            if (!metrics.byCar[model]) {
                metrics.byCar[model] = 0;
            }
            metrics.byCar[model]++;
        });
        
        res.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Booking metrics error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;