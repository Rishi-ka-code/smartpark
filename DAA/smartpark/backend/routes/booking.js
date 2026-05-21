import express from 'express';
import { reserve, getHistory, cancelBookingController, completeBookingController } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { handleValidation, reserveRules } from '../middleware/validate.js';

const router = express.Router();

router.post('/reserve', protect, reserveRules, handleValidation, reserve);
router.get('/history', protect, getHistory);
router.put('/cancel/:id', protect, cancelBookingController);
router.put('/complete/:id', protect, completeBookingController);

export default router;
