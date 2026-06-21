import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({
  children,
  roles,
}: {
  children?: ReactNode;
  roles?: Array<'USER' | 'REVIEWER' | 'ADMIN'>;
}) {
  const { isAuthenticated, isAuthReady, loading, user } = useAuth();
  const location = useLocation();

  if (loading || !isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          redirectTo: location.pathname + location.search + location.hash,
        }}
      />
    );
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}
