const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User, Student, Application, Notification } = require('../models');
const { sendPaymentConfirmationEmail } = require('../utils/emailService');

// All routes are protected
router.use(protect);

// @route   POST /api/payments/process
// @desc    Process payment for approved room
// @access  Private (Student)
router.post('/process', authorize('student'), async (req, res) => {
  try {
    const { applicationId, cardNumber, cardholderName, expiryDate, cvv, amount } = req.body;

    // Find the student
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find the application
    const application = await Application.findOne({
      _id: applicationId,
      student: student._id,
      status: 'approved'
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Approved application not found'
      });
    }

    // Check if payment already exists
    if (application.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this application'
      });
    }

    // Process payment (simulate payment processing)
    const transactionId = 'TXN' + Date.now();
    
    // Update application with payment details
    application.paymentStatus = 'paid';
    application.paymentDetails = {
      amount,
      transactionId,
      cardLastFour: cardNumber.slice(-4),
      cardholderName,
      paymentDate: new Date()
    };
    await application.save();

    // Update student with room allocation
    student.room = application.roomInfo?.roomNumber;
    student.hostel = application.roomInfo?.hostel;
    student.paymentStatus = 'paid';
    await student.save();

    // Create notification for student
    await Notification.create({
      user: req.user.id,
      title: 'Payment Completed',
      message: `Your payment of ₹${amount} for Room ${application.roomInfo?.roomNumber} has been processed successfully.`,
      type: 'payment',
      relatedTo: { model: 'Payment', id: transactionId }
    });

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await Notification.create({
        user: admins[0]._id,
        title: 'New Payment Received',
        message: `${student.name} has paid ₹${amount} for Room ${application.roomInfo?.roomNumber}.`,
        type: 'payment',
        relatedTo: { model: 'Payment', id: transactionId }
      });
    }

    // Send email notification to student
    try {
      await sendPaymentConfirmationEmail(
        req.user.email,
        req.user.name,
        amount,
        application.roomInfo?.roomNumber,
        transactionId
      );
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
    }

    res.status(200).json({
      success: true,
      data: {
        transactionId,
        amount,
        roomNumber: application.roomInfo?.roomNumber,
        paymentDate: new Date()
      },
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get payment history for student
// @access  Private (Student)
router.get('/history', authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    const applications = await Application.find({
      student: student._id,
      paymentStatus: 'paid'
    }).sort({ 'paymentDetails.paymentDate': -1 });

    const paymentHistory = applications.map(app => ({
      transactionId: app.paymentDetails?.transactionId,
      amount: app.paymentDetails?.amount,
      paymentDate: app.paymentDetails?.paymentDate,
      roomNumber: app.roomInfo?.roomNumber,
      roomType: app.roomInfo?.roomType,
      cardLastFour: app.paymentDetails?.cardLastFour
    }));

    res.status(200).json({
      success: true,
      data: paymentHistory
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/admin/all
// @desc    Get all payments for admin
// @access  Private (Admin)
router.get('/admin/all', authorize('admin'), async (req, res) => {
  try {
    const applications = await Application.find({
      paymentStatus: 'paid'
    })
    .populate('student', 'name email')
    .sort({ 'paymentDetails.paymentDate': -1 });

    const payments = applications.map(app => ({
      transactionId: app.paymentDetails?.transactionId,
      amount: app.paymentDetails?.amount,
      paymentDate: app.paymentDetails?.paymentDate,
      roomNumber: app.roomInfo?.roomNumber,
      roomType: app.roomInfo?.roomType,
      studentName: app.student?.name,
      studentEmail: app.student?.email
    }));

    res.status(200).json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Admin payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
