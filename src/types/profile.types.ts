export interface UserStats {
  workoutsCompleted: number;
  totalMinutes: number;
  streakDays: number;
  achievementsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress?: {
    current: number;
    target: number;
  };
}

export interface WorkoutHistory {
  id: string;
  type: string;
  title: string;
  duration: number;
  caloriesBurned: number;
  completedAt: Date;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  memberSince: Date;
  level: number;
  stats: UserStats;
  achievements: Achievement[];
  recentWorkouts: WorkoutHistory[];
  fitnessGoals: string[];
  allowDirectMessages?: boolean;
}