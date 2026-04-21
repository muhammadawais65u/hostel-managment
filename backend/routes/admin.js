const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User, Student, Hostel, Room, Application, Complaint, Fee, Notification } = require('../models');

// All routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const totalStudents = await Student.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalHostels = await Hostel.countDocuments({ isActive: true });
    const totalRooms = await Room.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const pendingComplaints = await Complaint.countDocuments({ status: { $nin: ['resolved', 'closed'] } });
    const pendingFees = await Fee.countDocuments({ status: { $nin: ['paid', 'waived'] } });

    // Calculate occupancy
    const rooms = await Room.find();
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
    const occupiedSeats = rooms.reduce((sum, room) => sum + room.occupiedSeats, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0;

    // Recent applications
    const recentApplications = await Application.find()
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('hostel', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent complaints
    const recentComplaints = await Complaint.find()
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('hostel', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Hostel occupancy stats
    const hostelStats = await Promise.all(
      (await Hostel.find({ isActive: true })).map(async (hostel) => {
        const rooms = await Room.find({ hostel: hostel._id });
        const capacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
        const occupied = rooms.reduce((sum, room) => sum + room.occupiedSeats, 0);

        return {
          id: hostel._id,
          name: hostel.name,
          code: hostel.code,
          type: hostel.type,
          capacity,
          occupied,
          available: capacity - occupied,
          occupancyRate: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalUsers,
          totalHostels,
          totalRooms,
          totalCapacity,
          occupiedSeats,
          occupancyRate,
          pendingApplications,
          pendingComplaints,
          pendingFees
        },
        recentApplications,
        recentComplaints,
        hostelStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get student info for students
    const usersWithInfo = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'student') {
          const student = await Student.findOne({ user: user._id })
            .populate('room', 'roomNumber')
            .populate('hostel', 'name');
          return { ...user.toObject(), studentInfo: student };
        }
        return user.toObject();
      })
    );

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: usersWithInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle user active status
// @access  Private (Admin)
router.put('/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If student, delete student profile too
    if (user.role === 'student') {
      await Student.findOneAndDelete({ user: user._id });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', async (req, res) => {
  try {
    // Applications by status
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Complaints by status
    const complaintsByStatus = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Fees summary
    const feesSummary = await Fee.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly applications trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyApplications = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        applicationsByStatus,
        complaintsByCategory,
        complaintsByStatus,
        feesSummary,
        monthlyApplications
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
