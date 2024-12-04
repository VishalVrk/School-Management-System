import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role exists
  if (!user.role) {
    console.error('User role not found:', user);
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Get default route for user's role
    const getDefaultRoute = (role) => {
      const roleRoutes = {
        student: '/student-dashboard',
        teacher: '/teacher-dashboard',
        admin: '/admin-dashboard'
      };
      return roleRoutes[role] || '/login';
    };

    // Redirect to appropriate dashboard
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  // Render protected route
  return children;
};

export default PrivateRoute;