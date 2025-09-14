import { Database } from './database.types';

export type Tables = Database['public']['Tables'];
export type Profiles = Tables['profiles'];

export interface ProfileSchema {
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
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string | null;
    progress?: {
      current: number;
      target: number;
    };
  }[];
  recent_workouts: {
    id: string;
    type: string;
    title: string;
    duration: number;
    caloriesBurned: number;
    completedAt: string;
  }[];
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<ProfileSchema, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};