import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isAdmin, isWarden, isStudent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard
      if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
      if (isWarden) return <Navigate to="/warden/dashboard" replace />;
      if (isStudent) return <Navigate to="/student/dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
