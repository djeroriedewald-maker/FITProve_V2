/**
 * Service functions for managing custom workouts
 * Handles CRUD operations for workout creation, execution, and social features
 */

import { supabase } from './supabase';
import { 
  CustomWorkout, 
  WorkoutFormData, 
  WorkoutDetails, 
  WorkoutSession, 
  WorkoutExerciseResult, 
  WorkoutSearchFilters,
  CustomWorkoutExercise,
  WorkoutExerciseDetails,
  SetResult
} from '../types/workout-creator.types';

// Type assertion to bypass missing table types until migration is applied
const db = supabase as any;

/**
 * Custom Workout Management
 */
export class WorkoutCreatorService {
  
  /**
   * Create a new custom workout
   */
  static async createWorkout(workoutData: WorkoutFormData): Promise<CustomWorkout | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create the workout
      const { data: workout, error: workoutError } = await supabase
        .from('custom_workouts')
        .insert({
          user_id: user.id,
          name: workoutData.name,
          description: workoutData.description,
          difficulty: workoutData.difficulty,
          tags: workoutData.tags,
          is_public: workoutData.is_public,
          // Calculate estimated values
          estimated_duration: this.calculateEstimatedDuration(workoutData.exercises),
          estimated_calories: this.calculateEstimatedCalories(workoutData.exercises),
          primary_muscle_groups: this.extractMuscleGroups(workoutData.exercises),
          equipment_needed: this.extractEquipment(workoutData.exercises)
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises to the workout
      if (workoutData.exercises.length > 0) {
        const exerciseInserts = workoutData.exercises.map((exercise, index) => ({
          custom_workout_id: workout.id,
          exercise_id: exercise.exercise_id,
          order_index: index,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_suggestion: exercise.weight_suggestion,
          rest_seconds: exercise.rest_seconds,
          notes: exercise.notes,
          is_warmup: exercise.is_warmup,
          is_cooldown: exercise.is_cooldown,
          superset_group: exercise.superset_group
        }));

        const { error: exerciseError } = await supabase
          .from('custom_workout_exercises')
          .insert(exerciseInserts);

        if (exerciseError) throw exerciseError;
      }

      return workout;
    } catch (error) {
      console.error('Error creating workout:', error);
      return null;
    }
  }

  /**
   * Get user's custom workouts
   */
  static async getUserWorkouts(userId?: string): Promise<WorkoutDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return [];

