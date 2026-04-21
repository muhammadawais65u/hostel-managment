# University Hostel Booking and Management System

A complete MERN stack web application for managing university hostel operations including student bookings, complaints, fee management, and room allocation.

## Features

### Student Features
- **Hostel Application**: Apply for hostel rooms with preferred room types
- **Room Allocation**: View assigned hostel and room details
- **Complaint Management**: Submit and track maintenance/facility complaints
- **Fee Payment**: View and pay hostel fees online
- **Notifications**: Receive updates on application status, complaints, and fee reminders

### Admin Features
- **Dashboard Analytics**: View occupancy rates, pending applications, and fee statistics
- **User Management**: Manage students, wardens with role-based access
- **Hostel Management**: Create and manage multiple hostels with different types
- **Room Management**: Configure room types, capacity, and pricing
- **Application Processing**: Approve/reject hostel applications with room allocation
- **Complaint Resolution**: Monitor and resolve student complaints
- **Fee Management**: Generate fee records and verify payments

### Warden Features
- **Assigned Hostels**: View and manage assigned hostels
- **Room Occupancy**: Monitor room availability and occupancy rates
- **Student Management**: View and manage resident students
- **Complaint Handling**: Receive, assign, and resolve student complaints
- **Room Allocation**: Allocate rooms to approved applicants

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **Express Validator** for input validation

### Frontend
- **React.js** 18+ with functional components and hooks
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons
- **Recharts** for analytics charts

## Project Structure

```
hotel-managemnt/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── data/
│   │   ├── sampleData.js      # Sample data for seeding
│   │   └── seeder.js          # Database seeder script
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Student.js         # Student profile model
│   │   ├── Hostel.js          # Hostel model
│   │   ├── Room.js            # Room model
│   │   ├── Application.js     # Application model
│   │   ├── Complaint.js       # Complaint model
│   │   ├── Fee.js             # Fee model
│   │   └── Notification.js    # Notification model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── students.js        # Student routes
│   │   ├── admin.js           # Admin routes
│   │   ├── warden.js          # Warden routes
│   │   ├── hostels.js         # Hostel routes
│   │   ├── rooms.js           # Room routes
│   │   ├── applications.js    # Application routes
│   │   ├── complaints.js      # Complaint routes
│   │   └── fees.js            # Fee routes
│   ├── utils/
│   │   ├── validators.js      # Input validators
│   │   └── upload.js          # File upload config
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Textarea.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   └── layout/        # Layout components
│   │   │       ├── Navbar.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── DashboardLayout.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── student/
│   │   │   │   └── StudentDashboard.jsx
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   └── warden/
│   │   │       └── WardenDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone and Navigate to Project

```bash
cd "hotel managemnt"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (if not exists)
# Edit .env with your MongoDB URI and JWT secret

# Start MongoDB locally or use MongoDB Atlas

# Run database seeder (optional - for sample data)
npm run data:import

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Demo Credentials

| Role    | Email                      | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@university.edu      | admin123    |
| Warden  | warden@university.edu     | warden123   |
| Student | john@student.edu          | student123  |
| Student | jane@student.edu          | student123  |
| Student | bob@student.edu           | student123  |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Students
- `GET /api/students/dashboard` - Get student dashboard data
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/applications` - Get student's applications
- `GET /api/students/complaints` - Get student's complaints
- `GET /api/students/fees` - Get student's fees

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Toggle user status
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Get detailed analytics

### Warden
- `GET /api/warden/dashboard` - Get warden dashboard data
- `GET /api/warden/hostels` - Get assigned hostels
- `GET /api/warden/rooms` - Get rooms
- `GET /api/warden/students` - Get students
- `GET /api/warden/complaints` - Get complaints

### Hostels
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/:id` - Get single hostel
- `POST /api/hostels` - Create hostel (Admin)
- `PUT /api/hostels/:id` - Update hostel (Admin)
- `PUT /api/hostels/:id/warden` - Assign warden (Admin)
- `DELETE /api/hostels/:id` - Delete hostel (Admin)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Create room (Admin)
- `PUT /api/rooms/:id` - Update room
- `PUT /api/rooms/:id/allocate` - Allocate student to room
- `PUT /api/rooms/:id/vacate` - Vacate student from room
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Applications
- `GET /api/applications` - Get all applications (Admin)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Submit application (Student)
- `PUT /api/applications/:id/approve` - Approve application (Admin)
- `PUT /api/applications/:id/reject` - Reject application (Admin)
- `DELETE /api/applications/:id` - Delete application (Admin)

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Submit complaint (Student)
- `PUT /api/complaints/:id/status` - Update complaint status
- `POST /api/complaints/:id/comments` - Add comment
- `DELETE /api/complaints/:id` - Delete complaint (Admin)

### Fees
- `GET /api/fees` - Get all fees
- `GET /api/fees/:id` - Get single fee
- `POST /api/fees` - Create fee record (Admin)
- `PUT /api/fees/:id/pay` - Pay fee (Student)
- `PUT /api/fees/:id/verify` - Verify payment (Admin)
- `DELETE /api/fees/:id` - Delete fee (Admin)

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/university-hostel
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

## Design System

### Colors
- **Primary**: Indigo (#4f46e5, #6366f1)
- **Secondary**: Slate (#64748b, #94a3b8)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Components
All UI components follow modern design principles:
- Soft shadows and rounded corners
- Consistent spacing with Tailwind
- Responsive design for all screen sizes
- Accessible with focus states
- Loading states and error handling

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

---

Built with React.js, Node.js, Express.js, MongoDB, and Tailwind CSS.
#   h o s t e l - m a n a g m e n t  
 