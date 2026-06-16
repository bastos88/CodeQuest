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
import { Profile } from './pages/Profile';
import { Quiz } from './pages/Quiz';
import { QuizSetupPage } from './pages/QuizSetupPage';
import { Ranking } from './pages/Ranking';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PageShell />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/quiz', element: <QuizSetupPage /> },
          { path: '/quiz/session', element: <Quiz /> },
          { path: '/arena', element: <Arena /> },
          { path: '/ranking', element: <Ranking /> },
          { path: '/profile', element: <Profile /> },
          { path: '/contribute', element: <Contribute /> },
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
