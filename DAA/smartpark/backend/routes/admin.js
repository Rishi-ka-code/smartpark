import express from 'express';
import { viewAllBookings, addSlot, removeSlot, updateArea, getDailyReport } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/bookings', viewAllBookings);
router.post('/slot', addSlot);
router.delete('/slot/:id', removeSlot);
router.put('/area/:id', updateArea);
router.get('/report', getDailyReport);

export default router;
