
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', [auth, admin], userController.getAllUsers);

// @route   POST /api/users
// @desc    Create a new user (admin only)
// @access  Private (Admin only)
router.post(
  '/',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
      check('role', 'Role must be either student or admin').optional().isIn(['student', 'admin'])
    ]
  ],
  userController.createUser
);

// @route   GET /api/users/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, userController.getUserNotifications);

// @route   PUT /api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id', auth, userController.markNotificationRead);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('email', 'Please include a valid email').optional().isEmail()
    ]
  ],
  userController.updateProfile
);

// @route   PUT /api/users/password
// @desc    Change password
// @access  Private
router.put(
  '/password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').not().isEmpty(),
      check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ]
  ],
  userController.changePassword
);

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private (Admin only)
router.get('/:id', [auth, admin], userController.getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin only)
router.put(
  '/:id',
  [
    auth,
    admin,
    [
      check('name', 'Name is required').optional().not().isEmpty(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('role', 'Role must be either student or admin').optional().isIn(['student', 'admin'])
    ]
  ],
  userController.updateUser
);

// @route   PUT /api/users/:id/status
// @desc    Change user status (admin only)
// @access  Private (Admin only)
router.put(
  '/:id/status',
  [
    auth,
    admin,
    [
      check('status', 'Status is required').isIn(['active', 'inactive', 'suspended'])
    ]
  ],
  userController.changeUserStatus
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin only)
router.delete('/:id', [auth, admin], userController.deleteUser);

module.exports = router;
