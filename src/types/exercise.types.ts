// Exercise Library Types - Updated for Supabase Integration
export type MuscleGroup = 
  | 'chest' 
  | 'back' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'forearms'
  | 'abs' 
  | 'obliques' 
  | 'lower_back'
  | 'quadriceps' 
  | 'hamstrings' 
  | 'glutes' 
  | 'calves'
  | 'cardio'
  | 'full_body';

export type EquipmentType = 
  | 'bodyweight' 
  | 'dumbbells' 
  | 'barbell' 
  | 'kettlebell'
  | 'resistance_bands' 
  | 'cable_machine' 
  | 'pull_up_bar'
  | 'bench' 
  | 'exercise_ball' 
  | 'medicine_ball'
  | 'treadmill' 
  | 'stationary_bike' 
  | 'rowing_machine'
  | 'foam_roller'
  | 'none';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseCategory = 
  | 'strength' 
  | 'cardio' 
  | 'flexibility' 
  | 'mobility' 
  | 'balance' 
  | 'endurance'
  | 'power'
  | 'rehabilitation';

export type ForceType = 'push' | 'pull' | 'static' | 'explosive';
export type MechanicsType = 'compound' | 'isolation';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// Supabase Database Types
export interface ExerciseCategoryDB {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseDB {
  id: string;
  name: string;
  slug: string;
  description?: string;
  instructions: string[];
  
  // Media
  image_url?: string;
  gif_url?: string;
  video_url?: string;
  youtube_id?: string;
  
  // Classification
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  category_id?: string;
  
  // Exercise Details
  force_type?: ForceType;
  mechanics?: MechanicsType;
  
  // Additional Info
  tips: string[];
  common_mistakes: string[];
  variations: string[];
  contraindications: string[];
  
  // Workout Metadata
  calories_per_minute?: number;
  recommended_sets?: number;
  recommended_reps?: string;
  recommended_rest_seconds?: number;
  
  // Search and Organization
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  popularity_score: number;
  
  // Admin
  created_by?: string;
  approved_by?: string;
  approval_status: ApprovalStatus;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Frontend Types (transformed from DB)
export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string;
  instructions: string[];
  
  // Visual Media
  image_url?: string;
  gif_url?: string;
  video_url?: string;
  youtube_id?: string;
  
  // Exercise Classification
  primary_muscles: MuscleGroup[];
  secondary_muscles: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  category?: ExerciseCategory;
  
  // Exercise Details
  force_type?: ForceType;
  mechanics?: MechanicsType;
  
  // Additional Info
  tips?: string[];
  common_mistakes?: string[];
  variations?: string[];
  contraindications?: string[];
  
  // Meta Information
  created_at: string;
  updated_at: string;
  
  // Workout metadata
  calories_per_minute?: number;
  recommended_sets?: number;
  recommended_reps?: string;
  rest_time?: number;
  
  // Search optimization
  tags: string[];
  popularity_score: number;
  is_featured: boolean;
}

// API Types
export interface ExerciseFilter {
  muscle_groups?: MuscleGroup[];
  equipment?: EquipmentType[];
  difficulty?: DifficultyLevel[];
  category?: ExerciseCategory[];
  search_query?: string;
  is_featured?: boolean;
}

export interface ExerciseSearchParams {
  search_query?: string;
  muscle_groups?: string[];
  equipment_types?: string[];
  difficulty_levels?: string[];
  category_ids?: string[];
  limit_count?: number;
  offset_count?: number;
}

export interface ExerciseSearchResult {
  exercises: Exercise[];
  total_count: number;
  filtered_count: number;
}

// Exercise Creation/Update Types
export interface CreateExerciseData {
  name: string;
  description?: string;
  instructions: string[];
  primary_muscles: string[];
  secondary_muscles?: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  category_id?: string;
  force_type?: ForceType;
  mechanics?: MechanicsType;
  tips?: string[];
  common_mistakes?: string[];
  variations?: string[];
  youtube_id?: string;
  image_url?: string;
  tags?: string[];
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {
  id: string;
}

// Admin Types
export interface ExerciseAdmin extends Exercise {
  created_by?: string;
  approved_by?: string;
  approval_status: ApprovalStatus;
}

// Import/Export Types
export interface ExerciseImportData {
  name: string;
  description?: string;
  instructions?: string[];
  muscle_groups?: string[];
  equipment?: string[];
  difficulty?: string;
  category?: string;
  youtube_search?: string; // For auto-finding YouTube videos
  tips?: string[];
  variations?: string[];
}