
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all users - admin route
router.get('/', authenticate, isAdmin, userController.getAllUsers);

// Get user notifications - protected route
router.get('/notifications', authenticate, userController.getUserNotifications);

// Mark notification as read - protected route
router.put('/notifications/:id', authenticate, userController.markNotificationRead);

// Update user profile - protected route
router.put(
  '/profile',
  authenticate,
  upload.single('profilePicture'),
  [
    body('name', 'Name is required').optional().notEmpty().trim(),
    body('studentId', 'Student ID must be alphanumeric').optional().isAlphanumeric().trim(),
    body('department', 'Department is required').optional().notEmpty().trim()
  ],
  userController.updateProfile
);

// Change password - protected route
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ],
  userController.changePassword
);

// Admin - Get user by ID - admin route
router.get('/:id', authenticate, isAdmin, userController.getUserById);

// Admin - Update user - admin route
router.put('/:id', authenticate, isAdmin, userController.updateUser);

// Admin - Delete user - admin route
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

module.exports = router;
