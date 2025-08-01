'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const refreshUserData = async () => {
    if (user) {
      const { data: { user: refreshedUser } } = await supabase.auth.getUser();
      setUser(refreshedUser);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        
        // Store GitHub token if available
        if (session?.provider_token && session?.user) {
          try {
            const { error } = await supabase
              .from('users')
              .upsert({ 
                id: session.user.id, 
                provider_token: session.provider_token 
              });
            
            if (error) {
              console.error('Error storing GitHub token:', error);
            }
          } catch (error) {
            console.error('Token storage error:', error);
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGitHub = async () => {
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;
    
    console.log('Attempting login with redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo user:email',
        queryParams: { prompt: 'consent' },
        redirectTo: redirectUrl,
      }
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting signOut process...');
      
      // Immediately clear user state for better UX
      setUser(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut error:', error);
      } else {
        console.log('Successfully signed out from Supabase');
      }
      
      // Clear any local storage items related to auth
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        } catch (e) {
          console.warn('Could not clear storage:', e);
        }
      }
      
      console.log('Navigating to home page...');
      // Use window.location for a hard refresh to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Unexpected logout error:', error);
      // Still try to navigate even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.push('/');
      }
    }
  };

  const value = {
    user,
    loading,
    signInWithGitHub,
    signOut,
    supabase,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}