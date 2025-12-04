import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured, type User, type Session } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  // Current user and session state
  user: User | null;
  session: Session | null;

  // Loading states
  loading: boolean;

  // Authentication methods
  signUp: (email: string, password: string, nickname?: string) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;

  // Utility
  isAuthenticated: boolean;
  isSupabaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isSupabaseEnabled = isSupabaseConfigured();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Skip auth if Supabase not configured
    if (!isSupabaseEnabled) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseEnabled]);

  const signUp = async (email: string, password: string, nickname?: string) => {
    if (!isSupabaseEnabled) {
      return { user: null, error: new Error('Supabase is not configured') };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: nickname || 'Howie', // Store nickname in auth metadata
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    // If signup successful and user needs to confirm email
    if (data.user && !data.session) {
      return {
        user: data.user,
        error: new Error('Please check your email to confirm your account'),
      };
    }

    return { user: data.user, error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseEnabled) {
      return { user: null, error: new Error('Supabase is not configured') };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  };

  const signOut = async () => {
    if (!isSupabaseEnabled) {
      return { error: new Error('Supabase is not configured') };
    }

    const { error } = await supabase.auth.signOut();

    // Clear all localStorage data on logout to prevent data leakage
    localStorage.clear();

    // Clear React Query cache to ensure fresh data on next login
    queryClient.clear();

    return { error };
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseEnabled) {
      return { error: new Error('Supabase is not configured') };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseEnabled) {
      return { error: new Error('Supabase is not configured') };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isSupabaseEnabled,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for requiring authentication
export function useRequireAuth() {
  const { user, loading, isSupabaseEnabled } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If Supabase not enabled, don't require auth
    if (!isSupabaseEnabled) {
      setChecking(false);
      return;
    }

    // Wait for auth to load
    if (!loading) {
      setChecking(false);
    }
  }, [user, loading, isSupabaseEnabled]);

  return {
    user,
    loading: checking,
    isAuthenticated: !!user || !isSupabaseEnabled,
  };
}
