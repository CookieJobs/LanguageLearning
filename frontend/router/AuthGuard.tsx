import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useApp();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
};
