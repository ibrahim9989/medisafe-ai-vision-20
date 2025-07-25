
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from '@/services/securityService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  validatePassword: (password: string) => { isValid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiters for authentication attempts
const signInRateLimit = SecurityService.createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const signUpRateLimit = SecurityService.createRateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Enhanced security logging
        if (session?.user) {
          await supabase.functions.invoke('audit-logging', {
            body: {
              userId: session.user.id,
              action: event === 'SIGNED_IN' ? 'login_success' : 'session_refresh',
              resource: 'auth',
              metadata: {
                event,
                provider: session.user.app_metadata?.provider || 'email',
                timestamp: new Date().toISOString()
              }
            }
          });
        }

        // Handle successful authentication with enhanced security
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, current path:', window.location.pathname);
          
          // Secure URL cleanup
          if (window.location.hash.includes('access_token')) {
            const url = new URL(window.location.href);
            url.hash = '';
            window.history.replaceState(null, '', url.toString());
          }
          
          // Only redirect if we're on the auth page
          if (window.location.pathname === '/auth') {
            console.log('Redirecting to /home');
            window.location.href = '/home';
          }
        }

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to /auth');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string) => {
    return SecurityService.validatePasswordStrength(password);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Input validation
    if (!SecurityService.validateEmail(email)) {
      return { error: { message: 'Please enter a valid email address' } };
    }

    const passwordValidation = SecurityService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { error: { message: passwordValidation.errors.join(', ') } };
    }

    // Rate limiting
    const clientId = `${email}_${Date.now()}`;
    if (!signUpRateLimit.isAllowed(clientId)) {
      return { error: { message: 'Too many signup attempts. Please try again later.' } };
    }

    const sanitizedFullName = fullName ? SecurityService.sanitizeInput(fullName, 100) : '';
    const redirectUrl = `${window.location.origin}/home`;
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedFullName
          }
        }
      });

      if (error) {
        // Log failed signup attempt
        await supabase.functions.invoke('audit-logging', {
          body: {
            userId: 'anonymous',
            action: 'signup_failed',
            resource: 'auth',
            metadata: {
              email: email.toLowerCase().trim(),
              error: error.message,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      return { error };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    // Input validation
    if (!SecurityService.validateEmail(email)) {
      return { error: { message: 'Please enter a valid email address' } };
    }

    if (!password || password.length < 6) {
      return { error: { message: 'Please enter a valid password' } };
    }

    // Rate limiting
    const clientId = email.toLowerCase().trim();
    if (!signInRateLimit.isAllowed(clientId)) {
      return { error: { message: 'Too many login attempts. Please try again in 15 minutes.' } };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        // Log failed login attempt
        await supabase.functions.invoke('audit-logging', {
          body: {
            userId: 'anonymous',
            action: 'login_failed',
            resource: 'auth',
            metadata: {
              email: email.toLowerCase().trim(),
              error: error.message,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      return { error };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred during login' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });

      if (error) {
        await supabase.functions.invoke('audit-logging', {
          body: {
            userId: 'anonymous',
            action: 'google_login_failed',
            resource: 'auth',
            metadata: {
              error: error.message,
              timestamp: new Date().toISOString()
            }
          }
        });
      }

      return { error };
    } catch (error) {
      return { error: { message: 'An unexpected error occurred with Google sign in' } };
    }
  };

  const signOut = async () => {
    console.log('Signing out user');
    if (user) {
      await supabase.functions.invoke('audit-logging', {
        body: {
          userId: user.id,
          action: 'logout',
          resource: 'auth',
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      });
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading,
    validatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
