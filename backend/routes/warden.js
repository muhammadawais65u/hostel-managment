const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Room, Student, Complaint, Application, Notification, User } = require('../models');

// All routes are protected and warden-only
router.use(protect);
router.use(authorize('warden'));

// @route   GET /api/warden/dashboard
// @desc    Get warden dashboard data
// @access  Private (Warden)
router.get('/dashboard', async (req, res) => {
  try {
    // Get all rooms (without hostel restriction)
    const rooms = await Room.find({});
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const occupiedSeats = rooms.reduce((sum, room) => sum + room.occupiedSeats, 0);

    const students = await Student.countDocuments({ room: { $ne: null } });
    const pendingComplaints = await Complaint.countDocuments({
      status: { $nin: ['resolved', 'closed'] }
    });

    // Recent complaints
    const recentComplaints = await Complaint.find({
      status: { $nin: ['resolved', 'closed'] }
    })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent room allocations
    const recentAllocations = await Student.find({
      room: { $ne: null }
    })
      .populate('user', 'name email')
      .populate('room', 'roomNumber')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRooms,
          totalCapacity,
          occupiedSeats,
          availableSeats: totalCapacity - occupiedSeats,
          totalStudents: students,
          pendingComplaints,
          occupancyRate: totalCapacity > 0 ? ((occupiedSeats / totalCapacity) * 100).toFixed(1) : 0
        },
        recentComplaints,
        recentAllocations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/warden/rooms
// @desc    Get all rooms
// @access  Private (Warden)
router.get('/rooms', async (req, res) => {
  try {
    const { status, floor, hasVacancy } = req.query;

    let query = {};
    if (status) query.status = status;
    if (floor !== undefined) query.floor = floor;

    let rooms = await Room.find(query)
      .populate({
        path: 'occupants',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ floor: 1, roomNumber: 1 });

    if (hasVacancy === 'true') {
      rooms = rooms.filter(room => room.hasVacancy());
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/warden/students
// @desc    Get all students
// @access  Private (Warden)
router.get('/students', async (req, res) => {
  try {
    const { room, page = 1, limit = 10 } = req.query;

    let query = {};
    if (room) query.room = room;

    const students = await Student.find(query)
      .populate('user', 'name email phone role')
      .populate('room', 'roomNumber floor')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/warden/complaints
// @desc    Get all complaints
// @access  Private (Warden)
router.get('/complaints', async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

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
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/warden/complaints/:id/assign
// @desc    Assign complaint to self
// @access  Private (Warden)
router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if already assigned
    if (complaint.assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Complaint already assigned'
      });
    }

    // Assign to warden
    complaint.assignedTo = req.user.id;
    complaint.status = 'in-progress';
    await complaint.save();

    // Create notification
    await Notification.create({
      user: complaint.student,
      title: 'Complaint Assigned',
      message: `Your complaint has been assigned to ${req.user.name}`,
      type: 'complaint'
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/warden/complaints/:id/resolve
// @desc    Resolve complaint
// @access  Private (Warden)
router.put('/complaints/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update complaint
    complaint.status = 'resolved';
    complaint.resolution = resolution;
    complaint.resolvedAt = new Date();
    await complaint.save();

    // Create notification
    await Notification.create({
      user: complaint.student,
      title: 'Complaint Resolved',
      message: `Your complaint has been resolved: ${resolution}`,
      type: 'complaint'
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/warden/rooms/:id/allocate
// @desc    Allocate student to room
// @access  Private (Warden)
router.put('/rooms/:id/allocate', async (req, res) => {
try {
  const { studentId } = req.body;

  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  const student = await Student.findById(studentId);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Check if room has vacancy
  if (!room.hasVacancy()) {
    return res.status(400).json({
      success: false,
      message: 'Room is already full'
    });
  }

  // Update student
  student.room = room._id;
  await student.save();

  // Notify student
  await Notification.create({
    user: student.user,
    title: 'Room Allocated',
    message: `You have been allocated to room ${room.roomNumber}`,
    type: 'allocation'
  });

  res.status(200).json({
    success: true,
    data: student
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: error.message
  });
}
});

// @route   GET /api/warden/occupied-rooms
// @desc    Get occupied rooms with student data (without payment info)
// @access  Private (Warden)
router.get('/occupied-rooms', async (req, res) => {
  try {
    // Get all paid applications with room info
    const paidApplications = await Application.find({
      paymentStatus: 'paid',
      'roomInfo.roomNumber': { $exists: true, $ne: '' }
    })
    .populate('student', 'name email')
    .sort({ 'paymentDetails.paymentDate': -1 });

    // Group by room and extract student info (without payment details)
    const roomsWithStudents = {};
    
    // First, collect all unique room numbers
    const roomNumbers = [...new Set(paidApplications.map(app => app.roomInfo?.roomNumber).filter(Boolean))];
    
    // Find room details for all rooms
    const rooms = await Room.find({ roomNumber: { $in: roomNumbers } });
    
    // Initialize rooms object
    roomNumbers.forEach(roomNumber => {
      const room = rooms.find(r => r.roomNumber === roomNumber);
      const firstAppForRoom = paidApplications.find(app => app.roomInfo?.roomNumber === roomNumber);
      roomsWithStudents[roomNumber] = {
        roomNumber,
        capacity: room?.capacity || 1,
        type: room?.type || 'single',
        monthlyRent: room?.monthlyRent || firstAppForRoom?.paymentDetails?.amount || 0,
        floor: room?.floor || 1,
        hostel: room?.hostel || { name: 'Unknown Hostel' },
        features: room?.features || {},
        students: []
      };
    });
    
    // Add students to rooms
    paidApplications.forEach(app => {
      const roomNumber = app.roomInfo?.roomNumber;
      if (!roomNumber || !roomsWithStudents[roomNumber]) return;

      console.log('Processing app:', app);
      console.log('Student data:', app.student);
      console.log('Personal info:', app.personalInfo);

      // Add student if not already added
      const studentExists = roomsWithStudents[roomNumber].students.some(s => s.email === app.student?.email);
      if (!studentExists && app.student) {
        const studentName = app.student.name || app.personalInfo?.name || 'Unknown Student';
        console.log('Adding student:', studentName);
        
        roomsWithStudents[roomNumber].students.push({
          name: studentName,
          email: app.student.email,
          rollNumber: app.personalInfo?.rollNumber,
          department: app.personalInfo?.department
        });
      }
    });

    const occupiedRooms = Object.values(roomsWithStudents);

    res.status(200).json({
      success: true,
      data: occupiedRooms
    });
  } catch (error) {
    console.error('Warden occupied rooms error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/warden/complaints/:id/reassign
// @desc    Reassign complaint to admin (for critical complaints)
// @access  Private (Warden)
router.put('/complaints/:id/reassign', async (req, res) => {
  try {
    const { reassignmentReason } = req.body;
    
    if (!reassignmentReason) {
      return res.status(400).json({
        success: false,
        message: 'Reassignment reason is required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Find admin user to reassign to
    const adminUsers = await User.find({ role: 'admin' });
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin users found to reassign to'
      });
    }

    // Update complaint with reassignment info
    complaint.reassignedTo = adminUsers[0]._id;
    complaint.reassignedBy = req.user.id;
    complaint.reassignedAt = new Date();
    complaint.reassignmentReason = reassignmentReason;
    complaint.status = 'in_progress';
    complaint.assignedTo = adminUsers[0]._id;
    
    await complaint.save();

    // Create notification for admin
    await Notification.create({
      user: adminUsers[0]._id,
      title: 'Complaint Reassigned',
      message: `A critical complaint has been reassigned to you by ${req.user.name}. Reason: ${reassignmentReason}`,
      type: 'complaint',
      relatedTo: { model: 'Complaint', id: complaint._id }
    });

    // Create notification for student
    if (complaint.student) {
      const student = await Student.findById(complaint.student).populate('user');
      if (student && student.user) {
        await Notification.create({
          user: student.user._id,
          title: 'Complaint Reassigned',
          message: `Your complaint has been reassigned to admin for review. Reason: ${reassignmentReason}`,
          type: 'complaint',
          relatedTo: { model: 'Complaint', id: complaint._id }
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Complaint reassigned to admin successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Reassignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/warden/report-issue
// @desc    Report an issue to admin
// @access  Private (Warden)
router.post('/report-issue', async (req, res) => {
  try {
    const { complaintId, message, priority } = req.body;
    
    if (!complaintId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and message are required'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Find admin user to notify
    const adminUsers = await User.find({ role: 'admin' });
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin users found to report to'
      });
    }

    // Create notification for admin
    await Notification.create({
      user: adminUsers[0]._id,
      title: 'Issue Reported by Warden',
      message: message,
      type: 'complaint',
      relatedTo: { model: 'Complaint', id: complaint._id },
      priority: priority || 'medium'
    });

    // Add a comment to the complaint about the report
    complaint.comments.push({
      user: req.user._id,
      message: message,
      createdAt: new Date()
    });
    
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Issue reported to admin successfully',
      data: {
        complaintId,
        reportedTo: adminUsers[0]._id,
        message
      }
    });
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
