export interface UserWorkoutHistoryEntry {
  id: string;
  user_id: string;
  exercise_id: string;
  completed_at: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
