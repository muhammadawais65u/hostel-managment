const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please provide a roll number'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Please provide a semester'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please provide the year of study'],
    min: 1,
    max: 6
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please specify gender']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    default: null
  },
  applicationStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  feeStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
