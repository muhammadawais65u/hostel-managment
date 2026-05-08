const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { User, Student, Application, Notification } = require('../models');
const { sendPaymentConfirmationEmail, sendPaymentRescheduleEmail } = require('../utils/emailService');

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
      paymentDate: new Date(),
      studentName: student.name,
      studentEmail: req.user.email,
      department: student.department,
      rollNumber: student.rollNumber
    };
    await application.save();

    // Update student payment status
    student.paymentStatus = 'paid';
    await student.save();

    // Create notification for student
    await Notification.create({
      user: req.user.id,
      title: 'Payment Completed',
      message: `Your payment of PKR ${amount} for Room ${application.roomInfo?.roomNumber} has been processed successfully.`,
      type: 'success'
    });

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await Notification.create({
        user: admins[0]._id,
        title: 'New Payment Received',
        message: `${student.name} has paid PKR ${amount} for Room ${application.roomInfo?.roomNumber}.`,
        type: 'success'
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
      cardLastFour: app.paymentDetails?.cardLastFour,
      studentName: app.paymentDetails?.studentName || app.personalInfo?.name,
      studentEmail: app.paymentDetails?.studentEmail || app.personalInfo?.email,
      department: app.paymentDetails?.department || app.personalInfo?.department,
      rollNumber: app.paymentDetails?.rollNumber || app.personalInfo?.rollNumber
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
      studentName: app.paymentDetails?.studentName || app.student?.name || app.personalInfo?.name,
      studentEmail: app.paymentDetails?.studentEmail || app.student?.email || app.personalInfo?.email,
      department: app.paymentDetails?.department || app.personalInfo?.department,
      rollNumber: app.paymentDetails?.rollNumber || app.personalInfo?.rollNumber
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

// @route   POST /api/payments/reschedule
// @desc    Reschedule payment for admin
// @access  Private (Admin)
router.post('/reschedule', authorize('admin'), async (req, res) => {
  try {
    const { transactionId, nextPaymentDate, paymentFrequency, customAmount, reason } = req.body;

    // Find the application with this transaction ID
    const application = await Application.findOne({
      'paymentDetails.transactionId': transactionId
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update application with rescheduling information
    application.paymentDetails.nextPaymentDate = new Date(nextPaymentDate);
    application.paymentDetails.paymentFrequency = paymentFrequency;
    application.paymentDetails.customAmount = customAmount ? parseFloat(customAmount) : application.paymentDetails.amount;
    application.paymentDetails.rescheduleReason = reason;
    application.paymentDetails.rescheduledAt = new Date();
    application.paymentDetails.rescheduledBy = req.user.id;

    console.log('Saving rescheduled payment details:', {
      nextPaymentDate: application.paymentDetails.nextPaymentDate,
      paymentFrequency: application.paymentDetails.paymentFrequency,
      customAmount: application.paymentDetails.customAmount,
      rescheduleReason: application.paymentDetails.rescheduleReason,
      rescheduledAt: application.paymentDetails.rescheduledAt,
      rescheduledBy: application.paymentDetails.rescheduledBy
    });

    await application.save();
    console.log('Rescheduled payment saved successfully:', application.paymentDetails);

    // Create notification for student
    await Notification.create({
      user: application.user,
      title: 'Payment Rescheduled',
      message: `Your payment has been rescheduled. Next payment date: ${new Date(nextPaymentDate).toLocaleDateString()}`,
      type: 'info'
    });

    // Send email notification to student
    try {
      // Get email and name from paymentDetails (saved during payment) or fallback to populated relationships
      let studentEmail = application.paymentDetails.studentEmail;
      let studentName = application.paymentDetails.studentName;
      
      // If not in paymentDetails, populate and get from relationships
      if (!studentEmail || !studentName) {
        const populatedApplication = await Application.findById(application._id)
          .populate('student', 'name email')
          .populate('user', 'name email');
        
        studentEmail = studentEmail || 
                      populatedApplication.student?.email || 
                      populatedApplication.user?.email || 
                      populatedApplication.personalInfo?.email;
        studentName = studentName || 
                     populatedApplication.student?.name || 
                     populatedApplication.user?.name || 
                     populatedApplication.personalInfo?.name;
      }
      
      if (!studentEmail) {
        console.error('No email address found for student notification');
        return;
      }
      
      await sendPaymentRescheduleEmail(
        studentEmail,
        studentName || 'Student',
        nextPaymentDate,
        paymentFrequency,
        customAmount || application.paymentDetails.amount,
        reason
      );
    } catch (emailError) {
      console.error('Failed to send payment reschedule email:', emailError);
    }

    // Create notification for admin
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      await Notification.create({
        user: admins[0]._id,
        title: 'Payment Rescheduled',
        message: `Payment for ${application.paymentDetails.studentName} has been rescheduled to ${new Date(nextPaymentDate).toLocaleDateString()}`,
        type: 'info'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment rescheduled successfully',
      data: {
        nextPaymentDate,
        paymentFrequency,
        customAmount: customAmount || application.paymentDetails.amount
      }
    });
  } catch (error) {
    console.error('Payment rescheduling error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/rescheduled
// @desc    Get rescheduled payment information for student
// @access  Private (Student)
router.get('/rescheduled', authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    
    const applications = await Application.find({
      student: student._id,
      'paymentDetails.nextPaymentDate': { $exists: true }
    }).sort({ 'paymentDetails.nextPaymentDate': 1 });

    const rescheduledPayments = applications.map(app => ({
      applicationId: app._id,
      roomNumber: app.roomInfo?.roomNumber,
      roomType: app.roomInfo?.roomType,
      nextPaymentDate: app.paymentDetails?.nextPaymentDate,
      paymentFrequency: app.paymentDetails?.paymentFrequency,
      customAmount: app.paymentDetails?.customAmount,
      rescheduleReason: app.paymentDetails?.rescheduleReason,
      rescheduledAt: app.paymentDetails?.rescheduledAt,
      cardLastFour: app.paymentDetails?.cardLastFour
    }));

    res.status(200).json({
      success: true,
      data: rescheduledPayments
    });
  } catch (error) {
    console.error('Rescheduled payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/admin/rescheduled
// @desc    Get all rescheduled payments for admin
// @access  Private (Admin)
router.get('/admin/rescheduled', authorize('admin'), async (req, res) => {
  try {
    console.log('🔍 Admin fetching rescheduled payments...');
    
    // Try finding all applications and manually filter for rescheduled payments
    const allApps = await Application.find({});
    console.log('🔍 Total applications in DB:', allApps.length);
    
    const applications = allApps.filter(app => {
      const hasPaymentDetails = app.paymentDetails;
      const hasNextPaymentDate = hasPaymentDetails && 
        app.paymentDetails.nextPaymentDate && 
        app.paymentDetails.nextPaymentDate !== null;
      
      if (hasNextPaymentDate) {
        console.log('✅ Found rescheduled payment:', {
          applicationId: app._id,
          nextPaymentDate: app.paymentDetails.nextPaymentDate,
          paymentFrequency: app.paymentDetails.paymentFrequency
        });
      }
      
      return hasNextPaymentDate;
    });
    
    console.log('� Final filtered applications:', applications.length);
    
    const populatedApplications = await Application.populate(applications, [
      { path: 'student', select: 'name email' },
      { path: 'user', select: 'name email' }
    ]);

    populatedApplications.sort((a, b) => a.paymentDetails.nextPaymentDate - b.paymentDetails.nextPaymentDate);

    console.log('📊 Found applications with nextPaymentDate:', populatedApplications.length);
    console.log('📋 Applications:', populatedApplications.map(app => ({
      _id: app._id,
      hasNextPaymentDate: !!app.paymentDetails?.nextPaymentDate,
      paymentDetails: app.paymentDetails,
      fullObject: app.toObject()
    })));

    const rescheduledPayments = applications.map(app => ({
      applicationId: app._id,
      studentName: app.paymentDetails?.studentName || app.student?.name || app.personalInfo?.name,
      studentEmail: app.paymentDetails?.studentEmail || app.student?.email || app.personalInfo?.email,
      roomNumber: app.roomInfo?.roomNumber,
      roomType: app.roomInfo?.roomType,
      nextPaymentDate: app.paymentDetails?.nextPaymentDate,
      paymentFrequency: app.paymentDetails?.paymentFrequency,
      customAmount: app.paymentDetails?.customAmount,
      rescheduleReason: app.paymentDetails?.rescheduleReason,
      rescheduledAt: app.paymentDetails?.rescheduledAt,
      rescheduledBy: app.paymentDetails?.rescheduledBy,
      originalAmount: app.paymentDetails?.amount,
      cardLastFour: app.paymentDetails?.cardLastFour
    }));

    console.log('🎯 Mapped rescheduled payments:', rescheduledPayments);
    console.log('📤 Sending response with data length:', rescheduledPayments.length);

    res.status(200).json({
      success: true,
      data: rescheduledPayments
    });
  } catch (error) {
    console.error('Admin rescheduled payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
