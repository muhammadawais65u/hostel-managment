const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'admin', 'warden']).withMessage('Invalid role'),
  validate
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  validate
];

// Student profile validation
const studentValidation = [
  body('rollNumber')
    .trim()
    .notEmpty().withMessage('Roll number is required'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('course')
    .trim()
    .notEmpty().withMessage('Course is required'),
  body('year')
    .isInt({ min: 1, max: 6 }).withMessage('Year must be between 1 and 6'),
  body('gender')
    .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  validate
];

// Application validation
const applicationValidation = [
  body('hostel')
    .notEmpty().withMessage('Hostel is required'),
  body('roomType')
    .optional()
    .isIn(['single', 'double', 'triple', 'quad', 'any']).withMessage('Invalid room type'),
  body('semester')
    .trim()
    .notEmpty().withMessage('Semester is required'),
  body('academicYear')
    .trim()
    .notEmpty().withMessage('Academic year is required'),
  validate
];

// Complaint validation
const complaintValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('category')
    .isIn(['maintenance', 'cleanliness', 'security', 'noise', 'facilities', 'food', 'internet', 'electrical', 'plumbing', 'other'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  validate
];

// Hostel validation
const hostelValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Hostel name is required'),
  body('code')
    .trim()
    .notEmpty().withMessage('Hostel code is required')
    .isUppercase().withMessage('Code should be uppercase'),
  body('type')
    .isIn(['boys', 'girls', 'co-ed', 'research', 'staff']).withMessage('Invalid hostel type'),
  validate
];

// Room validation
const roomValidation = [
  body('roomNumber')
    .trim()
    .notEmpty().withMessage('Room number is required'),
  body('hostel')
    .notEmpty().withMessage('Hostel is required'),
  body('floor')
    .isInt({ min: 0 }).withMessage('Floor must be a non-negative integer'),
  body('type')
    .isIn(['single', 'double', 'triple', 'quad', 'dormitory']).withMessage('Invalid room type'),
  body('capacity')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('rentPerMonth')
    .isFloat({ min: 0 }).withMessage('Rent must be a non-negative number'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  studentValidation,
  applicationValidation,
  complaintValidation,
  hostelValidation,
  roomValidation
};
