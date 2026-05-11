const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User, Student, Room, Application, Complaint, Fee, Notification } = require('../models');

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
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalUsers,
          totalRooms,
          totalCapacity,
          occupiedSeats,
          occupancyRate,
          pendingApplications,
          pendingComplaints,
          pendingFees
        },
        recentApplications,
        recentComplaints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, phone, rollNumber, gender, department, semester, year } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      isActive: true,
      isEmailVerified: false
    });

    // If student, create student profile
    if (role === 'student' || !role) {
      try {
        // Validate required student fields
        if (!rollNumber) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Roll number is required for students'
          });
        }
        if (!department) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Department is required for students'
          });
        }
        if (!gender) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Gender is required for students'
          });
        }
        if (!year) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Year is required for students'
          });
        }

        // Check if roll number already exists
        const existingRollNumber = await Student.findOne({ rollNumber });
        if (existingRollNumber) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'Roll number already exists'
          });
        }

        await Student.create({
          user: user._id,
          rollNumber,
          gender,
          department,
          semester,
          year
        });
      } catch (studentError) {
        console.error('Error creating student profile:', studentError);
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          success: false,
          message: studentError.message || 'Error creating student profile'
        });
      }
    }

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error creating user:', error);
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
    const { role, search, status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get student info for students
    const usersWithInfo = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        // Add status field based on isActive
        userObj.status = userObj.isActive ? 'active' : 'inactive';
        
        if (user.role === 'student') {
          try {
            const student = await Student.findOne({ user: user._id });
            if (student) {
              const studentObj = student.toObject();
              userObj.rollNumber = studentObj.rollNumber;
              userObj.department = studentObj.department;
              userObj.semester = studentObj.semester;
              userObj.year = studentObj.year;
              userObj.gender = studentObj.gender;
              userObj.studentInfo = studentObj;
            }
          } catch (err) {
            console.error('Error fetching student info:', err);
          }
        }
        return userObj;
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
    console.error('Error in /api/admin/users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, role, rollNumber, gender, department, semester, year, isActive } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // If student, update student profile
    if (role === 'student' || user.role === 'student') {
      try {
        const student = await Student.findOne({ user: user._id });
        if (student) {
          // Check if roll number already exists (if being changed)
          if (rollNumber && rollNumber !== student.rollNumber) {
            const existingRollNumber = await Student.findOne({ rollNumber });
            if (existingRollNumber) {
              return res.status(400).json({
                success: false,
                message: 'Roll number already exists'
              });
            }
          }
          
          if (rollNumber !== undefined) student.rollNumber = rollNumber;
          if (gender !== undefined) student.gender = gender;
          if (department !== undefined) student.department = department;
          if (semester !== undefined) student.semester = semester;
          if (year !== undefined) student.year = year;
          
          await student.save();
        } else {
          // Create student profile if it doesn't exist
          await Student.create({
            user: user._id,
            rollNumber: rollNumber || null,
            gender: gender || null,
            department: department || null,
            semester: semester || null,
            year: year || null
          });
        }
      } catch (studentError) {
        console.error('Error updating student profile:', studentError);
        return res.status(500).json({
          success: false,
          message: 'Error updating student profile'
        });
      }
    }

    // Remove password from response
    user.password = undefined;

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

// @route   PUT /api/admin/users/:id/verify-email
// @desc    Verify user email
// @access  Private (Admin)
router.put('/users/:id/verify-email', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: user
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

// @route   GET /api/admin/notifications
// @desc    Get admin notifications
// @access  Private (Admin)
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
