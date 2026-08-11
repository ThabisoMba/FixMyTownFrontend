/**
 * ProtectedRoute.jsx
 * ------------------
 * Wrap any route element with <ProtectedRoute role="admin"> and it
 * will redirect to /login if nobody's logged in, or to their own
 * dashboard if they're logged in as the wrong role.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HOME_BY_ROLE = {
  citizen: '/citizen/dashboard',
  admin: '/admin/dashboard',
  worker: '/worker/dashboard'
};

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={HOME_BY_ROLE[user.role] || '/login'} replace />;
  }

  return children;
}
