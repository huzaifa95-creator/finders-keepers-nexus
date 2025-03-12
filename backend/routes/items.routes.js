
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const itemsController = require('../controllers/items.controller');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all items with filters
router.get('/', itemsController.getItems);

// Get a single item by ID
router.get('/:id', itemsController.getItemById);

// Create a new item - protected route
router.post(
  '/',
  authenticate,
  upload.array('images', 5),
  [
    body('title', 'Title is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty().trim(),
    body('category', 'Category is required').notEmpty().trim(),
    body('location', 'Location is required').notEmpty().trim(),
    body('itemType', 'Item type must be either lost or found').isIn(['lost', 'found'])
  ],
  itemsController.createItem
);

// Update an item - protected route
router.put(
  '/:id',
  authenticate,
  upload.array('images', 5),
  itemsController.updateItem
);

// Delete an item - protected route
router.delete(
  '/:id',
  authenticate,
  itemsController.deleteItem
);

// Claim an item - protected route
router.post(
  '/:id/claim',
  authenticate,
  itemsController.claimItem
);

// Admin approve/reject item claim - admin route
router.post(
  '/:id/review',
  authenticate,
  isAdmin,
  [
    body('status', 'Status must be either approved, rejected or pending').isIn(['approved', 'rejected', 'pending'])
  ],
  itemsController.reviewItem
);

// Admin mark item as resolved - admin route
router.post(
  '/:id/resolve',
  authenticate,
  isAdmin,
  itemsController.resolveItem
);

module.exports = router;
