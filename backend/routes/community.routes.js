
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const communityController = require('../controllers/community.controller');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all posts with filters
router.get('/', communityController.getPosts);

// Get a single post by ID
router.get('/:id', communityController.getPostById);

// Create a new post - protected route
router.post(
  '/',
  authenticate,
  [
    body('title', 'Title is required').notEmpty().trim(),
    body('content', 'Content is required').notEmpty().trim(),
    body('category', 'Category is required').notEmpty().trim()
  ],
  communityController.createPost
);

// Update a post - protected route (only author or admin)
router.put(
  '/:id',
  authenticate,
  [
    body('title', 'Title is required').optional().notEmpty().trim(),
    body('content', 'Content is required').optional().notEmpty().trim(),
    body('category', 'Category is required').optional().notEmpty().trim()
  ],
  communityController.updatePost
);

// Delete a post - protected route (only author or admin)
router.delete(
  '/:id',
  authenticate,
  communityController.deletePost
);

// Like a post - protected route
router.post(
  '/:id/like',
  authenticate,
  communityController.likePost
);

// Unlike a post - protected route
router.delete(
  '/:id/like',
  authenticate,
  communityController.unlikePost
);

// Add a comment to a post - protected route
router.post(
  '/:id/comments',
  authenticate,
  [
    body('content', 'Comment content is required').notEmpty().trim()
  ],
  communityController.addComment
);

// Delete a comment - protected route (only comment author or admin)
router.delete(
  '/:id/comments/:commentId',
  authenticate,
  communityController.deleteComment
);

// Mark post as resolved - protected route (only author or admin)
router.put(
  '/:id/resolve',
  authenticate,
  communityController.resolvePost
);

module.exports = router;
