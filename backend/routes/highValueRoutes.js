import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import highValueController from '../controllers/highValueController.js';

const router = express.Router();

// GET /api/admin/spotlight/alerts - Get all alerts
router.get(
    '/alerts',
    authenticateToken,
    checkRole(['admin']),
    highValueController.getAlerts.bind(highValueController)
);

// PUT /api/admin/spotlight/alerts/:alertId/read - Mark alert as read
router.put(
    '/alerts/:alertId/read',
    authenticateToken,
    checkRole(['admin']),
    highValueController.markAlertRead.bind(highValueController)
);

// GET /api/admin/spotlight/featured - Get featured vehicles
router.get(
    '/featured',
    authenticateToken,
    checkRole(['admin']),
    highValueController.getFeaturedVehicles.bind(highValueController)
);

// GET /api/admin/spotlight/stats - Get high-value stats
router.get(
    '/stats',
    authenticateToken,
    checkRole(['admin']),
    highValueController.getHighValueStats.bind(highValueController)
);

// POST /api/admin/spotlight/process-all - Process all vehicles
router.post(
    '/process-all',
    authenticateToken,
    checkRole(['admin']),
    highValueController.processAllVehicles.bind(highValueController)
);

// POST /api/admin/spotlight/process/:vehicleId - Process specific vehicle
router.post(
    '/process/:vehicleId',
    authenticateToken,
    checkRole(['admin']),
    highValueController.processVehicle.bind(highValueController)
);

// POST /api/webhooks/vehicle-created - Webhook for new vehicle creation (public)
router.post(
    '/webhooks/vehicle-created',
    highValueController.vehicleCreatedWebhook.bind(highValueController)
);

export default router;