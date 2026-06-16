import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PageShell } from './components/PageShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Admin } from './pages/Admin';
import { Arena } from './pages/Arena';
import { Contribute } from './pages/Contribute';
import { Dashboard } from './pages/Dashboard';
import { ForgotPassword, Home, Login, Register } from './pages/AuthPages';
import { AboutPage, CookiesPage, PrivacyPage, TermsPage } from './pages/InstitutionalPages';
import { OAuthCallback } from './pages/OAuthCallback';
import { Profile } from './pages/Profile';
import { Quiz } from './pages/Quiz';
import { QuizSetupPage } from './pages/QuizSetupPage';
import { Ranking } from './pages/Ranking';
import './index.css';
const router = createBrowserRouter([
    { path: '/', element: _jsx(Home, {}) },
    { path: '/login', element: _jsx(Login, {}) },
    { path: '/register', element: _jsx(Register, {}) },
    { path: '/forgot-password', element: _jsx(ForgotPassword, {}) },
    { path: '/oauth/callback', element: _jsx(OAuthCallback, {}) },
    { path: '/sobre', element: _jsx(AboutPage, {}) },
    { path: '/termos', element: _jsx(TermsPage, {}) },
    { path: '/privacidade', element: _jsx(PrivacyPage, {}) },
    { path: '/cookies', element: _jsx(CookiesPage, {}) },
    {
        element: _jsx(ProtectedRoute, {}),
        children: [
            {
                element: _jsx(PageShell, {}),
                children: [
                    { path: '/dashboard', element: _jsx(Dashboard, {}) },
                    { path: '/quiz', element: _jsx(QuizSetupPage, {}) },
                    { path: '/quiz/session', element: _jsx(Quiz, {}) },
                    { path: '/arena', element: _jsx(Arena, {}) },
                    { path: '/ranking', element: _jsx(Ranking, {}) },
                    { path: '/profile', element: _jsx(Profile, {}) },
                    { path: '/contribute', element: _jsx(Contribute, {}) },
                    { path: '/contribuir', element: _jsx(Contribute, {}) },
                    { path: '/my-questions', element: _jsx(Contribute, {}) },
                    { path: '/admin', element: _jsx(Admin, {}) },
                    { path: '*', element: _jsx(Navigate, { to: "/dashboard", replace: true }) },
                ],
            },
        ],
    },
]);
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(RouterProvider, { router: router, future: { v7_startTransition: true } }) }) }) }));
