export interface WorkoutStats {
  trainingMinutes: number;
  weeklyChange: number;
  weeklyProgress: number;
}

export interface HeartRateZones {
  low: { minutes: number; percentage: number };
  medium: { minutes: number; percentage: number };
  high: { minutes: number; percentage: number };
}

export interface DailySteps {
  current: number;
  goal: number;
  progress: number;
}

export interface CaloriesBurned {
  today: number;
  weeklyData: number[];
}