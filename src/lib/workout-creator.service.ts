import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './supabase';
import { supabase } from './supabase'; // Import the shared supabase client
import {
  CustomWorkout,
  WorkoutFormData,
  WorkoutDetails,
  WorkoutSession,
  WorkoutExerciseResult,
  WorkoutSearchFilters,
  WorkoutExerciseDetails,
} from '../types/workout-creator.types';

// Create an untyped client for new tables
const supabaseUntyped = createClient(supabaseUrl, supabaseKey);

/**
 * Service class for workout creation and management
 * Handles database operations for custom workouts, exercises, and sessions
 * 
 * Key features:
 * - Create and save custom workouts
 * - Manage workout exercises and metadata
 * - Track workout sessions and progress
 * - Integrate with user authentication for personalized workouts
 * 
 * Uses Supabase for backend database operations with Row Level Security (RLS)
 * Requires authenticated users for all write operations
 * Integrates with Supabase database for workout creation, management, and execution
 * Note: Uses untyped supabase client calls until database types are regenerated
 */
export class WorkoutCreatorService {
  /**
   * Delete a workout by id
   */
  static async deleteWorkout(workoutId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
      if (error) {
        console.error('Error deleting workout:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exception deleting workout:', err);
      return false;
    }
  }
  /**
   * Create a new custom workout
   */
  static async createWorkout(workoutData: WorkoutFormData, userId?: string): Promise<CustomWorkout | null> {
    console.log('🔄 WorkoutCreatorService.createWorkout called');
    console.log('🔄 Provided userId:', userId);
    console.log('📋 Workout data:', workoutData);

    try {
      // IMPORTANT: Use fresh client with session to ensure RLS works
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseWithSession = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'fitprove-auth-token',
          flowType: 'pkce'
        }
      });

      // Get current session to ensure authenticated user
      const { data: { session }, error: sessionError } = await supabaseWithSession.auth.getSession();

      if (sessionError || !session?.user) {
        console.error('❌ Session error or no user:', sessionError);
        throw new Error('User must be authenticated to create workout');
      }

      console.log('✅ Session found for user:', session.user.id);
      const finalUserId = userId || session.user.id;

      console.log('🎯 Creating workout for user:', finalUserId);

      // Insert workout with authenticated session using the correct workouts table
      const { data: workout, error: workoutError } = await supabaseWithSession
        .from('workouts')
        .insert({
          title: workoutData.name,
          level: workoutData.difficulty || 'beginner',
          goal: workoutData.description || 'general fitness',
          duration_min: 30, // Default duration since it's not in WorkoutFormData
          tags: workoutData.tags || [],
          signature: `user-${finalUserId}-${Date.now()}`,
          hero_image_url: workoutData.hero_image_url || null,
        })
        .select()
        .single();

      if (workoutError) {
        console.error('❌ Error creating workout:', workoutError);
        throw workoutError;
      }

      console.log('✅ Workout created successfully:', workout);

      // TODO: Add exercises functionality later - for now just save the basic workout
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        console.log('⚠️ Exercise functionality temporarily disabled');
        console.log('📝 Would add', workoutData.exercises.length, 'exercises');
      }

      // Return the created workout (simplified for now)
      return workout as any;

      console.log('🎉 Workout creation completed successfully!');
      return workout;
    } catch (error) {
      console.error('❌ WorkoutCreatorService.createWorkout failed:', error);
      throw error;
    }
  }

  /**
   * Get all workouts for a specific user
   */
  static async getUserWorkouts(): Promise<CustomWorkout[]> {
    try {
      // Use the shared supabase client from auth context
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return [];
      }

      console.log('👤 Getting workouts for user:', user.id);

      // Query the workouts table (not custom_workouts)
      // For now, get all workouts since we don't have user tracking yet
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting workouts:', error);
        return [];
      }

      console.log('✅ Found workouts:', data?.length || 0);
      
      // Convert to CustomWorkout format for compatibility
      return (data || []).map(workout => ({
        ...workout,
        name: workout.title, // Map title back to name for UI compatibility
        difficulty_level: workout.level, // Map level back to difficulty_level
        difficulty: workout.level, // Also map to difficulty for WorkoutCard
        description: workout.goal, // Map goal to description
        hero_image_url: workout.hero_image_url || null, // Gebruik image uit database
        total_exercises: 0, // TODO: Count from exercises when implemented
        estimated_duration: workout.duration_min, // Map duration
        primary_muscle_groups: [], // TODO: Derive from exercises
        is_public: false, // Default for now
        like_count: 0,
        use_count: 0,
        share_count: 0,
        user_id: 'temp', // Temporary value
        equipment_needed: [],
        is_featured: false,
        updated_at: workout.created_at
      })) as any;
      
    } catch (error) {
      console.error('Error in getUserWorkouts:', error);
      return [];
    }
  }

  /**
   * Get a specific workout by ID with exercises
   */
  static async getWorkoutById(workoutId: string): Promise<WorkoutDetails | null> {
    try {
      // Get the workout
      const { data: workout, error: workoutError } = await supabaseUntyped
        .from('custom_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError || !workout) {
        console.error('Error getting workout:', workoutError);
        return null;
      }

      // Get the exercises for this workout
      const { data: exercises, error: exercisesError } = await supabaseUntyped
        .from('custom_workout_exercises')
        .select(`
          *,
          exercises:exercise_id (
            id,
            name,
            description,
            muscle_groups,
            equipment,
            instructions,
            category,
            difficulty_level
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (exercisesError) {
        console.error('Error getting workout exercises:', exercisesError);
        return {
          ...workout,
          exercises: [],
        };
      }

      return {
        ...workout,
        exercises: exercises || [],
      };
    } catch (error) {
      console.error('Error in getWorkoutById:', error);
      return null;
    }
  }

  /**
   * Search for public workouts
   */
  static async searchWorkouts(
    filters: WorkoutSearchFilters = {}
  ): Promise<CustomWorkout[]> {
    try {
      let query = supabaseUntyped
        .from('custom_workouts')
        .select('*')
        .eq('is_public', true);

      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }

      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }

      if (filters.target_muscle_groups && filters.target_muscle_groups.length > 0) {
        query = query.overlaps('target_muscle_groups', filters.target_muscle_groups);
      }

      if (filters.equipment_needed && filters.equipment_needed.length > 0) {
        query = query.overlaps('equipment_needed', filters.equipment_needed);
      }

      if (filters.max_duration) {
        query = query.lte('estimated_duration', filters.max_duration);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error searching workouts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchWorkouts:', error);
      return [];
    }
  }

  /**
   * Start a workout session
   */
  static async startWorkoutSession(
    workoutId: string,
    userId?: string
  ): Promise<WorkoutSession | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabaseUntyped.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return null;
      }

      const finalUserId = userId || user.id;

      const { data: session, error } = await supabaseUntyped
        .from('workout_sessions')
        .insert({
          workout_id: workoutId,
          user_id: finalUserId,
          started_at: new Date().toISOString(),
          status: 'in_progress',
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting workout session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error in startWorkoutSession:', error);
      return null;
    }
  }

  /**
   * Complete a workout session
   */
  static async completeWorkoutSession(
    sessionId: string,
    exerciseResults: WorkoutExerciseResult[] = []
  ): Promise<WorkoutSession | null> {
    try {
      // Update the session
      const { data: session, error: sessionError } = await supabaseUntyped
        .from('workout_sessions')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (sessionError) {
        console.error('Error completing workout session:', sessionError);
        return null;
      }

      // Save exercise results if provided
      if (exerciseResults.length > 0) {
        const { error: resultsError } = await supabaseUntyped
          .from('workout_exercise_results')
          .insert(
            exerciseResults.map((result) => ({
              ...result,
              session_id: sessionId,
            }))
          );

        if (resultsError) {
          console.error('Error saving exercise results:', resultsError);
          // Don't fail the whole operation for this
        }
      }

      return session;
    } catch (error) {
      console.error('Error in completeWorkoutSession:', error);
      return null;
    }
  }

  /**
   * Get workout sessions for a user
   */
  static async getUserWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error getting user workout sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserWorkoutSessions:', error);
      return [];
    }
  }
}