
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

// Register a new user
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please include a valid FAST-NUCES email')
      .isEmail()
      .matches(/^[\w-]+(\.[\w-]+)*@nu\.edu\.pk$/)
      .normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty()
  ],
  authController.login
);

// Get current user profile
router.get('/me', authController.getCurrentUser);

module.exports = router;
