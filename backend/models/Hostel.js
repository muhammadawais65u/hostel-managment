const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a hostel name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please provide a hostel code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls', 'co-ed', 'research', 'staff'],
    required: [true, 'Please specify hostel type']
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  warden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  facilities: [{
    type: String,
    trim: true
  }],
  totalRooms: {
    type: Number,
    default: 0
  },
  totalCapacity: {
    type: Number,
    default: 0
  },
  occupiedSeats: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
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
hostelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for available seats
hostelSchema.virtual('availableSeats').get(function() {
  return this.totalCapacity - this.occupiedSeats;
});

// Calculate occupancy percentage
hostelSchema.methods.getOccupancyPercentage = function() {
  if (this.totalCapacity === 0) return 0;
  return Math.round((this.occupiedSeats / this.totalCapacity) * 100);
};

module.exports = mongoose.model('Hostel', hostelSchema);
