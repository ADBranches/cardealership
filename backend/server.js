// ============================================
// PANDA MOTORS API SERVER
// Version: 4.0.0
// Features: Auth + RBAC + PDF Reports + Spotlight + Analytics
// ============================================

// Import required packages
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// ============================================
// IMPORT ROUTES
// ============================================
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import optimizedRoutes from './routes/optimizedRoutes.js';
import adminMetricsRoutes from './routes/adminMetricsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import highValueRoutes from './routes/highValueRoutes.js';

// ============================================
// IMPORT MIDDLEWARE
// ============================================
import { performanceMiddleware } from './middleware/performanceMiddleware.js';

// ============================================
// IMPORT DATABASE CONFIG
// ============================================
import { createIndexes, verifyIndexes } from './config/indexes.js';

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();

// Define the port
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
// CORS - Allows React frontend (port 5173) to communicate with backend (port 5000)
app.use(cors());

// JSON Parser - Automatically parses incoming JSON data
app.use(express.json());

// URL Encoded Parser
app.use(express.urlencoded({ extended: true }));

// Performance monitoring middleware
app.use(performanceMiddleware);

// ============================================
// ROUTES
// ============================================

// Authentication routes (NEW - Task: Secure Auth & RBAC)
app.use('/api/auth', authRoutes);

// Booking routes (Task 1)
app.use('/api/bookings', bookingRoutes);

// Admin routes (Task 2)
app.use('/api/admin', adminRoutes);

// Optimized query routes (Performance & Analytics)
app.use('/api/optimized', optimizedRoutes);

// Admin metrics routes (Unified Admin Analytics Dashboard)
app.use('/api/admin/metrics', adminMetricsRoutes);

// Report routes (PDF Generator)
app.use('/api/admin/reports', reportRoutes);

// High-Value Alert routes (Spotlight System)
app.use('/api/admin/spotlight', highValueRoutes);

