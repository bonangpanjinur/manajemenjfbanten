import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  // 1. Cek Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Cek Role
  // Jika allowedRoles disediakan, cek apakah role user ada di dalamnya
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect cerdas berdasarkan role
    if (user.role === 'jemaah') {
      return <Navigate to="/portal" replace />;
    } else if (user.role === 'agen') {
      return <Navigate to="/dashboard-agen" replace />;
    } else {
      return <Navigate to="/" replace />; // Default dashboard
    }
  }

  return children;
};

export default ProtectedRoute;