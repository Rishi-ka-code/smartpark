import express from 'express';
import { getDashboardStats, getOccupancy, getPeakHoursController, getZoneStatsController } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/occupancy', getOccupancy); // Public for the landing page map
router.get('/', protect, authorize('admin'), getDashboardStats);
router.get('/peak-hours', protect, authorize('admin'), getPeakHoursController);
router.get('/zones', protect, authorize('admin'), getZoneStatsController);

export default router;
