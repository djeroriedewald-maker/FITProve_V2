import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/profile.types';
import { Database } from '../types/database.types';

type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  signIn: async () => {
    throw new Error('AuthContext not initialized');
  },
  refreshProfile: async () => {
    throw new Error('AuthContext not initialized');
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, 'refreshProfile' | 'signIn'>>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = async (userId: string) => {
    console.info('[Auth] fetchProfile:start', { userId });
    try {
      // Try to get existing profile; do not throw if none
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] fetchProfile:error selecting profile', error);
        throw error;
      }

      let profileRow = data as Database['public']['Tables']['profiles']['Row'] | null;

      // If no profile row, create a minimal one
      if (!profileRow) {
        console.info('[Auth] fetchProfile:no row; creating minimal profile');
        const { data: userData } = await supabase.auth.getUser();
        const authUser = userData?.user || null;
        const minimal: ProfilesInsert = {
          id: userId,
          email: authUser?.email ?? '',
          name: (authUser?.user_metadata as any)?.full_name ?? null,
          avatar_url: (authUser?.user_metadata as any)?.avatar_url ?? null,
        };

        const { data: inserted, error: upsertError } = await supabase
          .from('profiles')
          // TypeScript helper types are not aligning; cast to any to avoid 'never' overload
          .upsert([minimal] as any, { onConflict: 'id' })
          .select('*')
          .single();

        if (upsertError) {
          console.error('[Auth] fetchProfile:upsert error', upsertError);
          setState(prev => ({ ...prev, error: upsertError }));
          return;
        }
  profileRow = inserted as ProfilesRow;
      }

      if (profileRow) {
        const profileData = profileRow as Database['public']['Tables']['profiles']['Row'];
        setState(prev => ({
          ...prev,
          profile: {
            id: profileData.id,
            displayName: profileData.display_name || profileData.name || '',
            username: profileData.username || '',
            bio: profileData.bio || '',
            avatarUrl: profileData.avatar_url || '',
            memberSince: new Date(profileData.created_at),
            fitnessGoals: profileData.fitness_goals || [],
            level: profileData.level || 1,
            stats: profileData.stats ? {
              workoutsCompleted: profileData.stats.workoutsCompleted || 0,
              totalMinutes: profileData.stats.totalMinutes || 0,
              streakDays: profileData.stats.streakDays || 0,
              achievementsCount: profileData.stats.achievementsCount || 0,
              followersCount: profileData.stats.followersCount || 0,
              followingCount: profileData.stats.followingCount || 0
            } : {
              workoutsCompleted: 0,
              totalMinutes: 0,
              streakDays: 0,
              achievementsCount: 0,
              followersCount: 0,
              followingCount: 0
            },
            achievements: (profileData.achievements || []).map(achievement => ({
              id: achievement.id,
              title: achievement.title,
              description: achievement.description,
              icon: achievement.icon,
              unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : null,
              progress: achievement.progress
            })),
            recentWorkouts: (profileData.recent_workouts || []).map(workout => ({
              id: workout.id,
              type: workout.type,
              title: workout.title,
              duration: workout.duration,
              caloriesBurned: workout.caloriesBurned,
              completedAt: new Date(workout.completedAt)
            }))
          },
        }));
        console.info('[Auth] fetchProfile:success');
      }
    } catch (error) {
      console.error('[Auth] fetchProfile:caught error', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to fetch profile'),
      }));
    }
  };

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) {
        setState(prev => ({ ...prev, error }));
        throw error;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to sign in'),
      }));
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (state.user) {
      await fetchProfile(state.user.id);
    }
  };

  useEffect(() => {
    // Safety timeout to avoid being stuck in loading forever
    const safety = setTimeout(() => {
      setState(prev => (prev.isLoading ? { ...prev, isLoading: false } : prev));
    }, 6000);

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.info('[Auth] getSession', { hasSession: !!session });
      if (session?.user) {
        await fetchProfile(session.user.id);
        setState(prev => ({
          ...prev,
          user: session.user,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          profile: null,
          isLoading: false,
        }));
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('[Auth] onAuthStateChange', { event, hasSession: !!session });
      if (session?.user) {
        await fetchProfile(session.user.id);
        setState(prev => ({
          ...prev,
          user: session.user,
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          profile: null,
          isLoading: false,
        }));
      }
    });

    return () => {
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };