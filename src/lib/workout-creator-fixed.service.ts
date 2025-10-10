/**
 * FIXED Workout Creator Service with proper authentication
 * This version ensures Supabase session is included for RLS to work
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './supabase';
import {
  CustomWorkout,
  WorkoutFormData,
  WorkoutDetails,
  WorkoutSession,
  WorkoutExerciseResult,
  WorkoutSearchFilters,
  WorkoutExerciseDetails,
} from '../types/workout-creator.types';

export class WorkoutCreatorService {
  /**
   * Create a new custom workout with proper authentication
   */
  static async createWorkout(
    workoutData: WorkoutFormData,
    userId?: string
  ): Promise<CustomWorkout | null> {
    console.log('🔄 WorkoutCreatorService.createWorkout called');
    console.log('🔄 Provided userId:', userId);
    console.log('📋 Workout data:', workoutData);

    try {
      // CRITICAL: Create client with session persistence for RLS
      const supabaseWithSession = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'fitprove-auth-token',
          flowType: 'pkce',
        },
      });

      // Verify session exists (required for RLS)
      const { data: { session }, error: sessionError } = await supabaseWithSession.auth.getSession();

      if (sessionError || !session?.user) {
        console.error('❌ No valid session in service:', sessionError);
        throw new Error('Authentication required. Please sign in to save workouts.');
      }

      const authenticatedUserId = session.user.id;
      console.log('✅ Service session verified:', session.user.email, 'ID:', authenticatedUserId);

      // Security: always use session user ID
      if (userId && userId !== authenticatedUserId) {
        console.warn('⚠️ Using session user ID for security:', authenticatedUserId);
      }

      // Create workout with authenticated session
      console.log('📤 Creating workout with authenticated session...');
      const workoutInsert = {
        user_id: authenticatedUserId,
        name: workoutData.name,
        description: workoutData.description || '',
        is_public: workoutData.is_public || false,
      };

      console.log('📤 Workout insert data:', workoutInsert);

      const { data: workout, error: workoutError } = await supabaseWithSession
        .from('custom_workouts')
        .insert([workoutInsert])
        .select()
        .single();

      if (workoutError) {
        console.error('❌ Error creating workout:', workoutError);
        throw new Error(`Failed to create workout: ${workoutError.message}`);
      }

      console.log('✅ Workout created successfully:', workout);

      // Create exercises if provided
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        console.log('📤 Creating workout exercises...');
        const exerciseInserts = workoutData.exercises.map((exercise, index) => ({
          custom_workout_id: workout.id,
          exercise_id: exercise.exercise_id,
          order_index: index,
          sets: exercise.sets || 3,
          reps: exercise.reps || '8-12',
          weight_suggestion: exercise.weight_suggestion || null,
          rest_seconds: exercise.rest_seconds || 60,
          notes: exercise.notes || '',
          is_warmup: exercise.is_warmup || false,
          is_cooldown: exercise.is_cooldown || false,
          superset_group: exercise.superset_group || null,
        }));

        const { error: exerciseError } = await supabaseWithSession
          .from('custom_workout_exercises')
          .insert(exerciseInserts);

        if (exerciseError) {
          console.error('❌ Error creating exercises:', exerciseError);
          console.warn('⚠️ Workout created but exercises failed');
        } else {
          console.log('✅ Workout exercises created successfully');
        }
      }

      return workout;
    } catch (error) {
      console.error('❌ WorkoutCreatorService.createWorkout error:', error);
      throw error;
    }
  }

  // Placeholder methods - keeping it simple for now
  static async getWorkouts(): Promise<CustomWorkout[]> {
    return [];
  }

  static async getWorkoutById(_id: string): Promise<CustomWorkout | null> {
    return null;
  }

  static async deleteWorkout(_id: string): Promise<boolean> {
    return false;
  }

  static async updateWorkout(_id: string, _workoutData: Partial<WorkoutFormData>): Promise<CustomWorkout | null> {
    return null;
  }

  static async searchWorkouts(_filters: WorkoutSearchFilters): Promise<CustomWorkout[]> {
    return [];
  }

  static async createSession(_workoutId: string): Promise<WorkoutSession | null> {
    return null;
  }

  static async saveExerciseResult(_sessionId: string, _result: WorkoutExerciseResult): Promise<boolean> {
    return false;
  }

  static async getSessionById(_id: string): Promise<WorkoutSession | null> {
    return null;
  }

  static async completeSession(_sessionId: string): Promise<boolean> {
    return false;
  }

  static async getWorkoutDetails(_id: string): Promise<WorkoutDetails | null> {
    return null;
  }

  static async getWorkoutExercises(_workoutId: string): Promise<WorkoutExerciseDetails[]> {
    return [];
  }
}
