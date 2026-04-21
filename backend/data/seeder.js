const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

// Load models
const { User, Student, Hostel, Room, Application, Complaint, Fee, Notification } = require('../models');

// Connect to DB
const connectDB = require('../config/db');

// Load sample data
const { users, studentProfiles, hostels, generateRooms, complaints } = require('./sampleData');

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Application.deleteMany();
    await Complaint.deleteMany();
    await Fee.deleteMany();
    await Notification.deleteMany();

    console.log('Data cleared...'.red.inverse);

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`User created: ${user.name} (${user.role})`.green);
    }

    // Create student profiles
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    const createdStudents = [];

    for (let i = 0; i < studentUsers.length; i++) {
      if (studentProfiles[i]) {
        const studentData = {
          user: studentUsers[i]._id,
          ...studentProfiles[i]
        };
        const student = await Student.create(studentData);
        createdStudents.push(student);
        console.log(`Student profile created: ${student.rollNumber}`.green);
      }
    }

    // Create hostels and assign warden
    const wardenUser = createdUsers.find(u => u.role === 'warden');
    const createdHostels = [];

    for (const hostelData of hostels) {
      const hostel = await Hostel.create({
        ...hostelData,
        warden: wardenUser ? wardenUser._id : null
      });
      createdHostels.push(hostel);
      console.log(`Hostel created: ${hostel.name}`.green);

      // Create rooms for this hostel
      const rooms = generateRooms(hostel._id, hostel.code);
      let totalCapacity = 0;

      for (const roomData of rooms) {
        await Room.create(roomData);
        totalCapacity += roomData.capacity;
      }

      // Update hostel stats
      hostel.totalRooms = rooms.length;
      hostel.totalCapacity = totalCapacity;
      await hostel.save();

      console.log(`  - Created ${rooms.length} rooms`.cyan);
    }

    // Create sample applications
    if (createdStudents.length > 0 && createdHostels.length > 0) {
      const applicationStatuses = ['pending', 'approved', 'rejected'];

      for (let i = 0; i < createdStudents.length; i++) {
        const student = createdStudents[i];
        const hostel = createdHostels[i % createdHostels.length];
        const status = applicationStatuses[i % applicationStatuses.length];

        const application = await Application.create({
          student: student._id,
          user: student.user,
          hostel: hostel._id,
          roomType: 'double',
          status: status,
          semester: 'Fall 2024',
          academicYear: '2024-2025',
          remarks: 'Sample application for testing'
        });

        // Update student application status
        student.applicationStatus = status;

        // If approved, allocate room
        if (status === 'approved') {
          const availableRoom = await Room.findOne({
            hostel: hostel._id,
            status: 'available'
          });

          if (availableRoom) {
            availableRoom.addOccupant(student._id);
            await availableRoom.save();

            student.room = availableRoom._id;
            student.hostel = hostel._id;

            // Update hostel occupied seats
            hostel.occupiedSeats += 1;
            await hostel.save();
          }
        }

        await student.save();
        console.log(`Application created for ${student.rollNumber}: ${status}`.green);
      }
    }

    // Create sample complaints
    if (createdStudents.length > 0) {
      for (let i = 0; i < Math.min(complaints.length, createdStudents.length); i++) {
        const student = createdStudents[i];

        if (student.hostel) {
          await Complaint.create({
            student: student._id,
            user: student.user,
            hostel: student.hostel,
            room: student.room,
            ...complaints[i],
            status: i === 0 ? 'in_progress' : 'submitted'
          });
          console.log(`Complaint created for ${student.rollNumber}`.green);
        }
      }
    }

    // Create sample fees
    if (createdStudents.length > 0) {
      const feeStatuses = ['paid', 'unpaid', 'partial'];

      for (let i = 0; i < createdStudents.length; i++) {
        const student = createdStudents[i];

        if (student.hostel && student.room) {
          const fee = await Fee.create({
            student: student._id,
            user: student.user,
            hostel: student.hostel,
            room: student.room,
            feeType: 'hostel_fee',
            amount: 15000,
            month: 'October',
            year: 2024,
            semester: 'Fall 2024',
            status: feeStatuses[i % feeStatuses.length],
            paidAmount: feeStatuses[i % feeStatuses.length] === 'paid' ? 15000 :
                       feeStatuses[i % feeStatuses.length] === 'partial' ? 5000 : 0,
            dueDate: new Date('2024-10-31')
          });

          // Update student fee status
          student.feeStatus = fee.status;
          await student.save();

          console.log(`Fee record created for ${student.rollNumber}: ${fee.status}`.green);
        }
      }
    }

    // Create welcome notifications
    for (const user of createdUsers) {
      await Notification.create({
        user: user._id,
        title: 'Welcome to Hostel Management System',
        message: 'Your account has been created successfully. Explore the dashboard to get started.',
        type: 'info'
      });
    }

    console.log('Sample data imported successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Student.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Application.deleteMany();
    await Complaint.deleteMany();
    await Fee.deleteMany();
    await Notification.deleteMany();

    console.log('Data destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Run based on command
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
