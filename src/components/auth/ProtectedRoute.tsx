import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/state/auth.store';

export function ProtectedRoute() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const location = useLocation();

  if (!hasHydrated) {
    return null; // or loader
  }

  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('Authenticated, rendering protected content');
  return <Outlet />;
}
