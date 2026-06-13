import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, Role } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but unauthorized role, redirect to appropriate dashboard
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin" replace />;
    if (user.role === 'SCHOOL_ADMIN') return <Navigate to="/school-admin" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
