import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

type GuardProps = {
  children: React.ReactNode;
};

export const RequireAuth: React.FC<GuardProps> = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const ok = user.systemRole === 'admin' || user.systemRole === 'superadmin';
  if (!ok) return <Navigate to="/home" replace />;

  return <>{children}</>;
};

export const RequireSuperAdmin: React.FC<GuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const ok = user.systemRole === 'superadmin';
  if (!ok) return <Navigate to="/home" replace />;

  return <>{children}</>;
};
