/**
 * TypeScript types and interfaces for the Workout Creator system
 * These types correspond to the database schema for custom workouts
 */

export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutSessionStatus = 'in_progress' | 'completed' | 'cancelled' | 'paused';
export type WorkoutType = 'custom' | 'template' | 'manual';

/**
 * Custom workout created by users
 */
export interface CustomWorkout {
  id: string;
  user_id: string;
  name: string;
  description: string;
  difficulty: WorkoutDifficulty;
  
  // Workout metadata
  estimated_duration?: number; // minutes
  estimated_calories?: number;
  total_exercises: number;
  
  // Categorization
  tags: string[];
  primary_muscle_groups: string[];
  equipment_needed: string[];
  
  // Visual and social features
  hero_image_url?: string;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  use_count: number;
  share_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Exercise within a custom workout
 */
export interface CustomWorkoutExercise {
  id: string;
  custom_workout_id: string;
  exercise_id: string;
  
  // Exercise order and grouping
  order_index: number;
  superset_group?: number; // null for individual exercises
  
  // Set configuration
  sets: number;
  reps: string; // "8-12", "AMRAP", "30 seconds", "to failure"
  weight_suggestion?: number;
  rest_seconds: number;
  
  // Additional configuration
  notes: string;
  is_warmup: boolean;
  is_cooldown: boolean;
}

/**
 * Workout exercise with full exercise details (joined data)
 */
export interface WorkoutExerciseDetails extends CustomWorkoutExercise {
  exercise: {
    id: string;
    name: string;
    description: string;
    instructions: string[];
    image_url?: string;
    youtube_id?: string;
    primary_muscles: string[];
    secondary_muscles: string[];
    equipment: string[];
    difficulty: string;
    category_id: string;
  };
}

/**
 * Set configuration for an exercise
 */
export interface SetConfiguration {
  type: 'standard' | 'superset' | 'circuit' | 'time_based' | 'amrap' | 'emom';
  sets: number;
  reps: string;
  weight?: number;
  rest_seconds: number;
  notes?: string;
}

/**
 * Individual set result during workout execution
 */
export interface SetResult {
  set: number;
  reps: number;
  weight?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  rest_seconds?: number;
  notes?: string;
  completed_at?: string;
}

/**
 * Workout session tracking actual execution
 */
export interface WorkoutSession {
  id: string;
  user_id: string;
  custom_workout_id?: string;
  
  // Session identification
  workout_name: string;
  workout_type: WorkoutType;
  
  // Session timing
  started_at: string;
  completed_at?: string;
  paused_duration: number; // seconds
  
  // Session status
  status: WorkoutSessionStatus;
  
  // Performance metrics
  total_duration?: number; // minutes
  calories_burned?: number;
  exercises_completed: number;
  total_sets: number;
  total_reps: number;
  total_weight_lifted: number;
  
  // Subjective metrics
  difficulty_rating?: number; // 1-10
  energy_level?: number; // 1-10 (pre-workout)
  fatigue_level?: number; // 1-10 (post-workout)
  
  // Session notes
  notes: string;
  
  created_at: string;
}

/**
 * Exercise results within a workout session
 */
export interface WorkoutExerciseResult {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  custom_workout_exercise_id?: string;
  
  // Exercise identification
  exercise_name: string;
  order_index: number;
  
  // Set-by-set results
  set_results: SetResult[];
  
  // Exercise summary
  total_sets: number;
  total_reps: number;
  total_weight: number;
  max_weight: number;
  average_rpe?: number;
  
  // Timing
  exercise_duration?: number; // seconds
  started_at?: string;
  completed_at?: string;
  
  notes: string;
}

/**
 * Workout like for social features
 */
export interface WorkoutLike {
  id: string;
  user_id: string;
  custom_workout_id: string;
  created_at: string;
}

/**
 * Extended workout details with statistics
 */
export interface WorkoutDetails extends CustomWorkout {
  exercise_count: number;
  average_difficulty_rating: number;
  session_count: number;
  creator_name?: string;
  creator_username?: string;
  exercises?: WorkoutExerciseDetails[];
  is_liked?: boolean; // whether current user liked this workout
}

/**
 * Workout creation/editing form data
 */
export interface WorkoutFormData {
  name: string;
  description: string;
  difficulty: WorkoutDifficulty;
  tags: string[];
  hero_image_url?: string;
  is_public: boolean;
  exercises: WorkoutExerciseFormData[];
}

/**
 * Exercise form data for workout creation
 */
export interface WorkoutExerciseFormData {
  exercise_id: string;
  sets: number;
  reps: string;
  weight_suggestion?: number;
  rest_seconds: number;
  notes: string;
  is_warmup: boolean;
  is_cooldown: boolean;
  superset_group?: number;
}

/**
 * Workout execution state for tracking progress
 */
export interface WorkoutExecutionState {
  session_id: string;
  current_exercise_index: number;
  current_set: number;
  is_resting: boolean;
  rest_time_remaining: number;
  exercise_results: WorkoutExerciseResult[];
  session_start_time: Date;
  is_paused: boolean;
  pause_start_time?: Date;
  total_pause_duration: number;
}

/**
 * Workout statistics for analytics
 */
export interface WorkoutStats {
  total_workouts_created: number;
  total_sessions_completed: number;
  total_time_worked_out: number; // minutes
  total_calories_burned: number;
  total_weight_lifted: number;
  average_session_duration: number;
  favorite_exercises: string[];
  streak_days: number;
  personal_records: PersonalRecord[];
}

/**
 * Personal record tracking
 */
export interface PersonalRecord {
  exercise_id: string;
  exercise_name: string;
  record_type: 'max_weight' | 'max_reps' | 'max_volume' | 'best_time';
  value: number;
  unit: string; // 'lbs', 'kg', 'reps', 'seconds', 'minutes'
  achieved_at: string;
  session_id: string;
}

/**
 * Workout search and filter options
 */
export interface WorkoutSearchFilters {
  query?: string;
  difficulty?: WorkoutDifficulty[];
  duration_min?: number;
  duration_max?: number;
  muscle_groups?: string[];
  equipment?: string[];
  tags?: string[];
  sort_by?: 'created_at' | 'popularity' | 'difficulty' | 'duration' | 'likes';
  sort_order?: 'asc' | 'desc';
  is_public?: boolean;
  created_by_user?: boolean;
}

/**
 * Workout sharing options
 */
export interface WorkoutSharingOptions {
  share_type: 'link' | 'social' | 'export';
  include_results?: boolean;
  allow_modifications?: boolean;
  expiry_date?: string;
}

/**
 * Template for quick workout creation
 */
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: WorkoutDifficulty;
  estimated_duration: number;
  exercises: WorkoutExerciseFormData[];
  tags: string[];
  is_premium?: boolean;
}

/**
 * Workout recommendation based on user preferences
 */
export interface WorkoutRecommendation {
  workout: WorkoutDetails;
  score: number;
  reasons: string[];
  match_percentage: number;
}

/**
 * Export types for external use
 */
export type {
  CustomWorkout as Workout,
  WorkoutSession as Session,
  WorkoutExerciseResult as ExerciseResult,
  SetResult as Set
};