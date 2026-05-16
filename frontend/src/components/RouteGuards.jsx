import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../services/api/client';
import { getCurrentUser } from '../services/api/session';

function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RequireGuest({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function RequireRole({ allowedRoles, children, fallbackPath = '/dashboard' }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = getCurrentUser()?.role;
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export function DashboardRoute() {
  const currentRole = getCurrentUser()?.role;

  if (currentRole === 'TEACHER') {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  return <Navigate to="/dashboard/student" replace />;
}
