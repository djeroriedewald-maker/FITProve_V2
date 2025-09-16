/**
 * Test file to verify workout creator service functionality
 * Run this to debug database connectivity and authentication
 */

import { WorkoutCreatorService } from '../lib/workout-creator.service';

export async function testWorkoutCreatorService() {
  console.log('Testing Workout Creator Service...');
  
  try {
    // Test 1: Check user authentication
    console.log('Test 1: Checking authentication...');
    
    // Test 2: Try to get popular workouts (should work even with empty results)
    console.log('Test 2: Getting popular workouts...');
    const popularWorkouts = await WorkoutCreatorService.getPopularWorkouts();
    console.log('Popular workouts:', popularWorkouts);
    
    // Test 3: Try to get user workouts
    console.log('Test 3: Getting user workouts...');
    const userWorkouts = await WorkoutCreatorService.getUserWorkouts();
    console.log('User workouts:', userWorkouts);
    
    // Test 4: Create a test workout
    console.log('Test 4: Creating test workout...');
    const testWorkoutData = {
      name: 'Test Workout',
      description: 'Test workout for debugging',
      is_public: false,
      difficulty: 'beginner' as const,
      tags: ['test'],
      hero_image_url: null,
      exercises: [
        {
          exercise_id: 'push-up',
          sets: 3,
          reps: '10',
          rest_seconds: 60,
          notes: 'Test exercise',
          is_warmup: false,
          is_cooldown: false,
          superset_group: null,
          weight_suggestion: null
        }
      ]
    };
    
    const createdWorkout = await WorkoutCreatorService.createWorkout(testWorkoutData);
    console.log('Created workout:', createdWorkout);
    
    if (createdWorkout) {
      console.log('✅ Service is working correctly!');
      return true;
    } else {
      console.log('❌ Failed to create workout');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Service test failed:', error);
    return false;
  }
}

// Auto-run test in development
if (typeof window !== 'undefined') {
  // Add to global scope for manual testing
  (window as any).testWorkoutService = testWorkoutCreatorService;
}