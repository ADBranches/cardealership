import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import db from '../config/database.js';

const router = express.Router();

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/admin/stats - Full admin statistics
router.get('/stats', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        // Get all collections
        const cars = await db.collection('cars').find({}).toArray();
        const bookings = await db.collection('bookings').find({}).toArray();
        const sales = await db.collection('sales').find({}).toArray();
        const users = await db.collection('users').find({}).toArray();

        // Total revenue
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
        
        // Total bookings
        const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;
        
        // Cars in inventory
        const inventoryCount = cars.length;
        
        // Average car price
        const avgPrice = cars.length > 0 
            ? cars.reduce((sum, car) => sum + car.price, 0) / cars.length 
            : 0;
        
        // Recent bookings (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentBookings = bookings.filter(b => {
            const bookingDate = new Date(b.createdAt || b.date);
            return bookingDate >= oneWeekAgo && b.status !== 'cancelled';
        });

        // Booking by car model
        const bookingsByModel = {};
        bookings.forEach(b => {
            if (b.status !== 'cancelled') {
                const model = b.carModel || b.car_model || 'Unknown';
                bookingsByModel[model] = (bookingsByModel[model] || 0) + 1;
            }
        });

        // Sales by month
        const salesByMonth = {};
        sales.forEach(sale => {
            const month = sale.date.substring(0, 7); // YYYY-MM
            salesByMonth[month] = (salesByMonth[month] || 0) + sale.amount;
        });

        // Recent sales (last 5)
        const recentSales = [...sales]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalBookings,
                inventoryCount,
                averageCarPrice: Math.round(avgPrice),
                totalSales: sales.length,
                totalUsers: users.length,
                recentBookings: recentBookings.length,
                bookingsByModel,
                salesByMonth,
                recentSales,
                currency: 'UGX'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// GET /api/admin/stats/summary - Quick summary
router.get('/stats/summary', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const cars = await db.collection('cars').find({}).toArray();
        const bookings = await db.collection('bookings').find({}).toArray();
        const sales = await db.collection('sales').find({}).toArray();

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
        const totalBookings = bookings.filter(b => b.status !== 'cancelled').length;
        const inventoryCount = cars.length;
        
        // Calculate month-to-date revenue
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const mtdRevenue = sales
            .filter(sale => new Date(sale.date) >= monthStart)
            .reduce((sum, sale) => sum + sale.amount, 0);

        // Calculate growth (compare with last month)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthRevenue = sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= lastMonth && saleDate <= lastMonthEnd;
            })
            .reduce((sum, sale) => sum + sale.amount, 0);

        const growth = lastMonthRevenue > 0 
            ? ((mtdRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            summary: {
                totalRevenue,
                mtdRevenue,
                totalBookings,
                inventoryCount,
                growth: parseFloat(growth),
                growthLabel: growth >= 0 ? 'Up' : 'Down',
                currency: 'UGX'
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Admin summary error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const users = await db.collection('users').find({}).toArray();
        
        // Remove passwords from response
        const safeUsers = users.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });
        
        res.json({
            success: true,
            data: safeUsers,
            total: safeUsers.length
        });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/admin/bookings - Get all bookings (admin only)
router.get('/bookings', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const bookings = await db.collection('bookings').find({}).toArray();
        
        res.json({
            success: true,
            data: bookings,
            total: bookings.length
        });
    } catch (error) {
        console.error('Admin bookings error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/admin/cars - Get all cars (admin only)
router.get('/cars', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const cars = await db.collection('cars').find({}).toArray();
        
        res.json({
            success: true,
            data: cars,
            total: cars.length
        });
    } catch (error) {
        console.error('Admin cars error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;