// ============================================
// PANDA MOTORS API SERVER
// Version: 4.1.0
// Features: Auth + RBAC + Bookings + Admin Analytics + Reports
// ============================================

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

// ============================================
// REGISTER ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
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
  res.status(404).json({ success: false, message: 'Endpoint not found', path: req.originalUrl });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
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
  console.log('   /api/bookings');
  console.log('   /api/admin');
  console.log('========================================\n');
});