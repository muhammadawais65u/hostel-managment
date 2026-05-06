const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { applicationValidation } = require('../utils/validators');
const { User, Student, Hostel, Room, Application, Notification } = require('../models');

// All routes are protected
router.use(protect);

// @route   POST /api/applications
// @desc    Submit hostel application
// @access  Private (Student)
router.post('/', authorize('student'), applicationValidation, async (req, res) => {
  console.log('Application Request - User:', req.user.id);
  console.log('Application Request - Body:', JSON.stringify(req.body, null, 2));
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if student already has a pending or approved application
    const existingApp = await Application.findOne({
      student: student._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active application'
      });
    }

    // Check if preferred room exists (if specified)
    let preferredRoom = null;
    if (req.body.preferredRoom) {
      preferredRoom = await Room.findById(req.body.preferredRoom);
    }

    // Create application
    const application = await Application.create({
      student: student._id,
      user: req.user.id,
      roomType: req.body.roomType || 'any',
      preferredRoom: req.body.preferredRoom || null,
      semester: req.body.semester,
      academicYear: req.body.academicYear,
      emergencyContact: req.body.emergencyContact,
      purposeOfStay: req.body.purposeOfStay,
      specialRequirements: req.body.specialRequirements || '',
      documents: req.body.documents || {},
      remarks: req.body.remarks || ''
    });

    // Update student application status
    student.applicationStatus = 'pending';
    await student.save();

    // Create notification for student
    await Notification.create({
      user: req.user.id,
      title: 'Application Submitted',
      message: `Your application has been submitted and is pending review.`,
      type: 'application',
      relatedTo: { model: 'Application', id: application._id }
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Application Received',
        message: `A new application has been submitted by ${req.user.name}.`,
        type: 'application',
        relatedTo: { model: 'Application', id: application._id }
      });
    }

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/applications
// @desc    Get all applications (Admin only)
// @access  Private (Admin)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { status, hostel, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (hostel) query.hostel = hostel;

    const applications = await Application.find(query)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('hostel', 'name code type')
      .populate('preferredRoom', 'roomNumber type')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    let query = { _id: req.params.id };

    // If student, only show their own applications
    if (req.user.role === 'student') {
      query.student = student._id;
    }

    const application = await Application.findOne(query)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('hostel', 'name code type location facilities')
      .populate('preferredRoom', 'roomNumber type capacity')
      .populate('processedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/applications/:id/approve
// @desc    Approve application and allocate room
// @access  Private (Admin)
router.put('/:id/approve', authorize('admin'), async (req, res) => {
  try {
    const { roomId, adminRemarks } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('student', 'user')
      .populate('hostel', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`
      });
    }

    // Allocate room if provided
    let allocatedRoom = null;
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room || room.hostel.toString() !== application.hostel._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid room for this hostel'
        });
      }

      if (room.occupiedSeats >= room.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Room is already full'
        });
      }

      // Add student to room
      room.occupants.push(application.student._id);
      room.occupiedSeats = room.occupants.length;
      await room.save();

      // Update student
      await Student.findByIdAndUpdate(application.student._id, {
        room: room._id,
        hostel: application.hostel._id,
        applicationStatus: 'approved'
      });

      allocatedRoom = room;
    }

    // Update application
    application.status = 'approved';
    application.processedBy = req.user.id;
    application.processedAt = Date.now();
    application.adminRemarks = adminRemarks || '';
    await application.save();

    // Create notification for student
    await Notification.create({
      user: application.student.user,
      title: 'Application Approved',
      message: `Your hostel application for ${application.hostel.name} has been approved${allocatedRoom ? ` and Room ${allocatedRoom.roomNumber} has been allocated` : ''}.`,
      type: 'success',
      relatedTo: { model: 'Application', id: application._id }
    });

    res.status(200).json({
      success: true,
      data: application,
      allocatedRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/applications/:id/reject
// @desc    Reject application
// @access  Private (Admin)
router.put('/:id/reject', authorize('admin'), async (req, res) => {
  try {
    const { adminRemarks } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('student', 'user')
      .populate('hostel', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Application is already ${application.status}`
      });
    }

    // Update application
    application.status = 'rejected';
    application.processedBy = req.user.id;
    application.processedAt = Date.now();
    application.adminRemarks = adminRemarks || '';
    await application.save();

    // Update student
    await Student.findByIdAndUpdate(application.student._id, {
      applicationStatus: 'rejected'
    });

    // Create notification for student
    await Notification.create({
      user: application.student.user,
      title: 'Application Rejected',
      message: `Your hostel application for ${application.hostel.name} has been rejected. ${adminRemarks || ''}`,
      type: 'error',
      relatedTo: { model: 'Application', id: application._id }
    });

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application (Admin only)
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Application deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
