import { useState, useEffect } from 'react';
import * as React from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  // Fetch user profile from user_profiles table
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('[useAuth] Fetching profile for user:', userId);
    try {
      // Add timeout to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.warn('[useAuth] Error fetching profile:', error.message, error);
        return null;
      }

      if (!data) {
        console.warn('[useAuth] No profile data found for user:', userId);
        return null;
      }

      const profile = {
        id: data.id,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at
      };
      console.log('[useAuth] Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('[useAuth] CRITICAL - Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log('[useAuth] Initializing auth state...');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Initial session check:', session?.user?.id || 'no session');
      if (session?.user) {
        console.log('[useAuth] Session exists, fetching profile...');
        fetchUserProfile(session.user.id)
          .then(profile => {
            console.log('[useAuth] Initial profile fetch completed, profile:', profile);
            setAuthState({
              user: session.user,
              profile,
              loading: false,
              error: null
            });
          })
          .catch(error => {
            console.error('[useAuth] Error in initial profile fetch, continuing anyway:', error);
            // Even if profile fetch fails, set user as authenticated
            setAuthState({
              user: session.user,
              profile: null,
              loading: false,
              error: null
            });
          });
      } else {
        console.log('[useAuth] No session, setting unauthenticated state');
        setAuthState({ user: null, profile: null, loading: false, error: null });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuth] onAuthStateChange triggered:', event, 'user:', session?.user?.id);
      if (session?.user) {
        console.log('[useAuth] onAuthStateChange - User session detected, fetching profile...');
        try {
          const profile = await fetchUserProfile(session.user.id);
          console.log('[useAuth] onAuthStateChange - Profile fetch completed:', profile);
          console.log('[useAuth] onAuthStateChange - Setting authenticated state');
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null
          });
          console.log('[useAuth] onAuthStateChange - State updated successfully');
        } catch (error) {
          console.error('[useAuth] Error fetching profile in onAuthStateChange, continuing anyway:', error);
          // Even if profile fetch fails, set user as authenticated
          setAuthState({
            user: session.user,
            profile: null,
            loading: false,
            error: null
          });
          console.log('[useAuth] onAuthStateChange - State updated with null profile');
        }
      } else {
        console.log('[useAuth] onAuthStateChange - No session, clearing state');
        setAuthState({ user: null, profile: null, loading: false, error: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up with email
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: null
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      // Si hay sesión, el usuario fue creado y autenticado inmediatamente (sin confirmación de email)
      if (data.session && data.user) {
        // Crear perfil inicial desde metadata
        const profile = {
          id: data.user.id,
          fullName: data.user.user_metadata?.full_name || fullName,
          avatarUrl: null,
          createdAt: data.user.created_at
        };
        
        setAuthState({
          user: data.user,
          profile,
          loading: false,
          error: null
        });
      } else {
        // Usuario creado pero requiere confirmación de email
        setAuthState(prev => ({ ...prev, loading: false, error: null }));
      }

      return { data, error: null };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  };

  // Sign in with email
  const signIn = async (email: string, password: string) => {
    console.log('[useAuth] signIn called for:', email);
    try {
      console.log('[useAuth] Setting loading state to true');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('[useAuth] signInWithPassword response:', { hasData: !!data, hasError: !!error, user: data?.user?.id });
      if (error) throw error;

      if (data.user) {
        console.log('[useAuth] User logged in, fetching profile...');
        // Try to fetch profile, but don't fail if it doesn't exist
        let profile = null;
        try {
          profile = await fetchUserProfile(data.user.id);
          if (!profile) {
            console.warn('[useAuth] Profile is null, creating from user metadata');
            profile = {
              id: data.user.id,
              fullName: data.user.user_metadata?.full_name || null,
              avatarUrl: null,
              createdAt: data.user.created_at
            };
          }
        } catch (e) {
          console.warn('[useAuth] Profile fetch failed, using user metadata:', e);
          profile = {
            id: data.user.id,
            fullName: data.user.user_metadata?.full_name || null,
            avatarUrl: null,
            createdAt: data.user.created_at
          };
        }
        
        console.log('[useAuth] Setting auth state - user logged in successfully');
        setAuthState({
          user: data.user,
          profile,
          loading: false,
          error: null
        });
      }

      console.log('[useAuth] signIn returning success');
      return { data, error: null };
    } catch (error: any) {
      console.error('[useAuth] CRITICAL - signIn error:', error);
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      return { data: null, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      setAuthState({ user: null, profile: null, loading: false, error: null });
      
      return { error: null };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }
  };

  // Update user profile
  const updateProfile = async (updates: { fullName?: string; avatarUrl?: string }) => {
    if (!authState.user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) throw error;

      // Refresh profile
      const profile = await fetchUserProfile(authState.user.id);
      setAuthState(prev => ({ ...prev, profile }));

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const returnValue = {
    user: authState.user,
    profile: authState.profile,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  // Log whenever isAuthenticated changes
  React.useEffect(() => {
    console.log('[useAuth] Auth state changed:', {
      hasUser: !!authState.user,
      userId: authState.user?.id,
      isAuthenticated: !!authState.user,
      loading: authState.loading,
      hasProfile: !!authState.profile
    });
  }, [authState.user, authState.loading, authState.profile]);

  return returnValue;
};
