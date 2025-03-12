
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'resolved', 'rejected', 'lost', 'found', 'approved'],
    default: 'pending'
  },
  itemType: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  images: [{
    type: String
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isHighValue: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  lostDate: {
    type: Date
  },
  foundDate: {
    type: Date
  },
  contactInfo: {
    type: String,
    trim: true
  }
});

// Add text index for search functionality
itemSchema.index({ title: 'text', description: 'text', category: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
