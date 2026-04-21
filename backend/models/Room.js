const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide a room number'],
    trim: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  floor: {
    type: Number,
    required: [true, 'Please specify the floor number'],
    min: 0
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad', 'dormitory'],
    required: [true, 'Please specify room type']
  },
  capacity: {
    type: Number,
    required: [true, 'Please specify room capacity'],
    min: 1
  },
  occupiedSeats: {
    type: Number,
    default: 0,
    min: 0
  },
  rentPerMonth: {
    type: Number,
    required: [true, 'Please specify monthly rent'],
    min: 0
  },
  facilities: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved'],
    default: 'available'
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

// Compound index to ensure unique room numbers per hostel
roomSchema.index({ roomNumber: 1, hostel: 1 }, { unique: true });

// Update timestamp and status before saving
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Auto-update status based on occupancy
  if (this.occupiedSeats >= this.capacity) {
    this.status = 'occupied';
  } else if (this.occupiedSeats > 0) {
    this.status = this.status === 'maintenance' ? 'maintenance' : 'available';
  } else if (this.status !== 'maintenance' && this.status !== 'reserved') {
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
