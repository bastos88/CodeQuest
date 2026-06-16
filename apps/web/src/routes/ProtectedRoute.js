import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function ProtectedRoute() {
    const { user } = useAuth();
    const location = useLocation();
    return user ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", replace: true, state: { redirectTo: location.pathname + location.search + location.hash } });
}
