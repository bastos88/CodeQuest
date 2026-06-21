import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { PageShell } from './components/PageShell';
import { ProtectedRoute } from './routes/ProtectedRoute';
import './index.css';

const Admin = lazy(() =>
  import('./pages/Admin').then((module) => ({ default: module.Admin })),
);
const Arena = lazy(() =>
  import('./pages/Arena').then((module) => ({ default: module.Arena })),
);
const Contribute = lazy(() =>
  import('./pages/Contribute').then((module) => ({
    default: module.Contribute,
  })),
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const Home = lazy(() =>
  import('./pages/AuthPages').then((module) => ({ default: module.Home })),
);
const Login = lazy(() =>
  import('./pages/AuthPages').then((module) => ({ default: module.Login })),
);
const Register = lazy(() =>
  import('./pages/AuthPages').then((module) => ({ default: module.Register })),
);
const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword').then((module) => ({
    default: module.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import('./pages/ResetPassword').then((module) => ({
    default: module.ResetPassword,
  })),
);
const OAuthCallback = lazy(() =>
  import('./pages/OAuthCallback').then((module) => ({
    default: module.OAuthCallback,
  })),
);
const Profile = lazy(() =>
  import('./pages/Profile').then((module) => ({ default: module.Profile })),
);
const Quiz = lazy(() =>
  import('./pages/Quiz').then((module) => ({ default: module.Quiz })),
);
const QuizSetupPage = lazy(() =>
  import('./pages/QuizSetupPage').then((module) => ({
    default: module.QuizSetupPage,
  })),
);
const Ranking = lazy(() =>
  import('./pages/Ranking').then((module) => ({ default: module.Ranking })),
);
const AboutPage = lazy(() =>
  import('./pages/InstitutionalPages').then((module) => ({
    default: module.AboutPage,
  })),
);
const CookiesPage = lazy(() =>
  import('./pages/InstitutionalPages').then((module) => ({
    default: module.CookiesPage,
  })),
);
const PrivacyPage = lazy(() =>
  import('./pages/InstitutionalPages').then((module) => ({
    default: module.PrivacyPage,
  })),
);
const TermsPage = lazy(() =>
  import('./pages/InstitutionalPages').then((module) => ({
    default: module.TermsPage,
  })),
);

const router = createBrowserRouter([
  { path: '/', element: <Home />, errorElement: <AppErrorBoundary /> },
  { path: '/login', element: <Login />, errorElement: <AppErrorBoundary /> },
  {
    path: '/register',
    element: <Register />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/oauth/callback',
    element: <OAuthCallback />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/sobre',
    element: <AboutPage />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/termos',
    element: <TermsPage />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/privacidade',
    element: <PrivacyPage />,
    errorElement: <AppErrorBoundary />,
  },
  {
    path: '/cookies',
    element: <CookiesPage />,
    errorElement: <AppErrorBoundary />,
  },
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
          {
            path: '/admin',
            element: (
              <ProtectedRoute roles={['ADMIN', 'REVIEWER']}>
                <Admin />
              </ProtectedRoute>
            ),
          },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <RouterProvider
            router={router}
            future={{ v7_startTransition: true }}
          />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
