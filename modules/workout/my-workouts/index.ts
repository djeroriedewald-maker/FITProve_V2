// Remove a workout by id and source
export function deleteWorkoutById(id: string, source: SavedWorkoutSource) {
  const workouts = getSavedWorkouts().filter(w => !(w.id === id && w.source === source));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}
// This module separates workouts by source: 'generator' or 'creator'

export type SavedWorkoutSource = 'generator' | 'creator';

export interface SavedWorkout {
  id: string;
  name: string;
  source: SavedWorkoutSource;
  created_at: string;
  exercises: any[]; // Array of Exercise (or WorkoutExercise) objects
  user_id?: string; // Only set for user-bounded workouts (generator)
  meta?: Record<string, any>; // Additional info (goal, level, etc)
}

// For now, use localStorage for persistence (can be replaced with DB/API)
const STORAGE_KEY = 'my_workouts_v2';

export function getSavedWorkouts(): SavedWorkout[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWorkout(workout: SavedWorkout) {
  const workouts = getSavedWorkouts();
  workouts.push(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
}

// Optionally filter by user_id for generator workouts
export function getWorkoutsBySource(source: SavedWorkoutSource, user_id?: string): SavedWorkout[] {
  return getSavedWorkouts().filter(w => {
    if (w.source !== source) return false;
    if (source === 'generator' && user_id) return w.user_id === user_id;
    return true;
  });
}

export function clearAllWorkouts() {
  localStorage.removeItem(STORAGE_KEY);
}

// This file only exports functions and types. If you see this code in your UI, check for accidental direct import or bundler config issues. Do not import this file directly in a page or component; only import its functions/types where needed.
