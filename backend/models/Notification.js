const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a notification title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide a notification message'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'application', 'fee', 'complaint', 'room'],
    default: 'info'
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Application', 'Fee', 'Complaint', 'Room', 'Hostel', '']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isArchived: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
