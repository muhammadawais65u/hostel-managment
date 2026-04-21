const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { hostelValidation } = require('../utils/validators');
const { Hostel, Room, Student, User } = require('../models');

// Public routes

// @route   GET /api/hostels
// @desc    Get all hostels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, isActive = true } = req.query;

    let query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const hostels = await Hostel.find(query)
      .populate('warden', 'name email phone')
      .sort({ name: 1 });

    // Add room counts
    const hostelsWithStats = await Promise.all(
      hostels.map(async (hostel) => {
        const rooms = await Room.find({ hostel: hostel._id });
        const totalRooms = rooms.length;
        const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
        const occupiedSeats = rooms.reduce((sum, room) => sum + room.occupiedSeats, 0);

        return {
          ...hostel.toObject(),
          stats: {
            totalRooms,
            totalCapacity,
            occupiedSeats,
            availableSeats: totalCapacity - occupiedSeats,
            occupancyRate: totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: hostelsWithStats.length,
      data: hostelsWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/hostels/:id
// @desc    Get single hostel
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)
      .populate('warden', 'name email phone');

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    // Get rooms
    const rooms = await Room.find({ hostel: hostel._id, isActive: true })
      .sort({ floor: 1, roomNumber: 1 });

    // Calculate stats
    const totalRooms = rooms.length;
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const occupiedSeats = rooms.reduce((sum, room) => sum + room.occupiedSeats, 0);

    res.status(200).json({
      success: true,
      data: {
        ...hostel.toObject(),
        rooms,
        stats: {
          totalRooms,
          totalCapacity,
          occupiedSeats,
          availableSeats: totalCapacity - occupiedSeats,
          occupancyRate: totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0
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

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

// @route   POST /api/hostels
// @desc    Create new hostel
// @access  Private (Admin)
router.post('/', hostelValidation, async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);

    res.status(201).json({
      success: true,
      data: hostel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/hostels/:id
// @desc    Update hostel
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
  try {
    let hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: hostel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/hostels/:id/warden
// @desc    Assign warden to hostel
// @access  Private (Admin)
router.put('/:id/warden', async (req, res) => {
  try {
    const { wardenId } = req.body;

    // Verify warden exists and has warden role
    const warden = await User.findOne({ _id: wardenId, role: 'warden' });
    if (!warden) {
      return res.status(404).json({
        success: false,
        message: 'Warden not found'
      });
    }

    const hostel = await Hostel.findByIdAndUpdate(
      req.params.id,
      { warden: wardenId },
      { new: true }
    ).populate('warden', 'name email phone');

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hostel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/hostels/:id
// @desc    Delete hostel (soft delete - set isActive to false)
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: 'Hostel not found'
      });
    }

    // Soft delete
    hostel.isActive = false;
    await hostel.save();

    res.status(200).json({
      success: true,
      message: 'Hostel deactivated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
