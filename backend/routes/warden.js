const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Hostel, Room, Student, Complaint, Application, Notification } = require('../models');

// All routes are protected and warden-only
router.use(protect);
router.use(authorize('warden'));

// @route   GET /api/warden/dashboard
// @desc    Get warden dashboard data
// @access  Private (Warden)
router.get('/dashboard', async (req, res) => {
  try {
    // Get assigned hostels
    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id);

    if (hostels.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hostels: [],
          message: 'No hostels assigned yet'
        }
      });
    }

    // Get stats for each hostel
    const hostelData = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostel: hostel._id });
        const totalRooms = rooms.length;
        const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
        const occupiedSeats = rooms.reduce((sum, room) => sum + room.occupiedSeats, 0);

        const students = await Student.countDocuments({ hostel: hostel._id });
        const pendingComplaints = await Complaint.countDocuments({
          hostel: hostel._id,
          status: { $nin: ['resolved', 'closed'] }
        });

        return {
          id: hostel._id,
          name: hostel.name,
          code: hostel.code,
          type: hostel.type,
          stats: {
            totalRooms,
            totalCapacity,
            occupiedSeats,
            availableSeats: totalCapacity - occupiedSeats,
            occupancyRate: totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0,
            students,
            pendingComplaints
          }
        };
      })
    );

    // Recent complaints for assigned hostels
    const recentComplaints = await Complaint.find({
      hostel: { $in: hostelIds },
      status: { $nin: ['resolved', 'closed'] }
    })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('hostel', 'name')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent room allocations
    const recentAllocations = await Student.find({
      hostel: { $in: hostelIds },
      room: { $ne: null }
    })
      .populate('user', 'name email')
      .populate('room', 'roomNumber')
      .populate('hostel', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        hostels: hostelData,
        recentComplaints,
        recentAllocations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/warden/hostels
// @desc    Get warden's assigned hostels
// @access  Private (Warden)
router.get('/hostels', async (req, res) => {
  try {
    const hostels = await Hostel.find({ warden: req.user.id })
      .populate({
        path: 'warden',
        select: 'name email phone'
      });

    res.status(200).json({
      success: true,
      count: hostels.length,
      data: hostels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/warden/rooms
// @desc    Get rooms for warden's hostels
// @access  Private (Warden)
router.get('/rooms', async (req, res) => {
  try {
    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id);

    const { status, floor, hasVacancy } = req.query;

    let query = { hostel: { $in: hostelIds } };
    if (status) query.status = status;
    if (floor !== undefined) query.floor = floor;

    let rooms = await Room.find(query)
      .populate('hostel', 'name code')
      .populate({
        path: 'occupants',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ hostel: 1, floor: 1, roomNumber: 1 });

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
      message: error.message
    });
  }
});

// @route   GET /api/warden/students
// @desc    Get students for warden's hostels
// @access  Private (Warden)
router.get('/students', async (req, res) => {
  try {
    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id);

    const { room, page = 1, limit = 10 } = req.query;

    let query = { hostel: { $in: hostelIds } };
    if (room) query.room = room;

    const students = await Student.find(query)
      .populate('user', 'name email phone')
      .populate('hostel', 'name code')
      .populate('room', 'roomNumber floor')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/warden/complaints
// @desc    Get complaints for warden's hostels
// @access  Private (Warden)
router.get('/complaints', async (req, res) => {
  try {
    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id);

    const { status, priority, category, page = 1, limit = 10 } = req.query;

    let query = { hostel: { $in: hostelIds } };
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
      .populate('hostel', 'name')
      .populate('room', 'roomNumber')
      .populate('assignedTo', 'name')
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

// @route   PUT /api/warden/complaints/:id/assign
// @desc    Assign complaint to self
// @access  Private (Warden)
router.put('/complaints/:id/assign', async (req, res) => {
  try {
    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id.toString());

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if complaint belongs to warden's hostel
    if (!hostelIds.includes(complaint.hostel.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this complaint'
      });
    }

    complaint.assignedTo = req.user.id;
    complaint.status = 'in_progress';
    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.user,
      title: 'Complaint Assigned',
      message: 'Your complaint is now being handled by the warden.',
      type: 'info',
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

// @route   PUT /api/warden/complaints/:id/resolve
// @desc    Resolve complaint
// @access  Private (Warden)
router.put('/complaints/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id.toString());

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (!hostelIds.includes(complaint.hostel.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this complaint'
      });
    }

    complaint.status = 'resolved';
    complaint.resolution = resolution;
    complaint.resolvedBy = req.user.id;
    complaint.resolvedAt = Date.now();
    await complaint.save();

    // Notify student
    await Notification.create({
      user: complaint.user,
      title: 'Complaint Resolved',
      message: `Your complaint has been resolved: ${resolution}`,
      type: 'success',
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

// @route   PUT /api/warden/rooms/:id/allocate
// @desc    Allocate student to room
// @access  Private (Warden)
router.put('/rooms/:id/allocate', async (req, res) => {
  try {
    const { studentId } = req.body;

    const hostels = await Hostel.find({ warden: req.user.id });
    const hostelIds = hostels.map(h => h._id.toString());

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room belongs to warden's hostel
    if (!hostelIds.includes(room.hostel.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this room'
      });
    }

    if (!room.hasVacancy()) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Remove from previous room if exists
    if (student.room) {
      const prevRoom = await Room.findById(student.room);
      if (prevRoom) {
        prevRoom.removeOccupant(studentId);
        await prevRoom.save();
      }
    }

    // Add to new room
    room.addOccupant(studentId);
    await room.save();

    // Update student
    student.room = room._id;
    student.hostel = room.hostel;
    await student.save();

    // Notify student
    await Notification.create({
      user: student.user,
      title: 'Room Allocated',
      message: `You have been allocated to Room ${room.roomNumber}.`,
      type: 'success',
      relatedTo: { model: 'Room', id: room._id }
    });

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
