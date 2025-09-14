export type DatabaseProfile = {
  id: string;
  email: string | null;
  name: string | null;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  fitness_goals: string[];
  level: number;
  stats: {
    workoutsCompleted: number;
    totalMinutes: number;
    streakDays: number;
    achievementsCount: number;
    followersCount: number;
    followingCount: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string | null;
    progress?: {
      current: number;
      target: number;
    };
  }>;
  recent_workouts: Array<{
    id: string;
    type: string;
    title: string;
    duration: number;
    caloriesBurned: number;
    completedAt: string;
  }>;
  created_at: string;
  updated_at: string;
};

export type DbResult<T> = T extends null ? null : T extends Array<any> ? T[number] : T;