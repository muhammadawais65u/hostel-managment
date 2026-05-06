const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad', 'any'],
    default: 'any'
  },
  preferredRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'waitlisted'],
    default: 'pending'
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required']
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    }
  },
  purposeOfStay: {
    type: String,
    enum: ['education', 'job', 'internship', 'training', 'other'],
    required: [true, 'Purpose of stay is required']
  },
  specialRequirements: {
    type: String,
    trim: true,
    default: ''
  },
  documents: {
    idProof: {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    addressProof: {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    previousMarks: {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  remarks: {
    type: String,
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Please specify semester']
  },
  academicYear: {
    type: String,
    required: [true, 'Please specify academic year']
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
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ hostel: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
