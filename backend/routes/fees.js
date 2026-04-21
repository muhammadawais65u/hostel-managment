const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Fee, Student, Notification } = require('../models');

// All routes are protected
router.use(protect);

// @route   POST /api/fees
// @desc    Create fee record (Admin only)
// @access  Private (Admin)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const {
      studentId,
      feeType,
      amount,
      month,
      year,
      semester,
      dueDate,
      remarks
    } = req.body;

    // Verify student exists
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (!student.hostel || !student.room) {
      return res.status(400).json({
        success: false,
        message: 'Student must have room allocation'
      });
    }

    const fee = await Fee.create({
      student: studentId,
      user: student.user._id,
      hostel: student.hostel,
      room: student.room,
      feeType,
      amount,
      month,
      year,
      semester,
      dueDate,
      remarks
    });

    // Notify student
    await Notification.create({
      user: student.user._id,
      title: 'New Fee Added',
      message: `A ${feeType.replace('_', ' ')} of ₹${amount} has been added for ${month} ${year}.`,
      type: 'fee',
      relatedTo: { model: 'Fee', id: fee._id }
    });

    res.status(201).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/fees
// @desc    Get all fees
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, student, hostel, month, year, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter based on role
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      query.student = studentProfile._id;
    }

    if (status) query.status = status;
    if (student) query.student = student;
    if (hostel) query.hostel = hostel;
    if (month) query.month = month;
    if (year) query.year = year;

    const fees = await Fee.find(query)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Calculate summary
    const totalAmount = await Fee.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidAmount = await Fee.aggregate([
      { $match: { ...query, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    const count = await Fee.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      summary: {
        totalAmount: totalAmount[0]?.total || 0,
        paidAmount: paidAmount[0]?.total || 0,
        pendingAmount: (totalAmount[0]?.total || 0) - (paidAmount[0]?.total || 0)
      },
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/fees/:id
// @desc    Get single fee
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber')
      .populate('verifiedBy', 'name');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    // Check access for students
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (fee.student._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this fee record'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/fees/:id/pay
// @desc    Upload fee payment (Student)
// @access  Private (Student)
router.put('/:id/pay', authorize('student'), async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;

    const student = await Student.findOne({ user: req.user.id });

    const fee = await Fee.findOne({
      _id: req.params.id,
      student: student._id
    });

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Fee is already paid'
      });
    }

    // Update fee with payment info
    fee.paidAmount = amount;
    fee.paymentMethod = paymentMethod;
    fee.transactionId = transactionId || '';
    fee.paidDate = Date.now();
    fee.status = amount >= fee.amount ? 'paid' : 'partial';

    await fee.save();

    // Notify admins
    const { User } = require('../models');
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'Payment Received',
        message: `A payment of ₹${amount} has been received from student. Please verify.`,
        type: 'fee',
        relatedTo: { model: 'Fee', id: fee._id }
      });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/fees/:id/verify
// @desc    Verify fee payment (Admin only)
// @access  Private (Admin)
router.put('/:id/verify', authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('user');

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    fee.verifiedBy = req.user.id;
    fee.verifiedAt = Date.now();
    fee.status = fee.paidAmount >= fee.amount ? 'paid' : 'partial';

    await fee.save();

    // Update student fee status
    const student = await Student.findOne({ user: fee.user });
    if (student) {
      const pendingFees = await Fee.countDocuments({
        student: student._id,
        status: { $nin: ['paid', 'waived'] }
      });

      student.feeStatus = pendingFees === 0 ? 'paid' : (fee.paidAmount > 0 ? 'partial' : 'unpaid');
      await student.save();
    }

    // Notify student
    await Notification.create({
      user: fee.user,
      title: 'Payment Verified',
      message: `Your payment of ₹${fee.paidAmount} has been verified.`,
      type: 'success',
      relatedTo: { model: 'Fee', id: fee._id }
    });

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/fees/:id
// @desc    Delete fee record (Admin only)
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found'
      });
    }

    await fee.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fee record deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
