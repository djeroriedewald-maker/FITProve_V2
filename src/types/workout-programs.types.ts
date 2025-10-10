/**
 * Workout Programs Types
 * For creating structured workout plans
 */

export interface WorkoutProgram {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration_weeks: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramWorkout {
  id: string;
  program_id: string;
  workout_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  week_number: number; // 1-based week number
  order_index: number;
  notes?: string;
  created_at: string;
}

export interface ProgramWorkoutWithDetails extends ProgramWorkout {
  workout_name: string;
  workout_description?: string;
  difficulty: string;
  estimated_duration?: number;
  estimated_calories?: number;
  total_exercises?: number;
  hero_image_url?: string;
}

export interface WorkoutProgramWithWorkouts extends WorkoutProgram {
  workouts: ProgramWorkoutWithDetails[];
  total_workouts: number;
}

export interface CreateProgramData {
  name: string;
  description?: string;
  duration_weeks: number;
}

export interface AddWorkoutToProgramData {
  program_id: string;
  workout_id: string;
  day_of_week: number;
  week_number: number;
  order_index?: number;
  notes?: string;
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];