import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isAuthReady, loading } = useAuth();
  const location = useLocation();

  if (loading || !isAuthReady) {
    return null;
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{
        redirectTo: location.pathname + location.search + location.hash,
      }}
    />
  );
}
