import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../services/api/client';
import { clearAuthState } from '../services/api/authState';
import { getCurrentUserFromApi } from '../services/api/auth.service';
import { getCurrentUser } from '../services/api/session';

function isAuthenticated() {
  return Boolean(getAccessToken());
}

function getInitialSessionState() {
  if (!isAuthenticated()) {
    return { status: 'guest', user: null };
  }

  const user = getCurrentUser();
  return user
    ? { status: 'ready', user }
    : { status: 'loading', user: null };
}

function useSessionHydration() {
  const [session, setSession] = useState(getInitialSessionState);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      if (!isAuthenticated()) {
        if (isMounted) setSession({ status: 'guest', user: null });
        return;
      }

      const storedUser = getCurrentUser();
      if (storedUser) {
        if (isMounted) setSession({ status: 'ready', user: storedUser });
        return;
      }

      if (isMounted) setSession({ status: 'loading', user: null });

      try {
        const user = await getCurrentUserFromApi();
        if (!isMounted) return;

        if (user) {
          setSession({ status: 'ready', user });
          return;
        }

        clearAuthState();
        setSession({ status: 'invalid', user: null });
      } catch {
        clearAuthState();
        if (isMounted) setSession({ status: 'invalid', user: null });
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  return session;
}

function SessionLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400 md:px-8">
      Đang kiểm tra phiên đăng nhập...
    </div>
  );
}

export function RequireAuth({ children }) {
  const session = useSessionHydration();

  if (session.status === 'loading') {
    return <SessionLoading />;
  }

  if (session.status !== 'ready') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RequireGuest({ children }) {
  const session = useSessionHydration();

  if (session.status === 'loading') {
    return <SessionLoading />;
  }

  if (session.status === 'ready') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function RequireRole({ allowedRoles, children, fallbackPath = '/dashboard' }) {
  const session = useSessionHydration();

  if (session.status === 'loading') {
    return <SessionLoading />;
  }

  if (session.status !== 'ready') {
    return <Navigate to="/login" replace />;
  }

  const role = String(session.user?.role ?? '').toUpperCase();

  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export function DashboardRoute() {
  const session = useSessionHydration();

  if (session.status === 'loading') {
    return <SessionLoading />;
  }

  if (session.status !== 'ready') {
    return <Navigate to="/login" replace />;
  }

  const role = String(session.user?.role ?? '').toUpperCase();

  if (role === 'TEACHER') {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  return <Navigate to="/dashboard/student" replace />;
}
