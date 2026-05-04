const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const { roomValidation } = require('../utils/validators');
const { Room, Student } = require('../models');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/images/rooms');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, type, floor, hasVacancy } = req.query;

    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (floor !== undefined) query.floor = floor;

    let roomsQuery = Room.find(query);

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
router.post('/', authorize('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const roomData = { ...req.body };
    
    // Handle images
    if (req.files && req.files.length > 0) {
      roomData.images = req.files.map(file => `/public/images/rooms/${file.filename}`);
    }
    
    // Parse features if sent as string
    if (roomData.features && typeof roomData.features === 'string') {
      roomData.features = JSON.parse(roomData.features);
    }
    
    const room = await Room.create(roomData);

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
router.put('/:id', authorize('admin', 'warden'), upload.array('images', 5), async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const roomData = { ...req.body };
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/public/images/rooms/${file.filename}`);
      
      // Keep existing images and add new ones
      roomData.images = [...(room.images || []), ...newImages];
    }
    
    // Parse features if sent as string
    if (roomData.features && typeof roomData.features === 'string') {
      roomData.features = JSON.parse(roomData.features);
    }
    
    room = await Room.findByIdAndUpdate(
      req.params.id,
      roomData,
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
      }
    }

    // Add to new room
    room.addOccupant(studentId);
    await room.save();

    // Update student
    student.room = room._id;
    await student.save();

    
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
