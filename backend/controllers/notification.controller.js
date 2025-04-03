
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify that the authenticated user is accessing their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to access these notifications' });
    }
    
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('relatedItem')
      .populate('relatedPost');
    
    // Transform notifications to frontend format
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      title: notification.relatedItem ? 
        `Activity on your ${notification.relatedItem.type} item` : 
        (notification.relatedPost ? 'Comment on your post' : 'System Notification'),
      description: notification.message,
      timestamp: notification.createdAt,
      read: notification.read,
      type: notification.relatedItem ? 
        (notification.relatedItem.type === 'lost' ? 'claim' : 'claim') : 
        (notification.relatedPost ? 'comment' : 'system'),
      link: notification.relatedItem ? 
        `/items/${notification.relatedItem._id}` : 
        (notification.relatedPost ? `/community/${notification.relatedPost._id}` : '/')
    }));
    
    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notificationId = req.params.notificationId;
    
    // Verify that the authenticated user is modifying their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this notification' });
    }
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to user
    if (notification.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this notification' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify that the authenticated user is modifying their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify these notifications' });
    }
    
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    
    res.json({ 
      success: true,
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verify that the authenticated user is deleting their own notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete these notifications' });
    }
    
    const result = await Notification.deleteMany({ user: userId });
    
    res.json({ 
      success: true,
      count: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
