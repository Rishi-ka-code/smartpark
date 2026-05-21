import express from 'express';
import { getAreas, getSlots, getRecommendedSlotController, updateSlotStatusController } from '../controllers/parkingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAreas);
router.get('/slots', getSlots);
router.get('/recommended-slot', protect, getRecommendedSlotController);
router.put('/slot-status/:id', protect, authorize('admin'), updateSlotStatusController);

export default router;
