const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config({ path: './.env' });

// Route files
const auth = require('./routes/auth');
const students = require('./routes/students');
const rooms = require('./routes/rooms');
const applications = require('./routes/applications');
const complaints = require('./routes/complaints');
const fees = require('./routes/fees');
const payments = require('./routes/payments');
const admin = require('./routes/admin');
const warden = require('./routes/warden');

// Error handler
const errorHandler = require('./middleware/errorHandler');

// DB connection
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create documents subdirectory in uploads
const documentsDir = path.join(uploadsDir, 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir);
}

// Create public directory for images if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Create images subdirectory in public
const imagesDir = path.join(publicDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// Static files for uploads and public
app.use('/uploads', express.static(uploadsDir));
app.use('/public', express.static(publicDir));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/students', students);
app.use('/api/rooms', rooms);
app.use('/api/applications', applications);
app.use('/api/complaints', complaints);
app.use('/api/fees', fees);
app.use('/api/payments', payments);
app.use('/api/admin', admin);
app.use('/api/warden', warden);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to University Hostel Booking and Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      rooms: '/api/rooms',
      applications: '/api/applications',
      complaints: '/api/complaints',
      fees: '/api/fees',
      admin: '/api/admin',
      warden: '/api/warden'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
