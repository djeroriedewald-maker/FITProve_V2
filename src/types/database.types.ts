/**
 * Core type definitions for the FITProve database schema.
 * This file is auto-generated and should not be modified directly.
 * @package fitprove
 */

/**
 * Generic JSON value type used by Supabase
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: Json | undefined }
  | readonly Json[]

/**
 * Represents a UTC timestamp string in ISO 8601 format
 * @example "2025-09-14T12:00:00Z"
 */
export type Timestamp = string

/**
 * Available post types in the system
 */
export type PostType = 'workout' | 'achievement' | 'general'

/**
 * Status of a workout session
 */
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Type of workout block
 */
export type BlockType = 'exercise' | 'rest' | 'circuit' | 'superset'

/**
 * User fitness statistics
 */
export type ProfileStats = {
  workoutsCompleted: number
  totalMinutes: number
  streakDays: number
  achievementsCount: number
  followersCount: number
  followingCount: number
}

/**
 * Achievement data structure
 */
export type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Timestamp | null
  progress?: {
    current: number
    target: number
  }
}

/**
 * Recent workout summary
 */
export type RecentWorkout = {
  id: string
  type: string
  title: string
  duration: number
  caloriesBurned: number
  completedAt: Timestamp
}

/**
 * Auto-post settings structure
 */
export type AutoPostSettings = {
  enabled: boolean
  onWorkoutCompletion: boolean
  onMilestones: boolean
  onStreaks: boolean
  minDurationMinutes: number
  minCalories: number
  cooldownHours: number
}

/**
 * Base user profile structure
 */
export type BaseProfile = {
  id: string
  email: string | null
  name: string | null
  display_name: string | null
  username: string | null
  bio: string | null
  avatar_url: string | null
  fitness_goals: string[]
  gender: 'male' | 'female' | 'other' | null
  level: number
  stats: ProfileStats
  achievements: Achievement[]
  recent_workouts: RecentWorkout[]
  auto_post_settings: AutoPostSettings
  created_at: Timestamp
  updated_at: Timestamp

  // Fitness Profile Fields (Phase 1)
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | null
  age: number | null
  event_type: string | null
  limitations: string[]
  available_equipment: string[]
  preferred_duration: number | null
  preferred_workout_styles: string[]
  preferred_muscles: string[]
  frequency_days: string[]
  preferred_time: string | null
  onboarding_completed: boolean
  onboarding_completed_at: Timestamp | null
  last_workout_generated_at: Timestamp | null
  total_workouts_generated: number

  // Privacy & Social Settings
  is_public: boolean
  allow_follow: boolean
  allow_direct_messages: boolean
  notification_preferences: Json | null
}

/**
 * Workout session data structure
 */
export type WorkoutSession = {
  id: string
  user_id: string
  custom_workout_id: string | null
  workout_name: string
  workout_type: string
  workout_style: string
  started_at: Timestamp
  completed_at: Timestamp | null
  paused_duration: number
  status: 'in_progress' | 'completed' | 'cancelled' | 'paused'
  total_duration: number
  calories_burned: number
  exercises_completed: number
  total_sets: number
  total_reps: number
  total_weight_lifted: number
  difficulty_rating: number | null
  energy_level: number | null
  fatigue_level: number | null
  notes: string
  created_at: Timestamp
}

/**
 * User periodization tracking data
 */
export type UserPeriodization = {
  id: string
  user_id: string
  goal: string
  current_week: number
  macro_phase: 'base' | 'build' | 'peak' | 'recovery'
  micro_week: 'week1' | 'week2' | 'week3' | 'deload'
  is_deload_week: boolean
  current_volume_multiplier: number
  current_intensity_multiplier: number
  created_at: Timestamp
  updated_at: Timestamp
}

