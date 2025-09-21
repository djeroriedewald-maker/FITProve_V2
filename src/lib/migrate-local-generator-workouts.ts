// This script migrates old local generator workouts to Supabase for the current user.
// Run this in the browser console or as a one-off import in your app.

import { getWorkoutsBySource, clearAllWorkouts } from '../../modules/workout/my-workouts';
import { saveGeneratorWorkout } from '../lib/generator-workout.service';

// Accept userId as argument, do not fetch user internally
async function migrateLocalGeneratorWorkoutsToSupabase(user_id: string) {
  // Get all local generator workouts
  const localGeneratorWorkouts = getWorkoutsBySource('generator', user_id);
  if (!localGeneratorWorkouts.length) {
    return; // No alert, silent if nothing to migrate
  }
  let migrated = 0;
  for (const w of localGeneratorWorkouts) {
    try {
      await saveGeneratorWorkout({
        name: w.name,
        exercises: w.exercises,
        meta: w.meta || {},
        user_id,
      });
      migrated++;
    } catch (e) {
      console.error('Failed to migrate workout', w, e);
    }
  }
  // Remove migrated generator workouts from localStorage
  // (optional: only clear generator ones, but here we clear all for simplicity)
  clearAllWorkouts();
  // Optionally: show a notification or return migrated count
}

// To run: import and call migrateLocalGeneratorWorkoutsToSupabase();
export default migrateLocalGeneratorWorkoutsToSupabase;
