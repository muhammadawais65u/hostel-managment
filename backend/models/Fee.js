const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
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
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  feeType: {
    type: String,
    enum: ['hostel_fee', 'mess_fee', 'security_deposit', 'maintenance_fee', 'other'],
    required: [true, 'Please specify fee type']
  },
  amount: {
    type: Number,
    required: [true, 'Please specify amount'],
    min: 0
  },
  month: {
    type: String,
    required: [true, 'Please specify month']
  },
  year: {
    type: Number,
    required: [true, 'Please specify year']
  },
  semester: {
    type: String
  },
  status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'waived', 'refunded'],
    default: 'unpaid'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date,
    required: [true, 'Please specify due date']
  },
  paidDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'cheque', 'online', ''],
    default: ''
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  receipt: {
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  remarks: {
    type: String,
    trim: true
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
feeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Update status based on payment
  if (this.paidAmount >= this.amount) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  }

  next();
});

// Calculate balance
feeSchema.methods.getBalance = function() {
  return this.amount - this.paidAmount;
};

// Check if overdue
feeSchema.methods.isOverdue = function() {
  return this.status !== 'paid' && new Date() > this.dueDate;
};

// Index for faster queries
feeSchema.index({ student: 1, status: 1 });
feeSchema.index({ hostel: 1, status: 1 });
feeSchema.index({ dueDate: 1 });
feeSchema.index({ year: 1, month: 1 });

module.exports = mongoose.model('Fee', feeSchema);
