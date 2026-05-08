import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import WardenLayout from './components/layout/WardenLayout';
import StudentLayout from './components/layout/StudentLayout';
import MainLayout from './components/layout/MainLayout';

// Pages
import Landing from './pages/Public/Landing';
import About from './pages/Public/About';
import Contact from './pages/Public/Contact';
import Rooms from './pages/Public/Rooms';
import RoomDetail from './pages/Public/RoomDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Application from './pages/student/ApplyRoom';
import ApplicationStatus from './pages/student/ApplicationStatus';
import Payment from './pages/student/Payment';
import Complaints from './pages/student/Complaints';
import RoomDetails from './pages/student/RoomDetails';
import Settings from './pages/student/Settings';
import StudentNotifications from './pages/student/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminRooms from './pages/admin/AdminRooms';
import AdminRoomRequests from './pages/admin/AdminRoomRequests';
import ApplicationManagement from './pages/admin/ApplicationManagement';
import AdminNotifications from './pages/admin/Notifications';
import PaymentManagement from './pages/admin/PaymentManagement';

// Warden Pages
import WardenDashboard from './pages/warden/WardenDashboard';

// Placeholder component
const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold text-secondary-900 mb-4">{title}</h1>
      <p className="text-secondary-600">This page is coming soon.</p>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <MainLayout>
              <Landing />
            </MainLayout>
          } />
          <Route path="/about" element={
            <MainLayout>
              <About />
            </MainLayout>
          } />
          <Route path="/rooms" element={
            <MainLayout>
              <Rooms />
            </MainLayout>
          } />
          <Route path="/rooms/:id" element={
            <MainLayout>
              <RoomDetail />
            </MainLayout>
          } />
          <Route path="/contact" element={
            <MainLayout>
              <Contact />
            </MainLayout>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="application" element={<Application />} />
            <Route path="application-status" element={<ApplicationStatus />} />
            <Route path="payment" element={<Payment />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="room" element={<RoomDetails />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="materials" element={<PlaceholderPage title="Study Materials" />} />
            <Route path="roommates" element={<PlaceholderPage title="Roommates" />} />
            <Route path="leave" element={<PlaceholderPage title="Leave Request" />} />
            <Route path="help" element={<PlaceholderPage title="Help & Support" />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>
         

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
                        <Route path="rooms" element={<AdminRooms />} />
            <Route path="room-requests" element={<AdminRoomRequests />} />
            <Route path="applications" element={<ApplicationManagement />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="complaints" element={<PlaceholderPage title="Complaints" />} />
            <Route path="fees" element={<PlaceholderPage title="Fee Management" />} />
            <Route path="reports" element={<PlaceholderPage title="Reports" />} />
            <Route path="attendance" element={<PlaceholderPage title="Attendance" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="help" element={<PlaceholderPage title="Help & Support" />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Warden Routes */}
          <Route
            path="/warden/*"
            element={
              <ProtectedRoute allowedRoles={['warden']}>
                <WardenLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<WardenDashboard />} />
            <Route path="hostels" element={<PlaceholderPage title="My Hostels" />} />
            <Route path="rooms" element={<PlaceholderPage title="Room Management" />} />
            <Route path="students" element={<PlaceholderPage title="Student Management" />} />
            <Route path="complaints" element={<PlaceholderPage title="Complaint Management" />} />
            <Route path="allocations" element={<PlaceholderPage title="Room Allocations" />} />
            <Route path="attendance" element={<PlaceholderPage title="Attendance" />} />
            <Route path="reports" element={<PlaceholderPage title="Reports" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="help" element={<PlaceholderPage title="Help & Support" />} />
            <Route path="*" element={<Navigate to="/warden/dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;