import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PublicRoute() {
  const { user } = useAuth();
  
  // If user is logged in and tries to access public routes, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
}
