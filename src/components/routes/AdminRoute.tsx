import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  
  // Show loading state while checking auth status
  if (loading) {
    return <div>Loading...</div>; // You might want to replace this with a proper loading component
  }
  
  // If user is not logged in or not an admin, redirect to home
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
}
