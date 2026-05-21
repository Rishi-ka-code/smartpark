import { validationResult, body } from 'express-validator';
import { ErrorResponse } from './errorHandler.js';

// Check validation results
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join(', ');
    return next(new ErrorResponse(messages, 400));
  }
  next();
};

// Signup validation rules
export const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Login validation rules
export const loginRules = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Reserve validation rules
export const reserveRules = [
  body('slotId').notEmpty().withMessage('Slot ID is required')
];
