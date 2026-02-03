import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { RequireAdmin, RequireAuth } from './guards';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MyRequestsPage from './pages/MyRequestsPage';
import NewRequestPage from './pages/NewRequestPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserProfileByIdPage from './pages/UserProfileByIdPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: (
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'requests/me',
        element: (
          <RequireAuth>
            <MyRequestsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'type/:type/new/requests',
        element: (
          <RequireAuth>
            <NewRequestPage />
          </RequireAuth>
        ),
      },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
      {
        path: 'users/:id/profile',
        element: (
          <RequireAuth>
            <UserProfileByIdPage />
          </RequireAuth>
        ),
      },
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: (
              <RequireAdmin>
                <AdminHomePage />
              </RequireAdmin>
            ),
          },
          {
            path: 'requests',
            element: (
              <RequireAdmin>
                <AdminRequestsPage />
              </RequireAdmin>
            ),
          },
          {
            path: 'users',
            element: (
              <RequireAdmin>
                <AdminUsersPage />
              </RequireAdmin>
            ),
          },
        ],
      },
    ],
  },
]);
