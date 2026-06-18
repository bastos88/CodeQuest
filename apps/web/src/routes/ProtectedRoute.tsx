import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user, isAuthReady } = useAuth();
  const location = useLocation();

  if (!isAuthReady) {
    return null;
  }

  return user ? (
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
