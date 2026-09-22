import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import reportController from '../controllers/reportController.js';

const router = express.Router();

// GET /api/admin/reports/inventory - Generate PDF inventory report
router.get(
    '/inventory',
    authenticateToken,
    checkRole(['admin']),
    reportController.generateInventoryReport.bind(reportController)
);

// GET /api/admin/reports/inventory/json - Get inventory data as JSON
router.get(
    '/inventory/json',
    authenticateToken,
    checkRole(['admin']),
    reportController.getInventoryJSON.bind(reportController)
);

// GET /api/admin/reports/inventory/summary - Get summary only (no download)
router.get(
    '/inventory/summary',
    authenticateToken,
    checkRole(['admin']),
    reportController.getInventorySummary.bind(reportController)
);

export default router;