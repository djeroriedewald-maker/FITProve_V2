export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  preferences: WorkoutTemplatePreferences;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
  use_count: number;
  tags: string[];
}

export interface WorkoutTemplatePreferences {
  goal: string;
  duration: number;
  frequency: {
    type: string;
    days: string[];
    preferredTime?: string;
  };
  equipment: string[];
  experience?: string;
  specificMuscles?: string[];
  avoidMuscles?: string[];
  [key: string]: any; // Allow other generator-specific preferences
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  preferences: WorkoutTemplatePreferences;
  tags?: string[];
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  preferences?: WorkoutTemplatePreferences;
  tags?: string[];
}
