
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// @desc    Get all items with filtering
// @route   GET /api/items
// @access  Public
exports.getItems = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      itemType, 
      search, 
      location, 
      startDate, 
      endDate,
      sortBy = 'date',
      sortOrder = -1, // default newest first
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (itemType) filter.itemType = itemType;
    if (location) filter.location = { $regex: location, $options: 'i' };
    
    // Date filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = parseInt(sortOrder);

    const items = await Item.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reportedBy', 'name email')
      .populate('claimedBy', 'name email');

    // Get total count for pagination
    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      items
    });
  } catch (err) {
    console.error('Get items error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get a single item by ID
// @route   GET /api/items/:id
// @access  Public
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('claimedBy', 'name email');

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    console.error('Get item by ID error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      title,
      description,
      category,
      location,
      itemType,
      isHighValue,
      lostDate,
      foundDate,
      contactInfo
    } = req.body;

    // Process uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Create new item
    const newItem = new Item({
      title,
      description,
      category,
      location,
      itemType,
      images,
      reportedBy: req.user._id,
      isHighValue: isHighValue === 'true',
      status: itemType === 'lost' ? 'lost' : 'found',
      contactInfo
    });

    // Add date if provided
    if (itemType === 'lost' && lostDate) {
      newItem.lostDate = new Date(lostDate);
    }
    
    if (itemType === 'found' && foundDate) {
      newItem.foundDate = new Date(foundDate);
    }

    // Save item
    await newItem.save();

    // Notify admin about new item
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      const notification = new Notification({
        userId: admin._id,
        title: 'New Item Reported',
        message: `A new ${itemType} item "${title}" has been reported.`,
        itemId: newItem._id
      });
      
      await notification.save();
    }

    res.status(201).json({
      success: true,
      item: newItem
    });
  } catch (err) {
    console.error('Create item error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check if user has permission to update
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this item' 
      });
    }

    // Process new uploaded images
    const images = [...item.images]; // Keep existing images
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    // Handle image deletion
    if (req.body.removeImages) {
      const removeImages = Array.isArray(req.body.removeImages) 
        ? req.body.removeImages 
        : [req.body.removeImages];
      
      removeImages.forEach(imgPath => {
        const index = images.indexOf(imgPath);
        if (index !== -1) {
          images.splice(index, 1);
          
          // Delete file from disk
          try {
            const filePath = path.join(__dirname, '..', imgPath);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error('Error deleting image file:', error);
          }
        }
      });
    }

    // Update fields
    const {
      title,
      description,
      category,
      location,
      isHighValue,
      lostDate,
      foundDate,
      contactInfo
    } = req.body;

    const updateData = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (location) updateData.location = location;
    if (isHighValue !== undefined) updateData.isHighValue = isHighValue === 'true';
    if (contactInfo) updateData.contactInfo = contactInfo;
    if (images.length > 0) updateData.images = images;
    
    if (item.itemType === 'lost' && lostDate) {
      updateData.lostDate = new Date(lostDate);
    }
    
    if (item.itemType === 'found' && foundDate) {
      updateData.foundDate = new Date(foundDate);
    }

    // Update item
    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      item
    });
  } catch (err) {
    console.error('Update item error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check if user has permission to delete
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this item' 
      });
    }

    // Delete associated image files
    if (item.images && item.images.length > 0) {
      item.images.forEach(imgPath => {
        try {
          const filePath = path.join(__dirname, '..', imgPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error('Error deleting image file:', error);
        }
      });
    }

    // Delete associated notifications
    await Notification.deleteMany({ itemId: item._id });

    // Delete the item
    await item.remove();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (err) {
    console.error('Delete item error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Claim an item
// @route   POST /api/items/:id/claim
// @access  Private
exports.claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Cannot claim your own reported item
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot claim your own reported item' 
      });
    }

    // Cannot claim an already claimed or resolved item
    if (item.status === 'claimed' || item.status === 'resolved') {
      return res.status(400).json({ 
        success: false, 
        message: `This item has already been ${item.status}` 
      });
    }

    // Update item status
    item.status = 'claimed';
    item.claimedBy = req.user._id;
    await item.save();

    // Notify item reporter
    const notification = new Notification({
      userId: item.reportedBy,
      title: 'Item Claim',
      message: `Your ${item.itemType} item "${item.title}" has been claimed by ${req.user.name}.`,
      itemId: item._id
    });
    
    await notification.save();

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      if (admin._id.toString() !== item.reportedBy.toString()) {
        const adminNotification = new Notification({
          userId: admin._id,
          title: 'Item Claimed',
          message: `Item "${item.title}" has been claimed and requires review.`,
          itemId: item._id
        });
        
        await adminNotification.save();
      }
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    console.error('Claim item error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Admin approve/reject item claim
// @route   POST /api/items/:id/review
// @access  Private (Admin only)
exports.reviewItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Update item status
    item.status = status;
    await item.save();

    // Notify relevant users
    const statusText = status === 'approved' ? 'approved' : 
                      (status === 'rejected' ? 'rejected' : 'pending review');

    // Notify reporter
    const reporterNotification = new Notification({
      userId: item.reportedBy,
      title: 'Claim Status Updated',
      message: `The claim for your ${item.itemType} item "${item.title}" has been ${statusText} by an admin.`,
      itemId: item._id
    });
    
    await reporterNotification.save();

    // Notify claimer if exists
    if (item.claimedBy) {
      const claimerNotification = new Notification({
        userId: item.claimedBy,
        title: 'Claim Status Updated',
        message: `Your claim for the ${item.itemType} item "${item.title}" has been ${statusText} by an admin.`,
        itemId: item._id
      });
      
      await claimerNotification.save();
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    console.error('Review item error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Admin mark item as resolved
// @route   POST /api/items/:id/resolve
// @access  Private (Admin only)
exports.resolveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Update item status
    item.status = 'resolved';
    await item.save();

    // Notify relevant users
    const message = `The ${item.itemType} item "${item.title}" has been marked as resolved.`;

    // Notify reporter
    const reporterNotification = new Notification({
      userId: item.reportedBy,
      title: 'Item Resolved',
      message,
      itemId: item._id
    });
    
    await reporterNotification.save();

    // Notify claimer if exists
    if (item.claimedBy) {
      const claimerNotification = new Notification({
        userId: item.claimedBy,
        title: 'Item Resolved',
        message,
        itemId: item._id
      });
      
      await claimerNotification.save();
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    console.error('Resolve item error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
