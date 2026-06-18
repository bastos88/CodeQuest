import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppErrorBoundary } from './components/AppErrorBoundary';
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
  { path: '/', element: <Home />, errorElement: <AppErrorBoundary /> },
  { path: '/login', element: <Login />, errorElement: <AppErrorBoundary /> },
  { path: '/register', element: <Register />, errorElement: <AppErrorBoundary /> },
  { path: '/forgot-password', element: <ForgotPassword />, errorElement: <AppErrorBoundary /> },
  { path: '/oauth/callback', element: <OAuthCallback />, errorElement: <AppErrorBoundary /> },
  { path: '/sobre', element: <AboutPage />, errorElement: <AppErrorBoundary /> },
  { path: '/termos', element: <TermsPage />, errorElement: <AppErrorBoundary /> },
  { path: '/privacidade', element: <PrivacyPage />, errorElement: <AppErrorBoundary /> },
  { path: '/cookies', element: <CookiesPage />, errorElement: <AppErrorBoundary /> },
  {
    element: <ProtectedRoute />,
    errorElement: <AppErrorBoundary />,
    children: [
      {
        element: <PageShell />,
        errorElement: <AppErrorBoundary />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/quiz', element: <QuizSetupPage /> },
          { path: '/quiz/session', element: <Quiz /> },
          { path: '/arena', element: <Arena /> },
          { path: '/ranking', element: <Ranking /> },
          { path: '/profile', element: <Profile /> },
          { path: '/contribute', element: <Contribute /> },
          { path: '/contribuir', element: <Contribute /> },
          { path: '/my-questions', element: <Contribute /> },
          { path: '/admin', element: <Admin /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} future={{ v7_startTransition: true }} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
