import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Warden Pages
import WardenDashboard from './pages/warden/WardenDashboard';

// Placeholder components for additional routes
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-2xl font-bold text-secondary-900 mb-4">{title}</h1>
    <p className="text-secondary-600">This page is coming soon.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="application" element={<PlaceholderPage title="My Application" />} />
            <Route path="complaints" element={<PlaceholderPage title="My Complaints" />} />
            <Route path="fees" element={<PlaceholderPage title="Fee Payment" />} />
            <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
            <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
            <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<PlaceholderPage title="User Management" />} />
            <Route path="hostels" element={<PlaceholderPage title="Hostel Management" />} />
            <Route path="rooms" element={<PlaceholderPage title="Room Management" />} />
            <Route path="applications" element={<PlaceholderPage title="Applications" />} />
            <Route path="complaints" element={<PlaceholderPage title="Complaints" />} />
            <Route path="fees" element={<PlaceholderPage title="Fee Management" />} />
            <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>

          {/* Warden Routes */}
          <Route
            path="/warden/*"
            element={
              <ProtectedRoute allowedRoles={['warden']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<WardenDashboard />} />
            <Route path="hostels" element={<PlaceholderPage title="My Hostels" />} />
            <Route path="rooms" element={<PlaceholderPage title="Room Management" />} />
            <Route path="students" element={<PlaceholderPage title="Student Management" />} />
            <Route path="complaints" element={<PlaceholderPage title="Complaint Management" />} />
            <Route path="*" element={<Navigate to="/warden/dashboard" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
