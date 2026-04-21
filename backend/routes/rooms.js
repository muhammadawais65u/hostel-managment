const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { roomValidation } = require('../utils/validators');
const { Room, Hostel, Student } = require('../models');

// Public routes

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { hostel, status, type, floor, hasVacancy } = req.query;

    let query = {};
    if (hostel) query.hostel = hostel;
    if (status) query.status = status;
    if (type) query.type = type;
    if (floor !== undefined) query.floor = floor;

    let roomsQuery = Room.find(query).populate('hostel', 'name code type');

    // If hasVacancy is true, filter for rooms with available seats
    if (hasVacancy === 'true') {
      const allRooms = await roomsQuery;
      const roomsWithVacancy = allRooms.filter(room => room.hasVacancy());

      return res.status(200).json({
        success: true,
        count: roomsWithVacancy.length,
        data: roomsWithVacancy
      });
    }

    const rooms = await roomsQuery.sort({ floor: 1, roomNumber: 1 });

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

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hostel', 'name code type warden')
      .populate({
        path: 'occupants',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

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

// Protected routes
router.use(protect);

// @route   POST /api/rooms
// @desc    Create new room
// @access  Private (Admin)
router.post('/', authorize('admin'), roomValidation, async (req, res) => {
  try {
    // Verify hostel exists
    const hostel = await Hostel.findById(req.body.hostel);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    const room = await Room.create(req.body);

    // Update hostel room count
    hostel.totalRooms += 1;
    hostel.totalCapacity += room.capacity;
    await hostel.save();

    res.status(201).json({
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

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Admin, Warden)
router.put('/:id', authorize('admin', 'warden'), async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // If capacity is being changed, update hostel totals
    if (req.body.capacity && req.body.capacity !== room.capacity) {
      const hostel = await Hostel.findById(room.hostel);
      hostel.totalCapacity = hostel.totalCapacity - room.capacity + req.body.capacity;
      await hostel.save();
    }

    room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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

// @route   PUT /api/rooms/:id/allocate
// @desc    Allocate student to room
// @access  Private (Admin, Warden)
router.put('/:id/allocate', authorize('admin', 'warden'), async (req, res) => {
  try {
    const { studentId } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room has vacancy
    if (!room.hasVacancy()) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if student is already in another room
    if (student.room) {
      // Remove from previous room
      const prevRoom = await Room.findById(student.room);
      if (prevRoom) {
        prevRoom.removeOccupant(studentId);
        await prevRoom.save();

        // Update hostel occupied seats
        const prevHostel = await Hostel.findById(prevRoom.hostel);
        prevHostel.occupiedSeats -= 1;
        await prevHostel.save();
      }
    }

    // Add to new room
    room.addOccupant(studentId);
    await room.save();

    // Update student
    student.room = room._id;
    student.hostel = room.hostel;
    await student.save();

    // Update hostel occupied seats
    const hostel = await Hostel.findById(room.hostel);
    hostel.occupiedSeats += 1;
    await hostel.save();

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

// @route   PUT /api/rooms/:id/vacate
// @desc    Vacate student from room
// @access  Private (Admin, Warden)
router.put('/:id/vacate', authorize('admin', 'warden'), async (req, res) => {
  try {
    const { studentId } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if student is in this room
    const student = await Student.findById(studentId);
    if (!student || !student.room || student.room.toString() !== room._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Student is not allocated to this room'
      });
    }

    // Remove from room
    room.removeOccupant(studentId);
    await room.save();

    // Update student
    student.room = null;
    student.hostel = null;
    await student.save();

    // Update hostel occupied seats
    const hostel = await Hostel.findById(room.hostel);
    hostel.occupiedSeats -= 1;
    await hostel.save();

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

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Admin)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room has occupants
    if (room.occupants.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with occupants'
      });
    }

    // Update hostel totals
    const hostel = await Hostel.findById(room.hostel);
    hostel.totalRooms -= 1;
    hostel.totalCapacity -= room.capacity;
    await hostel.save();

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Room deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
