import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidation, signupRules, loginRules } from '../middleware/validate.js';

const router = express.Router();

router.post('/signup', signupRules, handleValidation, signup);
router.post('/login', loginRules, handleValidation, login);
router.get('/me', protect, getMe);

export default router;