/**
 * Supabase database schema definition
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: BaseProfile
        Insert: Partial<BaseProfile>
        Update: Partial<BaseProfile>
        Relationships: []
      }
      workout_sessions: {
        Row: WorkoutSession
        Insert: Partial<WorkoutSession>
        Update: Partial<WorkoutSession>
        Relationships: []
      }
      user_periodization: {
        Row: UserPeriodization
        Insert: Partial<UserPeriodization>
        Update: Partial<UserPeriodization>
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          started_at: Timestamp
          completed_at: Timestamp | null
          status: SessionStatus
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          started_at?: Timestamp
          completed_at?: Timestamp | null
          status: SessionStatus
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          started_at?: Timestamp
          completed_at?: Timestamp | null
          status?: SessionStatus
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          name: string
          primary_muscle: string
          primary_muscles: string[] | null
          secondary_muscles: string[] | null
          equipment: string | null
          media_url: string | null
          image_url: string | null
          gif_url: string | null
          youtube_id: string | null
          difficulty: string | null
          force_type: string | null
          mechanics: string | null
          description: string | null
          instructions: string[] | null
          tips: string[] | null
          common_mistakes: string[] | null
          variations: string[] | null
          recommended_sets: string | null
          recommended_reps: string | null
          featured: boolean | null
          popularity_score: number | null
          created_at: Timestamp
        }
        Insert: {
          id?: string
          name: string
          primary_muscle: string
          primary_muscles?: string[] | null
          secondary_muscles?: string[] | null
          equipment?: string | null
          media_url?: string | null
          image_url?: string | null
          gif_url?: string | null
          youtube_id?: string | null
          difficulty?: string | null
          force_type?: string | null
          mechanics?: string | null
          description?: string | null
          instructions?: string[] | null
          tips?: string[] | null
          common_mistakes?: string[] | null
          variations?: string[] | null
          recommended_sets?: string | null
          recommended_reps?: string | null
          featured?: boolean | null
          popularity_score?: number | null
          created_at?: Timestamp
        }
        Update: {
          id?: string
          name?: string
          primary_muscle?: string
          primary_muscles?: string[] | null
          secondary_muscles?: string[] | null
          equipment?: string | null
          media_url?: string | null
          image_url?: string | null
          gif_url?: string | null
          youtube_id?: string | null
          difficulty?: string | null
          force_type?: string | null
          mechanics?: string | null
          description?: string | null
          instructions?: string[] | null
          tips?: string[] | null
          common_mistakes?: string[] | null
          variations?: string[] | null
          recommended_sets?: string | null
          recommended_reps?: string | null
          featured?: boolean | null
          popularity_score?: number | null
          created_at?: Timestamp
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          title: string
          level: string
          goal: string
          duration_min: number
          tags: string[]
          signature: string
          created_at: Timestamp
        }
        Insert: {
          id?: string
          title: string
          level: string
          goal: string
          duration_min: number
          tags: string[]
          signature: string
          created_at?: Timestamp
        }
        Update: {
          id?: string
          title?: string
          level?: string
          goal?: string
          duration_min?: number
          tags?: string[]
          signature?: string
          created_at?: Timestamp
        }
        Relationships: []
      }
      workout_blocks: {
        Row: {
          id: string
          workout_id: string
          order: number
          type: BlockType
          target: string | null
          reps: number | null
          time_sec: number | null
          created_at: Timestamp
        }
        Insert: {
          id?: string
          workout_id: string
          order: number
          type: BlockType
          target?: string | null
          reps?: number | null
          time_sec?: number | null
          created_at?: Timestamp
        }
        Update: {
          id?: string
          workout_id?: string
          order?: number
          type?: BlockType
          target?: string | null
          reps?: number | null
          time_sec?: number | null
          created_at?: Timestamp
        }
        Relationships: []
      }
      session_sets: {
        Row: {
          id: string
          session_id: string
          block_id: string
          set_idx: number
          reps: number | null
          weight: number | null
          time_sec: number | null
          rpe: number | null
        }
        Insert: {
          id?: string
          session_id: string
          block_id: string
          set_idx: number
          reps?: number | null
          weight?: number | null
          time_sec?: number | null
          rpe?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          block_id?: string
          set_idx?: number
          reps?: number | null
          weight?: number | null
          time_sec?: number | null
          rpe?: number | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          id: string
          key: string
          name: string
          description: string
          icon_url: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          description: string
          icon_url: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          description?: string
          icon_url?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string | null
          media_url: string[] | null
          type: PostType
          workout_id: string | null
          achievement_id: string | null
          created_at: Timestamp
          updated_at: Timestamp
          likes_count: number
          comments_count: number
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          media_url?: string[] | null
          type: PostType
          workout_id?: string | null
          achievement_id?: string | null
          created_at?: Timestamp
          updated_at?: Timestamp
          likes_count?: number
          comments_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          media_url?: string[] | null
          type?: PostType
          workout_id?: string | null
          achievement_id?: string | null
          created_at?: Timestamp
          updated_at?: Timestamp
          likes_count?: number
          comments_count?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          parent_id: string | null
          created_at: Timestamp
          updated_at: Timestamp
          likes_count: number
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          parent_id?: string | null
          created_at?: Timestamp
          updated_at?: Timestamp
          likes_count?: number
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          parent_id?: string | null
          created_at?: Timestamp
          updated_at?: Timestamp
          likes_count?: number
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          post_id: string | null
          comment_id: string | null
          user_id: string
          reaction_type: string
          created_at: Timestamp
        }
        Insert: {
          id?: string
          post_id?: string | null
          comment_id?: string | null
          user_id: string
          reaction_type?: string
          created_at?: Timestamp
        }
        Update: {
          id?: string
          post_id?: string | null
          comment_id?: string | null
          user_id?: string
          reaction_type?: string
          created_at?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: Timestamp
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: Timestamp
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: Timestamp
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_name: string
          awarded_at: Timestamp
        }
        Insert: {
          id?: string
          user_id: string
          badge_name: string
          awarded_at?: Timestamp
        }
        Update: {
          id?: string
          user_id?: string
          badge_name?: string
          awarded_at?: Timestamp
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json
          read: boolean
          created_at: Timestamp
          post_id: string | null
          comment_id: string | null
          from_user_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json
          read?: boolean
          created_at?: Timestamp
          post_id?: string | null
          comment_id?: string | null
          from_user_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json
          read?: boolean
          created_at?: Timestamp
          post_id?: string | null
          comment_id?: string | null
          from_user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_unread_notification_count: {
        Args: {}
        Returns: number
      }
      mark_notification_read: {
        Args: {
          notification_id: string
        }
        Returns: void
      }
      mark_all_notifications_read: {
        Args: {}
        Returns: void
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_data?: Json
          p_post_id?: string
          p_comment_id?: string
          p_from_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}