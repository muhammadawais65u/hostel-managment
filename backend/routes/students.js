const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { studentValidation } = require('../utils/validators');
const { User, Student, Application, Complaint, Fee, Notification } = require('../models');

// All routes are protected and student-only
router.use(protect);
router.use(authorize('student'));

// @route   GET /api/students/dashboard
// @desc    Get student dashboard data
// @access  Private (Student)
router.get('/dashboard', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('room', 'roomNumber type capacity');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Get counts
    const applicationCount = await Application.countDocuments({ student: student._id });
    const pendingApplication = await Application.findOne({
      student: student._id,
      status: 'pending'
    });

    const complaintCount = await Complaint.countDocuments({ student: student._id });
    const resolvedComplaints = await Complaint.countDocuments({
      student: student._id,
      status: 'resolved'
    });

    const totalFees = await Fee.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paidFees = await Fee.aggregate([
      { $match: { student: student._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    const totalAmount = totalFees[0]?.total || 0;
    const paidAmount = paidFees[0]?.total || 0;

    // Get recent notifications
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          applicationCount,
          hasPendingApplication: !!pendingApplication,
          complaintCount,
          resolvedComplaints,
          totalFees: totalAmount,
          paidFees: paidAmount,
          pendingFees: totalAmount - paidAmount
        },
        notifications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/students/profile
// @desc    Get student profile
// @access  Private (Student)
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('room', 'roomNumber type floor');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/students/profile
// @desc    Update student profile
// @access  Private (Student)
router.put('/profile', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'phone', 'dateOfBirth', 'address', 'emergencyContact'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/students/applications
// @desc    Get student's applications
// @access  Private (Student)
router.get('/applications', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    const applications = await Application.find({ student: student._id })
      .populate('hostel', 'name code type')
      .populate('preferredRoom', 'roomNumber type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/students/complaints
// @desc    Get student's complaints
// @access  Private (Student)
router.get('/complaints', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    const complaints = await Complaint.find({ student: student._id })
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/students/fees
// @desc    Get student's fees
// @access  Private (Student)
router.get('/fees', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    const fees = await Fee.find({ student: student._id })
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);

    res.status(200).json({
      success: true,
      count: fees.length,
      data: {
        fees,
        summary: {
          totalAmount,
          paidAmount,
          pendingAmount: totalAmount - paidAmount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/students/notifications
// @desc    Get student's notifications
// @access  Private (Student)
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/students/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Student)
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true, readAt: Date.now() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
