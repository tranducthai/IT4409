import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../services/api/client';
import { clearAuthState } from '../services/api/authState';
import { getCurrentUser } from '../services/api/session';

function isAuthenticated() {
  return Boolean(getAccessToken());
}

function clearInvalidSession() {
  clearAuthState();
}

export function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (!user) {
    clearInvalidSession();
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RequireGuest({ children }) {
  if (isAuthenticated() && getCurrentUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated()) {
    clearInvalidSession();
  }

  return children;
}

export function RequireRole({ allowedRoles, children, fallbackPath = '/dashboard' }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  if (!user) {
    clearInvalidSession();
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role ?? '').toUpperCase();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export function DashboardRoute() {
  const user = getCurrentUser();

  if (!user) {
    clearInvalidSession();
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role ?? '').toUpperCase();

  if (role === 'TEACHER') {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/dashboard/student" replace />;
}
