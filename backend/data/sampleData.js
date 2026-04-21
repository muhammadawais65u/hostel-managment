const bcrypt = require('bcryptjs');

// Sample data for seeding the database

const users = [
  {
    name: 'Admin User',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    phone: '+91 9876543210',
    isActive: true
  },
  {
    name: 'Warden Smith',
    email: 'warden@university.edu',
    password: 'warden123',
    role: 'warden',
    phone: '+91 9876543211',
    isActive: true
  },
  {
    name: 'John Doe',
    email: 'john@student.edu',
    password: 'student123',
    role: 'student',
    phone: '+91 9876543212',
    isActive: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@student.edu',
    password: 'student123',
    role: 'student',
    phone: '+91 9876543213',
    isActive: true
  },
  {
    name: 'Bob Wilson',
    email: 'bob@student.edu',
    password: 'student123',
    role: 'student',
    phone: '+91 9876543214',
    isActive: true
  }
];

const studentProfiles = [
  {
    rollNumber: 'CS2021001',
    department: 'Computer Science',
    course: 'B.Tech',
    year: 3,
    gender: 'male',
    dateOfBirth: new Date('2002-05-15'),
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    emergencyContact: {
      name: 'Mr. Doe Senior',
      relationship: 'Father',
      phone: '+91 9876543200'
    }
  },
  {
    rollNumber: 'EC2021002',
    department: 'Electronics',
    course: 'B.Tech',
    year: 2,
    gender: 'female',
    dateOfBirth: new Date('2003-08-20'),
    address: {
      street: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    emergencyContact: {
      name: 'Mrs. Smith',
      relationship: 'Mother',
      phone: '+91 9876543201'
    }
  },
  {
    rollNumber: 'ME2021003',
    department: 'Mechanical',
    course: 'B.Tech',
    year: 4,
    gender: 'male',
    dateOfBirth: new Date('2001-12-10'),
    address: {
      street: '789 Lake Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    emergencyContact: {
      name: 'Mr. Wilson',
      relationship: 'Father',
      phone: '+91 9876543202'
    }
  }
];

const hostels = [
  {
    name: 'Boys Hostel A',
    code: 'BH-A',
    type: 'boys',
    description: 'Main boys hostel with modern facilities',
    location: {
      address: 'North Campus, Block A',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    facilities: ['WiFi', 'Gym', 'Common Room', 'Mess', 'Laundry'],
    isActive: true
  },
  {
    name: 'Girls Hostel B',
    code: 'GH-B',
    type: 'girls',
    description: 'Secure and comfortable hostel for female students',
    location: {
      address: 'South Campus, Block B',
      coordinates: {
        latitude: 19.0750,
        longitude: 72.8767
      }
    },
    facilities: ['WiFi', 'Library', 'Common Room', 'Mess', 'Laundry', 'Security 24/7'],
    isActive: true
  },
  {
    name: 'Research Scholars Hostel',
    code: 'RSH-1',
    type: 'research',
    description: 'Exclusive hostel for research scholars',
    location: {
      address: 'Research Complex',
      coordinates: {
        latitude: 19.0780,
        longitude: 72.8787
      }
    },
    facilities: ['WiFi', 'Study Rooms', 'Library', 'Kitchen'],
    isActive: true
  }
];

const generateRooms = (hostelId, hostelCode) => {
  const rooms = [];
  const floors = 4;
  const roomsPerFloor = 10;

  for (let floor = 0; floor < floors; floor++) {
    for (let roomNum = 1; roomNum <= roomsPerFloor; roomNum++) {
      const roomNumber = `${floor}${roomNum.toString().padStart(2, '0')}`;
      const types = ['single', 'double', 'double', 'triple', 'triple'];
      const type = types[Math.floor(Math.random() * types.length)];

      const capacities = {
        single: 1,
        double: 2,
        triple: 3,
        quad: 4,
        dormitory: 6
      };

      const baseRent = {
        single: 8000,
        double: 6000,
        triple: 5000,
        quad: 4500,
        dormitory: 3500
      };

      rooms.push({
        roomNumber,
        hostel: hostelId,
        floor,
        type,
        capacity: capacities[type],
        occupiedSeats: 0,
        occupants: [],
        rentPerMonth: baseRent[type],
        facilities: ['Fan', 'Light', 'Study Table', 'Chair', 'Bed'],
        status: 'available',
        isActive: true
      });
    }
  }

  return rooms;
};

const complaints = [
  {
    title: 'Water leakage in bathroom',
    description: 'There is a water leakage in the bathroom tap that needs immediate attention.',
    category: 'plumbing',
    priority: 'high'
  },
  {
    title: 'WiFi not working',
    description: 'The WiFi connection in room 102 has been down since yesterday.',
    category: 'internet',
    priority: 'medium'
  },
  {
    title: 'AC not cooling properly',
    description: 'The air conditioner is making noise and not cooling properly.',
    category: 'maintenance',
    priority: 'medium'
  }
];

module.exports = {
  users,
  studentProfiles,
  hostels,
  generateRooms,
  complaints
};
