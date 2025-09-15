// Exercise Library Types
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

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  
  // Visual Media
  image_url?: string;
  video_url?: string;
  youtube_id?: string; // For YouTube integration
  
  // Exercise Classification
  primary_muscles: MuscleGroup[];
  secondary_muscles: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: DifficultyLevel;
  category: ExerciseCategory;
  
  // Exercise Details
  force_type?: 'push' | 'pull' | 'static';
  mechanics?: 'compound' | 'isolation';
  
  // Additional Info
  tips?: string[];
  common_mistakes?: string[];
  variations?: string[];
  
  // Meta Information
  created_at: string;
  updated_at: string;
  
  // Future Features
  calories_per_minute?: number;
  recommended_sets?: number;
  recommended_reps?: string; // "8-12" or "30 seconds"
  rest_time?: number; // seconds
  
  // Tags for searching
  tags: string[];
}

export interface ExerciseFilter {
  muscle_groups?: MuscleGroup[];
  equipment?: EquipmentType[];
  difficulty?: DifficultyLevel[];
  category?: ExerciseCategory[];
  search_query?: string;
}

export interface ExerciseSearchResult {
  exercises: Exercise[];
  total_count: number;
  filtered_count: number;
}