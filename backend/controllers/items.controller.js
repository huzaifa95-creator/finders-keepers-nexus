
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Get all items with filtering
exports.getItems = async (req, res) => {
  try {
    const { type, category, status, search } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await Item.find(query)
      .populate('user', 'name email')
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'name email')
      .populate('claimedBy', 'name email');
      
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, type, category, location, date } = req.body;
    
    const newItem = new Item({
      title,
      description,
      type,
      category,
      location,
      date,
      user: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    const item = await newItem.save();
    
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user is authorized
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { title, description, category, location, date, status } = req.body;
    
    // Update fields
    if (title) item.title = title;
    if (description) item.description = description;
    if (category) item.category = category;
    if (location) item.location = location;
    if (date) item.date = date;
    if (status && req.user.role === 'admin') item.status = status;
    
    // Update image if provided
    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    await item.save();
    
    res.json(item);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user is authorized
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await item.remove();
    
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Claim an item
exports.claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Can't claim own item
    if (item.user.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot claim your own item' });
    }
    
    // Check if item is already claimed or resolved
    if (item.status !== 'pending') {
      return res.status(400).json({ 
        message: `Item is already ${item.status}` 
      });
    }
    
    // Update item status
    item.status = 'claimed';
    item.claimedBy = req.user.id;
    
    await item.save();
    
    // Create notification for item owner
    const notification = new Notification({
      user: item.user,
      message: `Someone has claimed your ${item.type} item: ${item.title}`,
      relatedItem: item._id
    });
    
    await notification.save();
    
    res.json(item);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin review item claim (approve/reject)
exports.reviewItemClaim = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { status } = req.body;
    
    if (!status || (status !== 'resolved' && status !== 'rejected')) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if item is claimed
    if (item.status !== 'claimed') {
      return res.status(400).json({ message: 'Item is not claimed' });
    }
    
    // Update item status
    item.status = status;
    
    await item.save();
    
    // Create notifications
    const ownerMessage = status === 'resolved' 
      ? `Your ${item.type} item has been successfully returned to its ${item.type === 'lost' ? 'owner' : 'finder'}`
      : `The claim for your ${item.type} item has been rejected`;
    
    const claimerMessage = status === 'resolved'
      ? `Your claim for the ${item.type} item has been approved`
      : `Your claim for the ${item.type} item has been rejected`;
    
    // Notification for item owner
    const ownerNotification = new Notification({
      user: item.user,
      message: ownerMessage,
      relatedItem: item._id
    });
    
    // Notification for claimer
    const claimerNotification = new Notification({
      user: item.claimedBy,
      message: claimerMessage,
      relatedItem: item._id
    });
    
    await Promise.all([
      ownerNotification.save(),
      claimerNotification.save()
    ]);
    
    res.json(item);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};
