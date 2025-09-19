// Types for ready-made workouts in the library
export type WorkoutStyle =
  | 'HIIT'
  | 'AMRAP'
  | 'EMOM'
  | 'Tabata'
  | 'Circuit Training'
  | 'Strength / Hypertrophy'
  | 'LISS'
  | 'Chipper'
  | 'Ladder / Pyramid'
  | 'Interval Running'
  | 'Fartlek'
  | 'Complexes'
  | 'CrossFit WOD'
  | 'Partner Workouts'
  | 'Time Under Tension (TUT)'
  | 'Superset / Giant Set'
  | 'Drop Set'
  | 'Rest-Pause'
  | 'Tempo Training'
  | 'Cardio Endurance (Steady State)';

export interface ReadyWorkout {
  id: string;
  name: string;
  style: WorkoutStyle;
  description: string;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  exercises: Array<{
    id: string;
    name: string;
    description: string;
    image_url?: string;
    instructions?: string[];
    video_url?: string;
    primary_muscles?: string[];
    equipment?: string[];
  }>;
  image_url?: string;
  tags?: string[];
}
