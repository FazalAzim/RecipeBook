import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner fullHeight message="Loading..." />;
  }

  if (user) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
