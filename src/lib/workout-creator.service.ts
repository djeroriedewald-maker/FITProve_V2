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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: deletedRows, error } = await (supabase as any)
        .from('custom_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id)
        .select('id');

      if (error) {
        console.error('Error deleting workout:', error);
        return false;
      }

      if (!deletedRows || deletedRows.length === 0) {
        const { error: legacyDeleteError } = await supabase
          .from('workouts')
          .delete()
          .eq('id', workoutId);

        if (legacyDeleteError) {
          console.error('Error deleting legacy workout:', legacyDeleteError);
          return false;
        }
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
    console.log('[createWorkout] called');
    console.log('[createWorkout] Provided userId:', userId);
    console.log('[createWorkout] Workout data:', workoutData);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('[createWorkout] Session error or no user:', userError);
        throw new Error('User must be authenticated to create workout');
      }

      const finalUserId = userId || user.id;
      console.log('[createWorkout] Session found for user:', finalUserId);
      console.log('[createWorkout] Creating workout for user:', finalUserId);

      const normalizedExercises = (workoutData.exercises || []).map((exercise) => ({
        ...exercise,
        sets: Math.max(exercise.sets ?? 0, 1),
        rest_seconds: exercise.rest_seconds ?? 60,
      }));
      const exerciseCount = normalizedExercises.length;
      const totalSets = normalizedExercises.reduce((sum, ex) => sum + ex.sets, 0);
      const estimatedDurationMinutes = Math.max(
        5,
        Math.round(
          normalizedExercises.reduce((total, ex) => {
            const workTime = ex.sets * 45;
            const restTime = ex.sets * ex.rest_seconds;
            return total + workTime + restTime;
          }, 0) / 60
        )
      );

      const uniqueExerciseIds = Array.from(
        new Set(normalizedExercises.map((ex) => ex.exercise_id).filter((id): id is string => Boolean(id)))
      );

      let primaryMuscleGroups: string[] = [];
      let equipmentNeeded: string[] = [];

      if (uniqueExerciseIds.length > 0) {
        const { data: exerciseRows, error: exerciseLookupError } = await (supabase as any)
          .from('exercises')
          .select('id, primary_muscles, secondary_muscles, equipment')
          .in('id', uniqueExerciseIds);

        if (exerciseLookupError) {
          console.error('[createWorkout] Error loading exercise metadata:', exerciseLookupError);
        } else if (exerciseRows) {
          const muscles = new Set<string>();
          const equipment = new Set<string>();
          for (const row of exerciseRows as any[]) {
            (row.primary_muscles || []).forEach((muscle: string) => muscles.add(muscle));
            (row.secondary_muscles || []).forEach((muscle: string) => muscles.add(muscle));
            (row.equipment || []).forEach((item: string) => equipment.add(item));
          }
          primaryMuscleGroups = Array.from(muscles);
          equipmentNeeded = Array.from(equipment);
        }
      }

      const estimatedCalories = Math.max(estimatedDurationMinutes * 5, 20);

      const { data: workout, error: workoutError } = await (supabase as any)
        .from('custom_workouts')
        .insert({
          user_id: finalUserId,
          name: workoutData.name,
          description: workoutData.description || 'general fitness',
          difficulty: workoutData.difficulty || 'beginner',
          estimated_duration: estimatedDurationMinutes,
          estimated_calories: estimatedCalories,
          total_exercises: exerciseCount,
          exercise_count: exerciseCount,
          total_sets: totalSets,
          tags: workoutData.tags || [],
          hero_image_url: workoutData.hero_image_url || null,
          is_public: workoutData.is_public ?? false,
          primary_muscle_groups: primaryMuscleGroups,
          equipment_needed: equipmentNeeded,
        })
        .select('*')
        .single();

      if (workoutError) {
        console.error('[createWorkout] Error creating workout:', workoutError);
        throw workoutError;
      }

      if (normalizedExercises.length > 0 && workout?.id) {
        const exerciseInserts = normalizedExercises.map((exercise, index) => ({
          custom_workout_id: workout.id,
          exercise_id: exercise.exercise_id,
          order_index: index,
          sets: exercise.sets,
          reps: exercise.reps || '8-12',
          weight_suggestion: exercise.weight_suggestion ?? null,
          rest_seconds: exercise.rest_seconds,
          notes: exercise.notes || '',
          is_warmup: exercise.is_warmup || false,
          is_cooldown: exercise.is_cooldown || false,
          superset_group: exercise.superset_group ?? null,
        }));

        const { error: exercisesError } = await (supabase as any)
          .from('custom_workout_exercises')
          .insert(exerciseInserts);

        if (exercisesError) {
          console.error('[createWorkout] Error saving workout exercises:', exercisesError);
        }
      }

      return {
        ...workout,
        exercise_count: exerciseCount,
        total_sets: totalSets,
        primary_muscle_groups: primaryMuscleGroups,
        equipment_needed: workout?.equipment_needed ?? equipmentNeeded,
        estimated_duration: workout?.estimated_duration ?? estimatedDurationMinutes,
        total_exercises: workout?.total_exercises ?? exerciseCount,
      } as any;
    } catch (error) {
      console.error('[createWorkout] Failed:', error);
      throw error;
    }
  }

  /**
   * Get all workouts for a specific user
   */
  static async getUserWorkouts(): Promise<CustomWorkout[]> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user:', userError);
        return [];
      }

      const { data: workouts, error } = await (supabase as any)
        .from('custom_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting workouts:', error);
        return [];
      }

      const workoutList = workouts || [];
      if (workoutList.length === 0) {
        const { data: legacyWorkouts, error: legacyError } = await supabase
          .from('workouts')
          .select('*')
          .order('created_at', { ascending: false });

        if (legacyError) {
          console.error('Error getting legacy workouts:', legacyError);
          return [];
        }

        return (legacyWorkouts || []).map((workout: any) => ({
          ...workout,
          name: workout.title,
          difficulty: workout.level,
          difficulty_level: workout.level,
          description: workout.goal,
          hero_image_url: workout.hero_image_url || null,
          total_exercises: 0,
          exercise_count: 0,
          total_sets: 0,
          estimated_duration: workout.duration_min,
          primary_muscle_groups: [],
          equipment_needed: [],
          is_public: false,
          like_count: 0,
          use_count: 0,
          share_count: 0,
          user_id: user.id,
          updated_at: workout.created_at,
        })) as any;
      }

      const workoutIds = workoutList.map((w: any) => w.id);
      const aggregates: Record<string, { count: number; sets: number; durationSeconds: number }> = {};

      if (workoutIds.length > 0) {
        const { data: exerciseRows, error: exerciseError } = await (supabase as any)
          .from('custom_workout_exercises')
          .select('custom_workout_id, sets, rest_seconds')
          .in('custom_workout_id', workoutIds);

        if (exerciseError) {
          console.error('Error getting workout exercises:', exerciseError);
        } else if (exerciseRows) {
          for (const row of exerciseRows as any[]) {
            const workoutId = row.custom_workout_id;
            if (!aggregates[workoutId]) {
              aggregates[workoutId] = { count: 0, sets: 0, durationSeconds: 0 };
            }
            const sets = row.sets || 0;
            const restSeconds = row.rest_seconds || 0;
            aggregates[workoutId].count += 1;
            aggregates[workoutId].sets += sets;
            aggregates[workoutId].durationSeconds += sets * 45 + sets * restSeconds;
          }
        }
      }

      return workoutList.map((workout: any) => {
        const aggregate = aggregates[workout.id] || { count: 0, sets: 0, durationSeconds: 0 };
        const derivedDuration = aggregate.durationSeconds > 0
          ? Math.max(5, Math.round(aggregate.durationSeconds / 60))
          : 0;
        return {
          ...workout,
          exercise_count: workout.exercise_count ?? aggregate.count,
          total_exercises: workout.total_exercises ?? aggregate.count,
          total_sets: workout.total_sets ?? aggregate.sets,
          primary_muscle_groups: workout.primary_muscle_groups ?? [],
          equipment_needed: workout.equipment_needed ?? [],
          estimated_duration: workout.estimated_duration && workout.estimated_duration > 0
            ? workout.estimated_duration
            : derivedDuration,
        };
      }) as any;
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
      const { data: workout, error: workoutError } = await (supabase as any)
        .from('custom_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError || !workout) {
        console.error('Error getting workout:', workoutError);
        return null;
      }

      // Get the exercises for this workout
      const { data: exercises, error: exercisesError } = await (supabase as any)
        .from('custom_workout_exercises')
        .select(`
          id,
          custom_workout_id,
          exercise_id,
          order_index,
          sets,
          reps,
          weight_suggestion,
          rest_seconds,
          notes,
          is_warmup,
          is_cooldown,
          superset_group,
          exercise:exercise_id (
            id,
            name,
            description,
            image_url,
            youtube_id,
            primary_muscles,
            secondary_muscles,
            equipment,
            instructions,
            category_id,
            difficulty
          )
        `)
        .eq('custom_workout_id', workoutId)
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
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        return null;
      }

      const finalUserId = userId || user.id;

      const { data: workout, error: workoutLookupError } = await (supabase as any)
        .from('custom_workouts')
        .select('name')
        .eq('id', workoutId)
        .single();

      if (workoutLookupError || !workout) {
        console.error('Error loading workout for session:', workoutLookupError);
        return null;
      }

      const startedAt = new Date().toISOString();

      const { data: session, error } = await (supabase as any)
        .from('workout_sessions')
        .insert({
          custom_workout_id: workoutId,
          workout_name: workout.name,
          workout_type: 'custom',
          user_id: finalUserId,
          started_at: startedAt,
          status: 'in_progress',
        })
        .select().single();

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
      const { data: session, error: sessionError } = await (supabase as any)
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
        const { error: resultsError } = await (supabase as any)
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