// ============================================
// USER STORY 1: Financial Payment Approximation
// ============================================
// POST /api/finance/calculate
// This endpoint calculates monthly loan payments
app.post('/api/finance/calculate', (req, res) => {
    try {
        const {
            carPrice,
            downPayment,
            interestRate,
            loanTermMonths
        } = req.body;

        // Input Validation
        if (carPrice === undefined || downPayment === undefined || 
            interestRate === undefined || loanTermMonths === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['carPrice', 'downPayment', 'interestRate', 'loanTermMonths']
            });
        }

        // Convert string inputs to numbers
        const price = parseFloat(carPrice);
        const down = parseFloat(downPayment);
        const rate = parseFloat(interestRate);
        const term = parseInt(loanTermMonths);

        // Validate non-negative values
        if (price < 0) return res.status(400).json({ error: 'Car price cannot be negative' });
        if (down < 0) return res.status(400).json({ error: 'Down payment cannot be negative' });
        if (rate < 0) return res.status(400).json({ error: 'Interest rate cannot be negative' });
        if (term <= 0) return res.status(400).json({ error: 'Loan term must be greater than 0 months' });

        // Calculate loan amount
        const loanAmount = price - down;
        
        if (loanAmount <= 0) {
            return res.status(400).json({ 
                error: 'Down payment must be less than car price',
                message: 'Your down payment already covers the full price!'
            });
        }

        // Calculate Monthly Payment using Amortization Formula
        const monthlyRate = (rate / 100) / 12;

        let monthlyPayment;
        let totalPayment;
        let totalInterest;

        if (monthlyRate === 0) {
            monthlyPayment = loanAmount / term;
            totalPayment = loanAmount;
            totalInterest = 0;
        } else {
            const compoundFactor = Math.pow(1 + monthlyRate, term);
            monthlyPayment = loanAmount * (monthlyRate * compoundFactor) / (compoundFactor - 1);
            totalPayment = monthlyPayment * term;
            totalInterest = totalPayment - loanAmount;
        }

        // Generate Payment Schedule (first 6 months)
        const paymentSchedule = [];
        let remainingBalance = loanAmount;
        
        for (let month = 1; month <= Math.min(6, term); month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            remainingBalance -= principalPayment;
            
            paymentSchedule.push({
                month: month,
                payment: Math.round(monthlyPayment),
                principal: Math.round(principalPayment),
                interest: Math.round(interestPayment),
                remainingBalance: Math.max(0, Math.round(remainingBalance))
            });
        }

        // Return the calculated results
        res.json({
            success: true,
            inputs: {
                carPrice: price,
                downPayment: down,
                loanAmount: loanAmount,
                interestRate: rate,
                loanTermMonths: term
            },
            results: {
                monthlyPayment: Math.round(monthlyPayment),
                totalPayment: Math.round(totalPayment),
                totalInterest: Math.round(totalInterest),
                paymentSchedule: paymentSchedule,
                currency: 'UGX'
            }
        });

    } catch (error) {
        console.error('Calculation error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// ============================================
// USER STORY 2: Dealership Localization
// ============================================
// GET /api/dealership/location
app.get('/api/dealership/location', (req, res) => {
    try {
        const dealershipInfo = {
            success: true,
            dealership: {
                name: 'Panda Motors Ltd',
                description: 'Uganda\'s trusted luxury vehicle importer',
                
                address: {
                    street: 'Banda, Jinja Road',
                    city: 'Kampala',
                    district: 'Kampala District',
                    country: 'Uganda',
                    fullAddress: 'Banda, Jinja Road, Kampala, Uganda'
                },
                
                location: {
                    latitude: 0.3488,
                    longitude: 32.6160,
                    zoom: 15
                },
                
                operatingHours: {
                    monday: { open: '08:00', close: '18:00', isOpen: true },
                    tuesday: { open: '08:00', close: '18:00', isOpen: true },
                    wednesday: { open: '08:00', close: '18:00', isOpen: true },
                    thursday: { open: '08:00', close: '18:00', isOpen: true },
                    friday: { open: '08:00', close: '18:00', isOpen: true },
                    saturday: { open: '09:00', close: '17:00', isOpen: true },
                    sunday: { open: '00:00', close: '00:00', isOpen: false, note: 'Closed' }
                },
                
                contact: {
                    phone: ['+256 770 826 951', '+256 756 053 475'],
                    whatsapp: '+256 770 826 951',
                    email: 'sales@pandamotors.co.ug'
                },
                
                services: [
                    'URA Duty Clearance',
                    'Import Documentation',
                    'Certified Workshop',
                    'Flexible Financing'
                ],
                
                googleMapsUrl: 'https://maps.google.com/?q=Banda,+Jinja+Road,+Kampala,+Uganda',
                directionsUrl: 'https://maps.google.com/dir//Banda,+Jinja+Road,+Kampala,+Uganda',
                embedMapUrl: 'https://maps.google.com/maps?q=Banda+Kampala+Uganda&z=15&output=embed'
            }
        };

        res.json(dealershipInfo);

    } catch (error) {
        console.error('Location error:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// ============================================
// BONUS: Dealership Open Status Endpoint
// ============================================
// GET /api/dealership/status
app.get('/api/dealership/status', (req, res) => {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    
    const currentTime = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const hours = {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: '00:00', close: '00:00' }
    };
    
    const todayHours = hours[currentDay];
    const isOpen = currentDay !== 'sunday' && 
                   currentTime >= todayHours.open && 
                   currentTime <= todayHours.close;
    
    res.json({
        success: true,
        currentTime: currentTime,
        currentDay: currentDay,
        isOpen: isOpen,
        operatingHours: todayHours,
        message: isOpen ? 'We are currently open! Visit us today.' : 'We are closed. Please visit during business hours.'
    });
});

// ============================================
// Health Check Endpoint
// ============================================
// GET /api/health
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Panda Motors API is running!',
        version: '4.0.0',
        endpoints: [
            // Authentication (NEW)
            'POST /api/auth/register - Register new user',
            'POST /api/auth/login - Login user',
            'POST /api/auth/logout - Logout user',
            'GET /api/auth/me - Get current user',
            'POST /api/auth/refresh - Refresh token',
            'PUT /api/auth/change-password - Change password',
            'GET /api/auth/users - Get all users (Admin)',
            'DELETE /api/auth/users/:id - Delete user (Admin)',
            
            // Financial
            'POST /api/finance/calculate - Calculate loan payments',
            
            // Dealership
            'GET /api/dealership/location - Get dealership location',
            'GET /api/dealership/status - Check if open',
            
            // Bookings
            'POST /api/bookings/create - Book test drive',
            'GET /api/bookings/check-availability - Check availability',
            'GET /api/bookings/user/:user_id - Get user bookings',
            'PUT /api/bookings/:id/cancel - Cancel booking',
            
            // Admin Analytics
            'GET /api/admin/stats - Full admin statistics',
            'GET /api/admin/stats/summary - Quick summary',
            
            // Performance & Optimized Queries
            'GET /api/optimized/search - Optimized inventory search',
            'GET /api/optimized/availability - Quick availability check',
            'GET /api/optimized/stats - Inventory statistics',
            'GET /api/optimized/most-searched - Most searched makes',
            'GET /api/optimized/performance - Query performance report',
            
            // Admin Metrics Dashboard
            'GET /api/admin/metrics - Full admin dashboard metrics',
            'GET /api/admin/metrics/inventory - Inventory metrics only',
            'GET /api/admin/metrics/bookings - Booking metrics only',
            
            // Reports
            'GET /api/admin/reports/inventory - Download PDF inventory report',
            'GET /api/admin/reports/inventory/json - Get inventory as JSON',
            'GET /api/admin/reports/inventory/summary - Get inventory summary',
            
            // High-Value Spotlight System
            'GET /api/admin/spotlight/alerts - View spotlight alerts',
            'GET /api/admin/spotlight/featured - Get featured vehicles',
            'GET /api/admin/spotlight/stats - High-value statistics',
            'POST /api/admin/spotlight/process-all - Process all vehicles',
            'POST /api/admin/spotlight/process/:vehicleId - Process specific vehicle',
            
            // Health
            'GET /api/health - Health check'
        ]
    });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// Database Initialization
// ============================================
async function initializeDatabase() {
    try {
        console.log('?? Initializing database...');
        await createIndexes();
        await verifyIndexes();
        console.log('? Database initialization complete!');
    } catch (error) {
        console.error('? Database initialization error:', error.message);
    }
}

// ============================================
// Start the Server
// ============================================
app.listen(PORT, async () => {
    console.log('\n========================================');
    console.log('?? Panda Motors API Server');
    console.log('========================================');
    console.log(`?? Server running on: http://localhost:${PORT}`);
    console.log(`?? Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`?? Version: 4.0.0`);
    
    // Initialize database
    await initializeDatabase();
    
    console.log('\n?? Available Endpoints:');
    
    console.log('   --- Authentication (NEW) ---');
    console.log(`   POST   /api/auth/register       - Register new user`);
    console.log(`   POST   /api/auth/login          - Login user`);
    console.log(`   POST   /api/auth/logout         - Logout user`);
    console.log(`   GET    /api/auth/me             - Get current user`);
    console.log(`   POST   /api/auth/refresh        - Refresh token`);
    console.log(`   PUT    /api/auth/change-password - Change password`);
    console.log(`   GET    /api/auth/users          - Get all users (Admin)`);
    console.log(`   DELETE /api/auth/users/:id      - Delete user (Admin)`);
    
    console.log('   --- Financial ---');
    console.log(`   POST /api/finance/calculate  - Loan calculator`);
    
    console.log('   --- Dealership ---');
    console.log(`   GET  /api/dealership/location - Store location`);
    console.log(`   GET  /api/dealership/status   - Open status`);
    
    console.log('   --- Test Drive Booking ---');
    console.log(`   POST /api/bookings/create     - Book test drive`);
    console.log(`   GET  /api/bookings/check-availability - Check availability`);
    console.log(`   GET  /api/bookings/user/:user_id - Get user bookings`);
    console.log(`   PUT  /api/bookings/:id/cancel - Cancel booking`);
    
    console.log('   --- Admin Analytics ---');
    console.log(`   GET  /api/admin/stats         - Full admin statistics`);
    console.log(`   GET  /api/admin/stats/summary - Quick summary`);
    
    console.log('   --- Performance & Optimized Queries ---');
    console.log(`   GET  /api/optimized/search    - Optimized inventory search`);
    console.log(`   GET  /api/optimized/availability - Quick availability check`);
    console.log(`   GET  /api/optimized/stats     - Inventory statistics`);
    console.log(`   GET  /api/optimized/most-searched - Most searched makes`);
    console.log(`   GET  /api/optimized/performance - Query performance report`);
    
    console.log('   --- Admin Metrics Dashboard ---');
    console.log(`   GET  /api/admin/metrics       - Full dashboard metrics`);
    console.log(`   GET  /api/admin/metrics/inventory - Inventory metrics only`);
    console.log(`   GET  /api/admin/metrics/bookings - Booking metrics only`);
    
    console.log('   --- Reports (PDF) ---');
    console.log(`   GET  /api/admin/reports/inventory     - Download PDF report`);
    console.log(`   GET  /api/admin/reports/inventory/json - Get inventory as JSON`);
    console.log(`   GET  /api/admin/reports/inventory/summary - Get summary`);
    
    console.log('   --- High-Value Spotlight System ---');
    console.log(`   GET  /api/admin/spotlight/alerts      - View alerts`);
    console.log(`   GET  /api/admin/spotlight/featured    - Featured vehicles`);
    console.log(`   GET  /api/admin/spotlight/stats       - High-value stats`);
    console.log(`   POST /api/admin/spotlight/process-all - Process all`);
    console.log(`   POST /api/admin/spotlight/process/:id - Process specific`);
    
    console.log('   --- Health ---');
    console.log(`   GET  /api/health              - Health check`);
    console.log('========================================\n');
});