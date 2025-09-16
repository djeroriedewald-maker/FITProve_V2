/**
 * Mock service for workout creator functionality
 * Used for testing UI components before database migration is applied
 */

import { 
  CustomWorkout, 
  WorkoutFormData, 
  WorkoutDetails, 
  WorkoutSession, 
  WorkoutExerciseResult, 
  WorkoutSearchFilters,
  WorkoutExerciseDetails
} from '../types/workout-creator.types';

export class WorkoutCreatorService {
  /**
   * Create a new custom workout
   */
  static async createWorkout(workoutData: WorkoutFormData): Promise<CustomWorkout | null> {
    console.log('Mock: Creating workout', workoutData);
    
    // Return mock workout data
    const mockWorkout: CustomWorkout = {
      id: 'mock-workout-' + Date.now(),
      user_id: 'mock-user-id',
      name: workoutData.name,
      description: workoutData.description || '',
      is_public: workoutData.is_public,
      difficulty: 'intermediate',
      total_exercises: workoutData.exercises.length,
      estimated_duration: workoutData.exercises.length * 3,
      primary_muscle_groups: [],
      equipment_needed: [],
      tags: [],
      is_featured: false,
      like_count: 0,
      use_count: 0,
      share_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return mockWorkout;
  }

  /**
   * Get workouts for the home feed
   */
  static async getPopularWorkouts(filters?: WorkoutSearchFilters): Promise<WorkoutDetails[]> {
    console.log('Mock: Getting popular workouts', filters);
    return [];
  }

  /**
   * Search workouts
   */
  static async searchWorkouts(query: string, filters?: WorkoutSearchFilters): Promise<WorkoutDetails[]> {
    console.log('Mock: Searching workouts', query, filters);
    return [];
  }

  /**
   * Get a specific workout with exercises
   */
  static async getWorkoutDetails(workoutId: string): Promise<WorkoutDetails | null> {
    console.log('Mock: Getting workout details', workoutId);
    return null;
  }

  /**
   * Get exercises for a workout
   */
  static async getWorkoutExercises(workoutId: string): Promise<WorkoutExerciseDetails[]> {
    console.log('Mock: Getting workout exercises', workoutId);
    return [];
  }

  /**
   * Update an existing workout
   */
  static async updateWorkout(workoutId: string, updates: Partial<WorkoutFormData>): Promise<boolean> {
    console.log('Mock: Updating workout', workoutId, updates);
    return true;
  }

  /**
   * Delete a workout
   */
  static async deleteWorkout(workoutId: string): Promise<boolean> {
    console.log('Mock: Deleting workout', workoutId);
    return true;
  }

  /**
   * Duplicate a workout
   */
  static async duplicateWorkout(workoutId: string, newName: string): Promise<CustomWorkout | null> {
    console.log('Mock: Duplicating workout', workoutId, newName);
    
    const mockWorkout: CustomWorkout = {
      id: 'mock-duplicate-' + Date.now(),
      user_id: 'mock-user-id',
      name: newName,
      description: 'Copy of workout',
      is_public: false,
      difficulty: 'intermediate',
      total_exercises: 3,
      estimated_duration: 30,
      primary_muscle_groups: [],
      equipment_needed: [],
      tags: [],
      is_featured: false,
      like_count: 0,
      use_count: 0,
      share_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return mockWorkout;
  }

  /**
   * Start a workout session
   */
  static async startWorkoutSession(workoutId: string): Promise<WorkoutSession | null> {
    console.log('Mock: Starting workout session', workoutId);
    
    const mockSession: WorkoutSession = {
      id: 'mock-session-' + Date.now(),
      user_id: 'mock-user-id',
      custom_workout_id: workoutId,
      workout_name: 'Mock Workout',
      workout_type: 'custom',
      started_at: new Date().toISOString(),
      completed_at: undefined,
      paused_duration: 0,
      status: 'in_progress',
      exercises_completed: 0,
      total_sets: 0,
      total_reps: 0,
      total_weight_lifted: 0,
      notes: '',
      created_at: new Date().toISOString()
    };

    return mockSession;
  }

  /**
   * Update workout session
   */
  static async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<boolean> {
    console.log('Mock: Updating workout session', sessionId, updates);
    return true;
  }

  /**
   * Complete a workout session
   */
  static async completeWorkoutSession(
    sessionId: string, 
    exerciseResults: WorkoutExerciseResult[]
  ): Promise<boolean> {
    console.log('Mock: Completing workout session', sessionId, exerciseResults);
    return true;
  }

  /**
   * Like/unlike a workout
   */
  static async toggleWorkoutLike(workoutId: string): Promise<boolean> {
    console.log('Mock: Toggling workout like', workoutId);
    return true;
  }

  /**
   * Get user's workout sessions
   */
  static async getUserWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
    console.log('Mock: Getting user workout sessions', userId);
    return [];
  }

  /**
   * Get a specific workout by ID
   */
  static async getWorkoutById(workoutId: string): Promise<WorkoutDetails | null> {
    console.log('Mock: Getting workout by ID', workoutId);
    
    const mockWorkout: WorkoutDetails = {
      id: workoutId,
      user_id: 'mock-user-id',
      name: 'Mock Workout',
      description: 'A test workout',
      difficulty: 'intermediate',
      total_exercises: 3,
      estimated_duration: 30,
      primary_muscle_groups: ['chest', 'shoulders'],
      equipment_needed: ['dumbbells'],
      tags: ['strength'],
      is_public: true,
      is_featured: false,
      like_count: 5,
      use_count: 10,
      share_count: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // WorkoutDetails specific fields
      exercise_count: 3,
      average_difficulty_rating: 3,
      session_count: 10,
      creator_username: 'testuser',
      creator_name: 'Test User'
    };
    
    return mockWorkout;
  }

  /**
   * Get user's workouts
   */
  static async getUserWorkouts(): Promise<WorkoutDetails[]> {
    console.log('Mock: Getting user workouts');
    
    const mockWorkouts: WorkoutDetails[] = [
      {
        id: 'mock-workout-1',
        user_id: 'mock-user-id',
        name: 'Push Day',
        description: 'Upper body push muscles',
        difficulty: 'intermediate',
        total_exercises: 4,
        estimated_duration: 45,
        primary_muscle_groups: ['chest', 'shoulders', 'triceps'],
        equipment_needed: ['dumbbells', 'barbell'],
        tags: ['strength', 'push'],
        is_public: true,
        is_featured: false,
        like_count: 12,
        use_count: 25,
        share_count: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        exercise_count: 4,
        average_difficulty_rating: 3,
        session_count: 25,
        creator_username: 'testuser',
        creator_name: 'Test User'
      }
    ];

    return mockWorkouts;
  }

}