      const { data: workouts, error } = await supabase
        .from('workout_details')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      return workouts || [];
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      return [];
    }
  }

  /**
   * Get public workouts with search and filtering
   */
  static async searchWorkouts(filters: WorkoutSearchFilters = {}): Promise<WorkoutDetails[]> {
    try {
      let query = supabase
        .from('workout_details')
        .select('*');

      // Apply filters
      if (filters.is_public !== false) {
        query = query.eq('is_public', true);
      }

      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty);
      }

      if (filters.duration_min) {
        query = query.gte('estimated_duration', filters.duration_min);
      }

      if (filters.duration_max) {
        query = query.lte('estimated_duration', filters.duration_max);
      }

      if (filters.muscle_groups && filters.muscle_groups.length > 0) {
        query = query.overlaps('primary_muscle_groups', filters.muscle_groups);
      }

      if (filters.equipment && filters.equipment.length > 0) {
        query = query.overlaps('equipment_needed', filters.equipment);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      const sortBy = filters.sort_by || 'created_at';
      const sortOrder = filters.sort_order || 'desc';
      
      if (sortBy === 'popularity') {
        query = query.order('like_count', { ascending: sortOrder === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      const { data: workouts, error } = await query;

      if (error) throw error;
      return workouts || [];
    } catch (error) {
      console.error('Error searching workouts:', error);
      return [];
    }
  }

  /**
   * Get workout by ID with full details
   */
  static async getWorkoutById(workoutId: string): Promise<WorkoutDetails | null> {
    try {
      const { data: workout, error } = await supabase
        .from('workout_details')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (error) throw error;

      // Get exercises for this workout
      const exercises = await this.getWorkoutExercises(workoutId);
      
      return {
        ...workout,
        exercises
      };
    } catch (error) {
      console.error('Error fetching workout:', error);
      return null;
    }
  }

  /**
   * Get exercises for a specific workout
   */
  static async getWorkoutExercises(workoutId: string): Promise<WorkoutExerciseDetails[]> {
    try {
      const { data: exercises, error } = await supabase
        .from('custom_workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('custom_workout_id', workoutId)
        .order('order_index');

      if (error) throw error;
      return exercises || [];
    } catch (error) {
      console.error('Error fetching workout exercises:', error);
      return [];
    }
  }

  /**
   * Update existing workout
   */
  static async updateWorkout(workoutId: string, updates: Partial<WorkoutFormData>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update workout metadata
      const { error: workoutError } = await supabase
        .from('custom_workouts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (workoutError) throw workoutError;

      // Update exercises if provided
      if (updates.exercises) {
        // Delete existing exercises
        await supabase
          .from('custom_workout_exercises')
          .delete()
          .eq('custom_workout_id', workoutId);

        // Insert updated exercises
        const exerciseInserts = updates.exercises.map((exercise, index) => ({
          custom_workout_id: workoutId,
          exercise_id: exercise.exercise_id,
          order_index: index,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_suggestion: exercise.weight_suggestion,
          rest_seconds: exercise.rest_seconds,
          notes: exercise.notes,
          is_warmup: exercise.is_warmup,
          is_cooldown: exercise.is_cooldown,
          superset_group: exercise.superset_group
        }));

        const { error: exerciseError } = await supabase
          .from('custom_workout_exercises')
          .insert(exerciseInserts);

        if (exerciseError) throw exerciseError;
      }

      return true;
    } catch (error) {
      console.error('Error updating workout:', error);
      return false;
    }
  }

  /**
   * Delete workout
   */
  static async deleteWorkout(workoutId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('custom_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  }

  /**
   * Duplicate workout (copy to user's library)
   */
  static async duplicateWorkout(workoutId: string, newName?: string): Promise<CustomWorkout | null> {
    try {
      const workout = await this.getWorkoutById(workoutId);
      if (!workout) return null;

      const workoutData: WorkoutFormData = {
        name: newName || `${workout.name} (Copy)`,
        description: workout.description,
        difficulty: workout.difficulty,
        tags: workout.tags,
        is_public: false, // Copies are private by default
        exercises: workout.exercises?.map(ex => ({
          exercise_id: ex.exercise_id,
          sets: ex.sets,
          reps: ex.reps,
          weight_suggestion: ex.weight_suggestion,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          is_warmup: ex.is_warmup,
          is_cooldown: ex.is_cooldown,
          superset_group: ex.superset_group
        })) || []
      };

      return await this.createWorkout(workoutData);
    } catch (error) {
      console.error('Error duplicating workout:', error);
      return null;
    }
  }

  /**
   * Workout Session Management
   */

  /**
   * Start a new workout session
   */
  static async startWorkoutSession(workoutId: string): Promise<WorkoutSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const workout = await this.getWorkoutById(workoutId);
      if (!workout) throw new Error('Workout not found');

      const { data: session, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          custom_workout_id: workoutId,
          workout_name: workout.name,
          workout_type: 'custom',
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error starting workout session:', error);
      return null;
    }
  }

  /**
   * Update workout session
   */
  static async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating workout session:', error);
      return false;
    }
  }

  /**
   * Complete workout session
   */
  static async completeWorkoutSession(sessionId: string, sessionData: {
    total_duration: number;
    calories_burned?: number;
    difficulty_rating?: number;
    energy_level?: number;
    fatigue_level?: number;
    notes?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          ...sessionData,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing workout session:', error);
      return false;
    }
  }

  /**
   * Save exercise results for a session
   */
  static async saveExerciseResults(sessionId: string, exerciseResults: Omit<WorkoutExerciseResult, 'id'>[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workout_exercise_results')
        .insert(exerciseResults.map(result => ({
          ...result,
          workout_session_id: sessionId
        })));

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving exercise results:', error);
      return false;
    }
  }

  /**
   * Social Features
   */

  /**
   * Like/unlike a workout
   */
  static async toggleWorkoutLike(workoutId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('workout_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('custom_workout_id', workoutId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('workout_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('custom_workout_id', workoutId);
        
        if (error) throw error;
        return false; // unliked
      } else {
        // Like
        const { error } = await supabase
          .from('workout_likes')
          .insert({
            user_id: user.id,
            custom_workout_id: workoutId
          });
        
        if (error) throw error;
        return true; // liked
      }
    } catch (error) {
      console.error('Error toggling workout like:', error);
      return false;
    }
  }

  /**
   * Get user's workout sessions history
   */
  static async getWorkoutHistory(userId?: string, limit: number = 20): Promise<WorkoutSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return [];

      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return sessions || [];
    } catch (error) {
      console.error('Error fetching workout history:', error);
      return [];
    }
  }

  /**
   * Helper functions
   */

  private static calculateEstimatedDuration(exercises: any[]): number {
    // Basic calculation: (sets * reps * 3 seconds) + rest time per exercise
    return exercises.reduce((total, ex) => {
      const workTime = ex.sets * 45; // ~45 seconds per set on average
      const restTime = ex.sets * ex.rest_seconds;
      return total + (workTime + restTime) / 60; // convert to minutes
    }, 0);
  }

  private static calculateEstimatedCalories(exercises: any[]): number {
    // Basic calculation: ~5 calories per minute of exercise
    const duration = this.calculateEstimatedDuration(exercises);
    return Math.round(duration * 5);
  }

  private static extractMuscleGroups(exercises: any[]): string[] {
    // This would need to query the exercise database to get muscle groups
    // For now, return empty array - will be populated by database triggers
    return [];
  }

  private static extractEquipment(exercises: any[]): string[] {
    // This would need to query the exercise database to get equipment
    // For now, return empty array - will be populated by database triggers
    return [];
  }
}