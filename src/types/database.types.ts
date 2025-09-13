export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PostType = 'workout' | 'achievement' | 'general';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          display_name: string | null
          username: string | null
          bio: string | null
          avatar_url: string | null
          fitness_goals: string[]
          level: number
          stats: {
            workoutsCompleted: number
            totalMinutes: number
            streakDays: number
            achievementsCount: number
            followersCount: number
            followingCount: number
          } | null
          achievements: Array<{
            id: string
            title: string
            description: string
            icon: string
            unlockedAt: string | null
            progress?: {
              current: number
              target: number
            }
          }> | null
          recent_workouts: Array<{
            id: string
            type: string
            title: string
            duration: number
            caloriesBurned: number
            completedAt: string
          }> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          display_name?: string | null
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          fitness_goals?: string[]
          level?: number
          stats?: {
            workoutsCompleted: number
            totalMinutes: number
            streakDays: number
            achievementsCount: number
            followersCount: number
            followingCount: number
          } | null
          achievements?: Array<{
            id: string
            title: string
            description: string
            icon: string
            unlockedAt: string | null
            progress?: {
              current: number
              target: number
            }
          }> | null
          recent_workouts?: Array<{
            id: string
            type: string
            title: string
            duration: number
            caloriesBurned: number
            completedAt: string
          }> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          display_name?: string | null
          username?: string | null
          bio?: string | null
          avatar_url?: string | null
          fitness_goals?: string[]
          level?: number
          stats?: {
            workoutsCompleted: number
            totalMinutes: number
            streakDays: number
            achievementsCount: number
            followersCount: number
            followingCount: number
          } | null
          achievements?: Array<{
            id: string
            title: string
            description: string
            icon: string
            unlockedAt: string | null
            progress?: {
              current: number
              target: number
            }
          }> | null
          recent_workouts?: Array<{
            id: string
            type: string
            title: string
            duration: number
            caloriesBurned: number
            completedAt: string
          }> | null
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          name: string
          primary_muscle: string
          equipment: string | null
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          primary_muscle: string
          equipment?: string | null
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          primary_muscle?: string
          equipment?: string | null
          media_url?: string | null
          created_at?: string
        }
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
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          level: string
          goal: string
          duration_min: number
          tags: string[]
          signature: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          level?: string
          goal?: string
          duration_min?: number
          tags?: string[]
          signature?: string
          created_at?: string
        }
      }
      workout_blocks: {
        Row: {
          id: string
          workout_id: string
          order: number
          type: string
          target: string | null
          reps: number | null
          time_sec: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          order: number
          type: string
          target?: string | null
          reps?: number | null
          time_sec?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          order?: number
          type?: string
          target?: string | null
          reps?: number | null
          time_sec?: number | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          started_at: string
          completed_at: string | null
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          started_at?: string
          completed_at?: string | null
          status: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          started_at?: string
          completed_at?: string | null
          status?: string
        }
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
      }
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string | null;
          media_url: string[] | null;
          type: PostType;
          workout_id: string | null;
          achievement_id: string | null;
          created_at: string;
          updated_at: string;
          likes_count: number;
          comments_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string | null;
          media_url?: string[] | null;
          type: PostType;
          workout_id?: string | null;
          achievement_id?: string | null;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          comments_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string | null;
          media_url?: string[] | null;
          type?: PostType;
          workout_id?: string | null;
          achievement_id?: string | null;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
          comments_count?: number;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
          likes_count: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          likes_count?: number;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      followers: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}