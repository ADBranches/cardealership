// ============================================
// PANDA MOTORS API SERVER
// Version: 4.1.0
// Features: Auth + RBAC + Bookings + Admin Analytics + Reports
// ============================================

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// ============================================
// IMPORT ROUTES
// ============================================
import authRoutes from './routes/authRoutes.js';
import carsRoutes from './routes/carsRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.info('Incoming request', {
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
  next();
});

// ============================================
// REGISTER ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'Panda Motors API is running',
    version: '4.1.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/bookings/create',
      'GET  /api/bookings/check-availability',
      'GET  /api/bookings/available-slots/:carId/:date',
      'GET  /api/bookings/weekly-availability/:carId',
      'GET  /api/bookings/my-bookings',
      'DELETE /api/bookings/:id/cancel',
      'GET  /api/admin/stats',
      'GET  /api/admin/pending-approvals',
      'GET  /api/admin/bookings',
      'PUT  /api/admin/bookings/:id/status',
      'PUT  /api/admin/bookings/bulk',
      'PUT  /api/admin/cars/:id/approve',
      'PUT  /api/admin/cars/:id/reject',
      'PUT  /api/admin/cars/:id',
      'DELETE /api/admin/cars/:id'
    ]
  });
});

// ============================================
// ROOT
// ============================================
app.get('/', (req, res) => {
  res.json({ message: 'Panda Motors API', docs: '/api/health' });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.originalUrl
    }
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED');

  console.error('Unhandled error', {
    code,
    status,
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  res.status(status).json({
    success: false,
    error: {
      code,
      message: status >= 500 ? 'Internal server error' : (err.message || 'Request failed')
    }
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`?? Panda Motors API running on http://localhost:${PORT}`);
  console.log(`?? Health check: http://localhost:${PORT}/api/health`);
  console.log('========================================');
  console.log('\n?? Routes loaded:');
  console.log('   /api/auth');
  console.log('   /api/cars');
  console.log('   /api/bookings');
  console.log('   /api/admin');
  console.log('========================================\n');
});
