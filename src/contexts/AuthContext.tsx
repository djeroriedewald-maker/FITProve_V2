import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/profile.types';
import { Profiles } from '../types/schema.types';

type ProfileRow = Profiles['Row'];
type ProfileInsert = Profiles['Insert'];



type AuthDataState = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
};

type AuthState = AuthDataState & {
  signInWithPassword: (email: string, password: string) => Promise<Session | null>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: (opts?: { force?: boolean }) => Promise<void>;
  cancelProfileFetch: () => void;
  getDebugInfo: () => { inFlight: boolean; startedAt: number | null };
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  signInWithPassword: async () => {
    throw new Error('AuthContext not initialized');
  },
  signUp: async () => {
    throw new Error('AuthContext not initialized');
  },
  signOut: async () => {
    throw new Error('AuthContext not initialized');
  },
  resetPassword: async () => {
    throw new Error('AuthContext not initialized');
  },
  updatePassword: async () => {
    throw new Error('AuthContext not initialized');
  },
  refreshProfile: async () => {
    throw new Error('AuthContext not initialized');
  },
  cancelProfileFetch: () => {
    throw new Error('AuthContext not initialized');
  },
  getDebugInfo: () => ({ inFlight: false, startedAt: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthDataState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Track mounted state
  const isMountedRef = useRef(true);
  const fetchingProfileRef = useRef<string | null>(null); // Track which profile is being fetched
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // (Removed) withTimeout helper to avoid artificial cutoffs; we now rely on native timeouts

  const fetchProfile = async (userId: string, force: boolean = false) => {
    // If we already have a profile for this user and not forcing, skip
    if (!force && state.profile?.id === userId && !state.error) {
      console.info('[Auth] fetchProfile:skip - profile already loaded', { userId });
      return;
    }

    // Prevent multiple simultaneous fetches for the same user
    if (!force && fetchingProfileRef.current === userId) {
      console.info('[Auth] fetchProfile:skip - already fetching for user', { userId });
      return;
    }

    console.info('[Auth] fetchProfile:start', { userId, force });
    fetchingProfileRef.current = userId;
    
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Only set loading if we don't already have this user's profile
    setState(prev => {
      if (prev.user?.id !== userId || force || !prev.profile) {
        return { ...prev, isLoading: true, error: null };
      }
      return prev;
    });
    
    // Set a longer timeout for profile loading
    fetchTimeoutRef.current = setTimeout(() => {
      if (fetchingProfileRef.current === userId) {
        console.warn('[Auth] fetchProfile:timeout', { userId });
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: new Error('Profile loading timed out. Please try again.')
        }));
        fetchingProfileRef.current = null;
      }
    }, 15000); // 15 second timeout instead of 10
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, name, username, bio, avatar_url, created_at, fitness_goals, level, stats, is_public, allow_follow, allow_direct_messages')
        .eq('id', userId)
        .maybeSingle();

      // Check if we're still the active fetch
      if (fetchingProfileRef.current !== userId) {
        console.info('[Auth] fetchProfile:cancelled - newer fetch started', { userId });
        return;
      }

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        const { data: userData } = await supabase.auth.getUser();
        const authUser = userData?.user;
        if (!authUser) throw new Error('User not authenticated');

        const newProfile: ProfileInsert = {
          id: userId,
          email: authUser.email ?? '',
          name: (authUser.user_metadata as any)?.full_name ?? '',
          display_name: (authUser.user_metadata as any)?.full_name ?? '',
          username: `user_${userId.split('-')[0]}`,
          bio: '',
          avatar_url: (authUser.user_metadata as any)?.avatar_url ?? null,
          fitness_goals: [],
          level: 1,
          stats: {
            workoutsCompleted: 0,
            totalMinutes: 0,
            streakDays: 0,
            achievementsCount: 0,
            followersCount: 0,
            followingCount: 0
          },
          achievements: [],
          recent_workouts: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: inserted, error: insertError } = await (supabase.from('profiles') as any)
          .upsert(newProfile as any)
          .select('id, display_name, name, username, bio, avatar_url, created_at, fitness_goals, level, stats')
          .single();

        if (insertError) throw insertError;
        const p = (inserted as unknown as ProfileRow);
        
        if (fetchingProfileRef.current === userId) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            profile: {
              id: p.id,
              displayName: p.display_name || p.name || '',
              username: p.username || '',
              bio: p.bio || '',
              avatarUrl: p.avatar_url || '',
              memberSince: new Date(p.created_at),
              fitnessGoals: p.fitness_goals || [],
              level: p.level || 1,
              stats: p.stats || {
                workoutsCompleted: 0,
                totalMinutes: 0,
                streakDays: 0,
                achievementsCount: 0,
                followersCount: 0,
                followingCount: 0
              },
              achievements: [],
              recentWorkouts: [],
              isPublic: p.is_public,
              allowFollow: p.allow_follow,
              allowDirectMessages: p.allow_direct_messages,
            },
            error: null
          }));
        }
      } else {
        const p = profileData as unknown as ProfileRow;
        if (fetchingProfileRef.current === userId) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            profile: {
              id: p.id,
              displayName: p.display_name || p.name || '',
              username: p.username || '',
              bio: p.bio || '',
              avatarUrl: p.avatar_url || '',
              memberSince: new Date(p.created_at),
              fitnessGoals: p.fitness_goals || [],
              level: p.level || 1,
              stats: p.stats || {
                workoutsCompleted: 0,
                totalMinutes: 0,
                streakDays: 0,
                achievementsCount: 0,
                followersCount: 0,
                followingCount: 0
              },
              achievements: [],
              recentWorkouts: [],
              isPublic: p.is_public,
              allowFollow: p.allow_follow,
              allowDirectMessages: p.allow_direct_messages,
            },
            error: null
          }));
        }
      }
      
      console.info('[Auth] fetchProfile:success', { userId });
    } catch (error: any) {
      console.error('[Auth] fetchProfile:error', error);
      if (fetchingProfileRef.current === userId) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error : new Error('Failed to load profile') 
        }));
      }
    } finally {
      if (fetchingProfileRef.current === userId) {
        fetchingProfileRef.current = null;
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    let isInitialized = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    const initializeSession = async () => {
      try {
        console.info('[Auth] Initializing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session check error:', error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.info(`[Auth] Retrying session check (${retryCount}/${maxRetries})...`);
            setTimeout(initializeSession, 1000 * retryCount); // Exponential backoff
            return;
          } else {
            setState(prev => ({ ...prev, error, isLoading: false }));
            return;
          }
        }

        isInitialized = true;
        if (session?.user) {
          console.info('[Auth] Initial session found, user logged in', { 
            userId: session.user.id,
            email: session.user.email 
          });
          setState(prev => {
            const newState = { ...prev, user: session.user, isLoading: false };
            // Only fetch profile if we don't already have one for this user
            if (!prev.profile || prev.profile.id !== session.user.id) {
              fetchProfile(session.user.id).catch(console.error);
            }
            return newState;
          });
        } else {
          console.info('[Auth] No initial session, user logged out');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (err) {
        console.error('[Auth] Unexpected error during session initialization:', err);
        if (retryCount < maxRetries) {
          retryCount++;
          console.info(`[Auth] Retrying session check (${retryCount}/${maxRetries})...`);
          setTimeout(initializeSession, 1000 * retryCount);
        } else {
          setState(prev => ({ 
            ...prev, 
            error: err instanceof Error ? err : new Error('Failed to initialize session'), 
            isLoading: false 
          }));
        }
      }
    };
    
    // Start initialization
    initializeSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('[Auth] onAuthStateChange', { event, hasSession: !!session, isInitialized });
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.info('[Auth] User signed in');
        setState(prev => {
          const newState = { ...prev, user: session.user };
          // Only fetch profile if we don't already have one for this user
          if (!prev.profile || prev.profile.id !== session.user.id) {
            fetchProfile(session.user.id).catch(console.error);
          }
          return newState;
        });
      } else if (event === 'SIGNED_OUT') {
        console.info('[Auth] User signed out');
        setState(prev => ({ 
          ...prev, 
          user: null, 
          profile: null, 
          isLoading: false,
          error: null
        }));
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Session was refreshed, ensure user state is current
        console.info('[Auth] Token refreshed');
        setState(prev => ({ ...prev, user: session.user }));
      } else if (event === 'USER_UPDATED' && session?.user) {
        // User data was updated
        console.info('[Auth] User updated');
        setState(prev => ({ ...prev, user: session.user }));
        await fetchProfile(session.user.id);
      }
    });

    // Handle app focus/visibility changes (when switching between apps)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isInitialized) {
        console.info('[Auth] App became visible, checking session');
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user) {
            setState(prev => {
              if (!prev.user) {
                console.info('[Auth] Restoring user session on app focus');
                fetchProfile(session.user.id).catch(console.error);
                return { ...prev, user: session.user };
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('[Auth] Error checking session on visibility change:', error);
        }
      }
    };

    // Handle window focus (when switching back to tab/app)
    const handleFocus = async () => {
      if (isInitialized) {
        console.info('[Auth] Window focused, checking session');
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error && session?.user) {
            setState(prev => {
              if (!prev.user) {
                console.info('[Auth] Restoring user session on window focus');
                fetchProfile(session.user.id).catch(console.error);
                return { ...prev, user: session.user };
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('[Auth] Error checking session on focus:', error);
        }
      }
    };

    // Add event listeners for app switching
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Session health check interval - less aggressive
    const sessionHealthCheck = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Auth] Session health check failed:', error);
          // Only sign out if error indicates invalid session
          if (error.message.includes('invalid') || error.message.includes('expired')) {
            console.warn('[Auth] Session invalid, signing out');
            setState(prev => ({ 
              ...prev, 
              user: null, 
              profile: null, 
              isLoading: false,
              error: new Error('Session expired. Please sign in again.')
            }));
          }
          return;
        }

        // Only check session consistency if we've been initialized
        if (isInitialized) {
          // Check if session state is inconsistent
          setState(prev => {
            const currentHasUser = !!prev.user;
            const sessionHasUser = !!session?.user;
            
            if (currentHasUser && !sessionHasUser) {
              console.warn('[Auth] User exists but session is null, signing out');
              return { 
                ...prev, 
                user: null, 
                profile: null, 
                isLoading: false,
                error: new Error('Session expired. Please sign in again.')
              };
            } else if (!currentHasUser && sessionHasUser) {
              console.info('[Auth] Session exists but no user state, restoring user');
              // This can happen on app resume - restore the user
              fetchProfile(session.user.id).catch(console.error);
              return { ...prev, user: session.user };
            }
            
            return prev;
          });
        }
      } catch (error) {
        console.error('[Auth] Session health check error:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes instead of 1 minute

    return () => {
      subscription.unsubscribe();
      clearInterval(sessionHealthCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const value: AuthState = {
    ...state,
    signInWithPassword: async (email: string, password: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        console.info('[Auth] signInWithPassword:start', { email });
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('[Auth] signInWithPassword:error', signInError);
          setState(prev => ({ ...prev, error: signInError, isLoading: false }));
          throw signInError;
        }

        if (data?.session) {
          console.info('[Auth] signInWithPassword:success', { userId: data.session.user.id });
          setState(prev => ({
            ...prev,
            user: data.session.user,
          }));

          try {
            await fetchProfile(data.session.user.id);
          } catch (error) {
            console.warn('[Auth] Profile fetch failed during sign in - will retry', error);
            // Non-fatal error - auth succeeded
          }

          return data.session;
        }

        setState(prev => ({ ...prev, isLoading: false }));
        throw new Error('No session returned after sign in');
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Sign in failed')
        }));
        throw error;
      }
    },

    signUp: async (email: string, password: string, fullName?: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
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

        setState(prev => ({ ...prev, isLoading: false }));
        return {
          requiresEmailConfirmation: data.user?.identities?.length === 0
        };
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Sign up failed')
        }));
        throw error;
      }
    },

    signOut: async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setState(prev => ({
          ...prev,
          user: null,
          profile: null,
          isLoading: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Sign out failed')
        }));
        throw error;
      }
    },

    resetPassword: async (email: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Password reset failed')
        }));
        throw error;
      }
    },

    updatePassword: async (newPassword: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Password update failed')
        }));
        throw error;
      }
    },

    refreshProfile: async (opts?: { force?: boolean }) => {
      if (!state.user) {
        throw new Error('Cannot refresh profile: no user logged in');
      }
      await fetchProfile(state.user.id, opts?.force);
    },
    cancelProfileFetch: () => {
      fetchingProfileRef.current = null;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    },
    getDebugInfo: () => ({ 
      inFlight: fetchingProfileRef.current !== null, 
      startedAt: fetchingProfileRef.current ? Date.now() : null 
    })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};