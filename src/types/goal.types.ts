// Goal types for workout goal tracking system

export type GoalType =
  | 'workouts_per_week'
  | 'workout_minutes'
  | 'weight_loss'
  | 'weight_gain'
  | 'strength_increase'
  | 'streak_days'
  | 'calories_burned'
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'paused';

export interface Goal {
  id: string;
  user_id: string;
  type: GoalType;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string; // e.g., 'workouts', 'minutes', 'kg', 'days'
  deadline?: string; // ISO date string
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateGoalInput {
  type: GoalType;
  title: string;
  description?: string;
  target_value: number;
  unit: string;
  deadline?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  deadline?: string;
  status?: GoalStatus;
}

// Goal templates for easy creation
export const GOAL_TEMPLATES = [
  {
    type: 'workouts_per_week' as GoalType,
    title: 'Train 3 times per week',
    description: 'Complete 3 workouts every week',
    target_value: 3,
    unit: 'workouts',
    icon: 'dumbbell',
    color: 'cyan',
  },
  {
    type: 'workout_minutes' as GoalType,
    title: 'Train 150 minutes per week',
    description: 'Accumulate 150 minutes of exercise weekly',
    target_value: 150,
    unit: 'minutes',
    icon: 'clock',
    color: 'purple',
  },
  {
    type: 'streak_days' as GoalType,
    title: 'Build a 30-day streak',
    description: 'Workout consistently for 30 days',
    target_value: 30,
    unit: 'days',
    icon: 'flame',
    color: 'orange',
  },
  {
    type: 'calories_burned' as GoalType,
    title: 'Burn 2000 calories per week',
    description: 'Burn 2000 calories through workouts',
    target_value: 2000,
    unit: 'calories',
    icon: 'activity',
    color: 'green',
  },
];
