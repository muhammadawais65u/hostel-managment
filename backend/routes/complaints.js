const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { complaintValidation } = require('../utils/validators');
const { Complaint, Student, Notification, User } = require('../models');
const { sendComplaintEmail, sendComplaintAcknowledgmentEmail } = require('../utils/emailService');

// @route   POST /api/complaints/public
// @desc    Submit complaint from public contact page
// @access  Public
router.post('/public', async (req, res) => {
  try {
    const { name, email, title, description, category, priority } = req.body;

    // Validate required fields
    if (!name || !email || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, title, and description are required'
      });
    }

    // Create complaint without student/user association (public submission)
    const complaint = await Complaint.create({
      name,
      email,
      title,
      description,
      category: category || 'General',
      priority: priority || 'medium',
      status: 'pending',
      isPublic: true
    });

    // Send email to admin
    await sendComplaintEmail(name, email, title, description, category, priority);

    // Send acknowledgment email to the submitter
    await sendComplaintAcknowledgmentEmail(email, name, title);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error submitting public complaint:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// All routes below are protected
router.use(protect);

// @route   POST /api/complaints
// @desc    Submit complaint
// @access  Private (Student)
router.post('/', authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Create complaint with optional room info and target role
    const complaintData = {
      student: student._id,
      user: req.user.id,
      targetRole: req.body.targetRole || 'warden', // 'warden', 'admin', or 'both'
      isCritical: req.body.isCritical || false,
      ...req.body
    };

    // Only add room if it exists
    if (student.room) {
      complaintData.room = student.room;
    }

    const complaint = await Complaint.create(complaintData);

    // Send notifications based on target role
    if (req.body.targetRole === 'admin') {
      // Send to admin only
      const adminUsers = await User.find({ role: 'admin' });
      if (adminUsers && adminUsers.length > 0) {
        await Notification.create({
          user: adminUsers[0]._id,
          title: 'New Complaint',
          message: `A new ${req.body.category} complaint has been submitted by ${student.name || 'a student'}.`,
          type: 'complaint',
          relatedTo: { model: 'Complaint', id: complaint._id }
        });
      }
    } else if (req.body.targetRole === 'warden') {
      // Send to warden only
      const wardenUsers = await User.find({ role: 'warden' });
      if (wardenUsers && wardenUsers.length > 0) {
        await Notification.create({
          user: wardenUsers[0]._id,
          title: 'New Complaint',
          message: `A new ${req.body.category} complaint has been submitted by ${student.name || 'a student'}.`,
          type: 'complaint',
          relatedTo: { model: 'Complaint', id: complaint._id }
        });
      }
    } else if (req.body.targetRole === 'both') {
      // Send to both admin and warden
      const adminUsers = await User.find({ role: 'admin' });
      const wardenUsers = await User.find({ role: 'warden' });
      
      if (adminUsers && adminUsers.length > 0) {
        await Notification.create({
          user: adminUsers[0]._id,
          title: 'New Complaint',
          message: `A new ${req.body.category} complaint has been submitted by ${student.name || 'a student'}.`,
          type: 'complaint',
          relatedTo: { model: 'Complaint', id: complaint._id }
        });
      }
      
      if (wardenUsers && wardenUsers.length > 0) {
        await Notification.create({
          user: wardenUsers[0]._id,
          title: 'New Complaint',
          message: `A new ${req.body.category} complaint has been submitted by ${student.name || 'a student'}.`,
          type: 'complaint',
          relatedTo: { model: 'Complaint', id: complaint._id }
        });
      }
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
    const { status, category, priority, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter based on role
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      query.student = student._id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
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
      message,
      replyTo: req.body.replyTo || 'student' // 'student', 'admin', or 'warden'
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
