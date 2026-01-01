import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Global admin session storage (simple and reliable)
let adminSession: any = null;

// Simple storage helper
const saveAdminSession = (user: any) => {
  adminSession = user;
  // Use localStorage for persistence across refreshes
  try {
    localStorage.setItem('adminSession', JSON.stringify(user));
  } catch (e) {
    console.log('localStorage not available');
  }
};

const loadAdminSession = () => {
  // First try global variable
  if (adminSession) {
    return adminSession;
  }
  
  // Then try localStorage
  try {
    const stored = localStorage.getItem('adminSession');
    if (stored) {
      adminSession = JSON.parse(stored);
      return adminSession;
    }
  } catch (e) {
    console.log('localStorage not available');
  }
  
  return null;
};

const clearAdminSession = () => {
  adminSession = null;
  try {
    localStorage.removeItem('adminSession');
  } catch (e) {
    console.log('localStorage not available');
  }
};

type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
  app_metadata?: {
    role?: string;
    provider?: string;
  };
  email_confirmed_at?: string | null;
};

type AuthResponse = {
  user: User | null;
  session: any;
  error: Error | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        
        // First check if there's a stored admin session
        const storedAdminUser = loadAdminSession();
        console.log('Stored admin user:', storedAdminUser);
        
        if (storedAdminUser) {
          console.log('Found admin session, setting user state');
          setUser(storedAdminUser);
          setLoading(false);
          return;
        }

        console.log('No admin session found, checking Supabase...');
        // Then check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Supabase session:', session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        console.log('Session check completed, setting loading to false');
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Handle admin user with special bypass for development
      if ((email === 'admin@swiftship.com' || email === 'admin@example.com') && password === 'admin123') {
        console.log('Admin login detected, creating session...');
        
        // Create a mock admin user session for development
        const adminUser = {
          id: 'admin-dev-id',
          email: 'admin@swiftship.com',
          user_metadata: {
            full_name: 'Admin User',
            role: 'admin'
          },
          app_metadata: {
            role: 'admin'
          },
          email_confirmed_at: new Date().toISOString()
        };

        // Set the user state directly
        setUser(adminUser);
        
        // Store admin session for persistence
        saveAdminSession(adminUser);
        console.log('Admin user stored in session:', adminUser);
        
        return { 
          user: adminUser, 
          session: { user: adminUser, access_token: 'dev-token' }, 
          error: null 
        };
      }
      
      // Regular sign in for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
      
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session, error: null };
      
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, session: null, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user:', user);
      
      // Check if it's the development admin user
      if (user?.email === 'admin@swiftship.com' && user?.id === 'admin-dev-id') {
        // For dev admin, clear the user state and session
        setUser(null);
        clearAdminSession();
        console.log('Admin session cleared');
        navigate('/');
        return { error: null };
      }
      
      // For regular users, use Supabase sign out
      const { error } = await supabase.auth.signOut();
      navigate('/');
      return { error: error || null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};