import { createContext, useContext, useEffect, useState } from 'react';
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
  refreshProfile: () => Promise<void>;
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
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthDataState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Promise timeout helper to avoid infinite loading
  const withTimeout = async <T,>(p: Promise<T>, ms: number, label = 'operation'): Promise<T> => {
    return await Promise.race([
      p,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
    ]);
  };

  const fetchProfile = async (userId: string) => {
    console.info('[Auth] fetchProfile:start', { userId });
    const startTime = Date.now();
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const logTiming = (stage: string) => {
      const elapsed = Date.now() - startTime;
      console.info(`[Auth] ${stage} - ${elapsed}ms elapsed`);
    };

    try {
      // Try to get existing profile directly (single call) with a timeout
      const { data: profileData, error: profileError } = await withTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        8000,
        'profile fetch'
      );

      logTiming('Profile fetch complete');
      
      console.info('[Auth] Profile data:', {
        hasData: !!profileData,
        dataType: profileData ? typeof profileData : null,
        fields: profileData ? Object.keys(profileData) : [],
        error: profileError
      });

      console.info('[Auth] Profile fetch result:', { 
        hasData: !!profileData, 
        error: profileError 
      });

      if (profileError) {
        console.error('[Auth] Error fetching profile:', profileError);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: new Error(`Profile fetch error: ${profileError.message}`)
        }));
        return;
      }

      // If no profile exists, create one
      if (!profileData) {
        console.info('[Auth] No profile found, creating new profile');
        const { data: userData } = await supabase.auth.getUser();
        const authUser = userData?.user;
        
        if (!authUser) {
          throw new Error('User not authenticated');
        }

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

        const { data: inserted, error: insertError } = await withTimeout(
          (supabase.from('profiles') as any)
            .upsert(newProfile as any)
            .select()
            .single(),
          8000,
          'profile upsert'
        );

        if (insertError) {
          console.error('[Auth] Error creating profile:', insertError);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error(insertError.message)
          }));
          return;
        }

        if (!inserted) {
          throw new Error('Failed to create profile');
        }

        const insertedProfile = inserted as unknown as ProfileRow;
        setState(prev => ({
          ...prev,
          isLoading: false,
          profile: {
            id: insertedProfile.id,
            displayName: insertedProfile.display_name || insertedProfile.name || '',
            username: insertedProfile.username || '',
            bio: insertedProfile.bio || '',
            avatarUrl: insertedProfile.avatar_url || '',
            memberSince: new Date(insertedProfile.created_at),
            fitnessGoals: insertedProfile.fitness_goals || [],
            level: insertedProfile.level || 1,
            stats: insertedProfile.stats || {
              workoutsCompleted: 0,
              totalMinutes: 0,
              streakDays: 0,
              achievementsCount: 0,
              followersCount: 0,
              followingCount: 0
            },
            achievements: [],
            recentWorkouts: []
          }
        }));
        return;
      }

      // Profile exists, update state
      const p = profileData as unknown as ProfileRow;
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
          recentWorkouts: []
        }
      }));
    } catch (error) {
      console.error('[Auth] Unexpected error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('An unexpected error occurred')
      }));
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[Auth] Session check error:', error);
        setState(prev => ({ ...prev, error, isLoading: false }));
        return;
      }

      if (session?.user) {
        setState(prev => ({ ...prev, user: session.user }));
        fetchProfile(session.user.id).catch(console.error);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('[Auth] onAuthStateChange', { event, hasSession: !!session });
      
      if (event === 'SIGNED_IN' && session?.user) {
        setState(prev => ({ ...prev, user: session.user }));
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({ 
          ...prev, 
          user: null, 
          profile: null, 
          isLoading: false 
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
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

    refreshProfile: async () => {
      if (!state.user) {
        throw new Error('Cannot refresh profile: no user logged in');
      }
      await fetchProfile(state.user.id);
    }
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