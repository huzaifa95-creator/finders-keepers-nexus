
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// @desc    Get all posts with filtering
// @route   GET /api/community
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      isResolved,
      author,
      sortBy = 'createdAt',
      sortOrder = -1, // default newest first
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (isResolved !== undefined) filter.isResolved = isResolved === 'true';
    if (author) filter.author = author;
    
    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = parseInt(sortOrder);

    const posts = await Post.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email profilePicture');

    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      posts
    });
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/community/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email profilePicture')
      .populate('likes', 'name')
      .populate('comments.user', 'name email profilePicture');

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Get post by ID error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create a new post
// @route   POST /api/community
// @access  Private
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content, category, location, relatedItem } = req.body;

    // Create new post
    const newPost = new Post({
      title,
      content,
      author: req.user._id,
      category,
      location,
      relatedItem
    });

    await newPost.save();

    // Return post with populated author
    const post = await Post.findById(newPost._id)
      .populate('author', 'name email profilePicture');

    res.status(201).json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update a post
// @route   PUT /api/community/:id
// @access  Private (author or admin)
exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content, category, location } = req.body;
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user has permission to update
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this post' 
      });
    }

    // Update fields
    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (location) updateData.location = location;

    // Update post
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('author', 'name email profilePicture');

    res.json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Update post error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/community/:id
// @access  Private (author or admin)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user has permission to delete
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this post' 
      });
    }

    await post.remove();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (err) {
    console.error('Delete post error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Like a post
// @route   POST /api/community/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if post has already been liked by this user
    if (post.likes.some(like => like.toString() === req.user._id.toString())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post already liked' 
      });
    }

    // Add user id to likes array
    post.likes.unshift(req.user._id);
    await post.save();

    // If you're not the post author, notify them
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: post.author,
        title: 'New Like',
        message: `${req.user.name} liked your post "${post.title}".`
      });
      
      await notification.save();
    }

    res.json({
      success: true,
      likes: post.likes
    });
  } catch (err) {
    console.error('Like post error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Unlike a post
// @route   DELETE /api/community/:id/like
// @access  Private
exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if post has not been liked by this user
    if (!post.likes.some(like => like.toString() === req.user._id.toString())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post has not been liked yet' 
      });
    }

    // Remove user id from likes array
    post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString());
    await post.save();

    res.json({
      success: true,
      likes: post.likes
    });
  } catch (err) {
    console.error('Unlike post error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/community/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Create new comment
    const newComment = {
      user: req.user._id,
      content,
      createdAt: Date.now()
    };

    // Add comment to post
    post.comments.unshift(newComment);
    await post.save();

    // Get updated post with populated comments
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'name email profilePicture');

    // If you're not the post author, notify them
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: post.author,
        title: 'New Comment',
        message: `${req.user.name} commented on your post "${post.title}".`
      });
      
      await notification.save();
    }

    res.json({
      success: true,
      comments: updatedPost.comments
    });
  } catch (err) {
    console.error('Add comment error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/community/:id/comments/:commentId
// @access  Private (comment author or admin)
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Find the comment
    const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if user has permission to delete
    if (comment.user.toString() !== req.user._id.toString() && 
        post.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }

    // Remove comment
    post.comments = post.comments.filter(comment => comment._id.toString() !== req.params.commentId);
    await post.save();

    res.json({
      success: true,
      comments: post.comments
    });
  } catch (err) {
    console.error('Delete comment error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Mark post as resolved
// @route   PUT /api/community/:id/resolve
// @access  Private (author or admin)
exports.resolvePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }

    // Check if user has permission to update
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this post' 
      });
    }

    // Toggle resolved status
    post.isResolved = !post.isResolved;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (err) {
    console.error('Resolve post error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
