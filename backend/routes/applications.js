const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { applicationValidation } = require('../utils/validators');
const { User, Student, Hostel, Room, Application, Notification } = require('../models');
const upload = require('../middleware/upload');
const { sendOTPEmail, sendWelcomeEmail, sendApplicationStatusEmail } = require('../utils/emailService');

// All routes are protected
router.use(protect);

// @route   POST /api/applications/upload
// @desc    Upload single document
// @access  Private (Student)
router.post('/upload', authorize('student'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/applications
// @desc    Submit new application
// @access  Private (Student)
router.post('/', authorize('student'), async (req, res) => {
  console.log('Application Request - Body:', JSON.stringify(req.body, null, 2));
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if preferred room exists (if specified)
    let preferredRoom = null;
    if (req.body.preferredRoom) {
      preferredRoom = await Room.findById(req.body.preferredRoom);
    }

    // Process documents - create proper document objects with URLs
    let documents = {};
    if (req.body.documents) {
      try {
        const parsedDocuments = typeof req.body.documents === 'string' 
          ? JSON.parse(req.body.documents) 
          : req.body.documents;
        
        documents = {
          idProof: parsedDocuments.idProof ? {
            name: 'ID Proof',
            url: parsedDocuments.idProof.url || `/uploads/documents/${student._id}_idproof_${Date.now()}.pdf`,
            uploadedAt: parsedDocuments.idProof.uploadedAt || new Date()
          } : null,
          addressProof: parsedDocuments.addressProof ? {
            name: 'Address Proof',
            url: parsedDocuments.addressProof.url || `/uploads/documents/${student._id}_addressproof_${Date.now()}.pdf`,
            uploadedAt: parsedDocuments.addressProof.uploadedAt || new Date()
          } : null,
          previousMarks: parsedDocuments.previousMarks ? {
            name: 'Previous Marks',
            url: parsedDocuments.previousMarks.url || `/uploads/documents/${student._id}_marks_${Date.now()}.pdf`,
            uploadedAt: parsedDocuments.previousMarks.uploadedAt || new Date()
          } : null
        };
      } catch (err) {
        console.log('Document parsing error:', err);
        documents = {};
      }
    }

    // Create application
    const application = await Application.create({
      student: student._id,
      user: req.user.id,
      roomType: req.body.roomType || 'any',
      preferredRoom: req.body.preferredRoom || null,
      roomInfo: req.body.roomInfo || {},
      personalInfo: req.body.personalInfo || {},
      emergencyContact: req.body.emergencyContact,
      purposeOfStay: req.body.purposeOfStay,
      specialRequirements: req.body.specialRequirements || '',
      documents: documents,
      remarks: req.body.remarks || '',
      paymentDetails: {
        paymentFrequency: req.body.paymentFrequency || 'monthly'
      }
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

// @route   GET /api/applications/my
// @desc    Get current student's applications
// @access  Private (Student)
router.get('/my', authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('preferredRoom', 'roomNumber type capacity')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
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
;

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
      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'Room not found'
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
        applicationStatus: 'approved'
      });

      // Populate roomInfo in application
      application.roomInfo = {
        roomNumber: room.roomNumber,
        roomType: room.type,
        floor: room.floor.toString(),
        capacity: room.capacity.toString(),
        price: room.price?.toString() || room.monthlyRent?.toString() || '0'
      };

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
      message: `Your hostel application has been approved${allocatedRoom ? ` and Room ${allocatedRoom.roomNumber} has been allocated` : ''}.`,
      type: 'success',
      relatedTo: { model: 'Application', id: application._id }
    });

    // Send email notification to student
    try {
      const student = await Student.findById(application.student._id).populate('user', 'name email');
      if (student && student.user && student.user.email) {
        await sendApplicationStatusEmail(
          student.user.email,
          student.user.name,
          'approved',
          adminRemarks,
          allocatedRoom
        );
      }
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

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
;

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
      message: `Your hostel application has been rejected. ${adminRemarks || ''}`,
      type: 'error',
      relatedTo: { model: 'Application', id: application._id }
    });

    // Send email notification to student
    try {
      const student = await Student.findById(application.student._id).populate('user', 'name email');
      if (student && student.user && student.user.email) {
        await sendApplicationStatusEmail(
          student.user.email,
          student.user.name,
          'rejected',
          adminRemarks
        );
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
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

// @route   PUT /api/applications/:id
// @desc    Update application status (simple approve/reject)
// @access  Private (Admin)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected.'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('student', 'user');

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
    application.status = status;
    application.processedBy = req.user.id;
    application.processedAt = Date.now();
    application.adminRemarks = req.body.adminRemarks || '';
    await application.save();

    // Update student application status
    await Student.findByIdAndUpdate(application.student._id, {
      applicationStatus: status
    });

    // Create notification for student
    await Notification.create({
      user: application.student.user,
      title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your hostel application has been ${status}.`,
      type: status === 'approved' ? 'success' : 'error',
      relatedTo: { model: 'Application', id: application._id }
    });

    // Send email notification to student
    try {
      const student = await Student.findById(application.student._id).populate('user', 'name email');
      if (student && student.user && student.user.email) {
        await sendApplicationStatusEmail(
          student.user.email,
          student.user.name,
          status,
          req.body.adminRemarks
        );
      }
    } catch (emailError) {
      console.error('Failed to send status email:', emailError);
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

module.exports = router;
