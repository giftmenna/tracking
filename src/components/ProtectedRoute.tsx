import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Loading:', loading);

  if (loading) {
    console.log('ProtectedRoute - Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check if user has admin role - more flexible check for development admin user
  const isAdmin = user.user_metadata?.role === 'admin' || 
                  user.app_metadata?.role === 'admin' || 
                  user.email === 'admin@swiftship.com' || 
                  user.email === 'admin@example.com' ||
                  user.id === 'admin-dev-id'; // Check for our development admin ID
  
  console.log('ProtectedRoute - Is admin check:', {
    user_metadata_role: user.user_metadata?.role,
    app_metadata_role: user.app_metadata?.role,
    email: user.email,
    id: user.id,
    isAdmin
  });
  
  if (!isAdmin) {
    console.log('ProtectedRoute - User is not admin, redirecting to /');
    return <Navigate to="/" replace />; // Or to an access-denied page
  }

  console.log('ProtectedRoute - User is admin, allowing access');
  return <Outlet />;
};
