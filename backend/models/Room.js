const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide a room number'],
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Please specify the floor number'],
    min: 1
  },
  type: {
    type: String,
    enum: ['single', 'shared'],
    required: [true, 'Please specify room type']
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify room capacity'],
    min: 1
  },
  price: {
    type: Number,
    required: [true, 'Please specify monthly rent (PKR)'],
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available'
  },
  features: {
    ac: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    attachedBathroom: {
      type: Boolean,
      default: false
    },
    furnished: {
      type: Boolean,
      default: false
    }
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  occupiedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  isActive: {
    type: Boolean,
    default: true
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

// Unique index for room numbers
roomSchema.index({ roomNumber: 1 }, { unique: true });

// Update timestamp and status before saving
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Auto-update status based on occupancy
  if (this.occupiedSeats >= this.capacity) {
    this.status = 'occupied';
  } else if (this.occupiedSeats > 0) {
    this.status = 'available';
  } else {
    this.status = 'available';
  }

  next();
});

// Virtual for available seats
roomSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.occupiedSeats;
});

// Check if room has vacancy
roomSchema.methods.hasVacancy = function() {
  return this.occupiedSeats < this.capacity && this.status === 'available';
};

// Add occupant
roomSchema.methods.addOccupant = function(studentId) {
  if (this.occupiedSeats >= this.capacity) {
    throw new Error('Room is full');
  }
  if (!this.occupants.includes(studentId)) {
    this.occupants.push(studentId);
    this.occupiedSeats = this.occupants.length;
  }
};

// Remove occupant
roomSchema.methods.removeOccupant = function(studentId) {
  this.occupants = this.occupants.filter(
    id => id.toString() !== studentId.toString()
  );
  this.occupiedSeats = this.occupants.length;
};

module.exports = mongoose.model('Room', roomSchema);
