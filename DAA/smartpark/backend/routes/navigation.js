import express from 'express';
import { getNavigation, getRoute } from '../controllers/navigationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/route', protect, getRoute);
router.get('/:slotId', protect, getNavigation);

export default router;
