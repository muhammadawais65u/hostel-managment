const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { complaintValidation } = require('../utils/validators');
const { Complaint, Student, Notification } = require('../models');

// All routes are protected
router.use(protect);

// @route   POST /api/complaints
// @desc    Submit complaint
// @access  Private (Student)
router.post('/', authorize('student'), complaintValidation, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    if (!student.hostel) {
      return res.status(400).json({
        success: false,
        message: 'You must be allocated to a hostel to submit complaints'
      });
    }

    const complaint = await Complaint.create({
      student: student._id,
      user: req.user.id,
      hostel: student.hostel,
      room: student.room,
      ...req.body
    });

    // Notify wardens
    const { Hostel } = require('../models');
    const hostel = await Hostel.findById(student.hostel).populate('warden');

    if (hostel && hostel.warden) {
      await Notification.create({
        user: hostel.warden._id,
        title: 'New Complaint',
        message: `A new ${req.body.category} complaint has been submitted.`,
        type: 'complaint',
        relatedTo: { model: 'Complaint', id: complaint._id }
      });
    }

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, hostel, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter based on role
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      query.student = student._id;
    } else if (req.user.role === 'warden') {
      // Wardens see complaints for their assigned hostels
      const { Hostel } = require('../models');
      const hostels = await Hostel.find({ warden: req.user.id });
      query.hostel = { $in: hostels.map(h => h._id) };
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (hostel) query.hostel = hostel;

    const complaints = await Complaint.find(query)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber')
      .populate('assignedTo', 'name')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber')
      .populate({
        path: 'comments.user',
        select: 'name role'
      })
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check access
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (complaint.student._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this complaint'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Admin, Warden)
router.put('/:id/status', authorize('admin', 'warden'), async (req, res) => {
  try {
    const { status, resolution } = req.body;

    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'user');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update fields
    complaint.status = status;

    if (resolution) {
      complaint.resolution = resolution;
    }

    if (status === 'resolved' || status === 'closed') {
      complaint.resolvedBy = req.user.id;
      complaint.resolvedAt = Date.now();
    }

    if (status === 'under_review' || status === 'in_progress') {
      complaint.assignedTo = req.user.id;
    }

    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.student.user,
      title: `Complaint ${status.replace('_', ' ').toUpperCase()}`,
      message: `Your complaint "${complaint.title}" has been ${status.replace('_', ' ')}.`,
      type: status === 'resolved' ? 'success' : 'info',
      relatedTo: { model: 'Complaint', id: complaint._id }
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/complaints/:id/comments
// @desc    Add comment to complaint
// @access  Private
router.post('/:id/comments', async (req, res) => {
  try {
    const { message } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check access for students
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (complaint.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to comment on this complaint'
        });
      }
    }

    complaint.comments.push({
      user: req.user.id,
      message
    });

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete complaint
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
