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
  roomInfo: {
    roomNumber: { type: String, default: '' },
    roomType: { type: String, default: '' },
    floor: { type: String, default: '' },
    capacity: { type: String, default: '' },
    price: { type: String, default: '' }
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' }
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  adminRemarks: {
    type: String,
    trim: true,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    cardLastFour: { type: String, default: '' },
    cardholderName: { type: String, default: '' },
    paymentDate: { type: Date, default: null },
    nextPaymentDate: { type: Date, default: null },
    paymentFrequency: { type: String, enum: ['monthly', 'quarterly', 'semester', 'yearly', 'one-time', 'custom'], default: null },
    customAmount: { type: Number, default: null },
    rescheduleReason: { type: String, default: '' },
    rescheduledAt: { type: Date, default: null },
    rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
    department: { type: String, default: '' },
    rollNumber: { type: String, default: '' }
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
