/**
 * Workout Programs Service
 * Manages workout programs and scheduling
 */

import { supabase } from './supabase';
import {
  WorkoutProgram,
  ProgramWorkout,
  ProgramWorkoutWithDetails,
  WorkoutProgramWithWorkouts,
  CreateProgramData,
  AddWorkoutToProgramData,
} from '../types/workout-programs.types';

export class WorkoutProgramsService {
  /**
   * Get all programs for a user
   */
  static async getUserPrograms(userId: string): Promise<WorkoutProgram[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('workout_programs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user programs:', error);
      return [];
    }
  }

  /**
   * Get a single program with its workouts
   */
  static async getProgramWithWorkouts(programId: string): Promise<WorkoutProgramWithWorkouts | null> {
    try {
      const { data: program, error: programError } = await (supabase as any)
        .from('workout_programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (programError) throw programError;

      const { data: workouts, error: workoutsError } = await (supabase as any)
        .from('program_workouts_details')
        .select('*')
        .eq('program_id', programId)
        .order('week_number', { ascending: true })
        .order('day_of_week', { ascending: true })
        .order('order_index', { ascending: true });

      if (workoutsError) throw workoutsError;

      return {
        ...program,
        workouts: workouts || [],
        total_workouts: workouts?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching program with workouts:', error);
      return null;
    }
  }

  /**
   * Create a new program
   */
  static async createProgram(programData: CreateProgramData, userId: string): Promise<WorkoutProgram | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('workout_programs')
        .insert({
          user_id: userId,
          name: programData.name,
          description: programData.description || '',
          duration_weeks: programData.duration_weeks,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating program:', error);
      return null;
    }
  }

  /**
   * Update a program
   */
  static async updateProgram(
    programId: string,
    updates: Partial<CreateProgramData>
  ): Promise<WorkoutProgram | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('workout_programs')
        .update(updates)
        .eq('id', programId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating program:', error);
      return null;
    }
  }

  /**
   * Delete a program
   */
  static async deleteProgram(programId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('workout_programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting program:', error);
      return false;
    }
  }

  /**
   * Add a workout to a program
   */
  static async addWorkoutToProgram(data: AddWorkoutToProgramData): Promise<ProgramWorkout | null> {
    try {
      const { data: result, error } = await (supabase as any)
        .from('program_workouts')
        .insert({
          program_id: data.program_id,
          workout_id: data.workout_id,
          day_of_week: data.day_of_week,
          week_number: data.week_number,
          order_index: data.order_index || 0,
          notes: data.notes || '',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error adding workout to program:', error);
      return null;
    }
  }

  /**
   * Remove a workout from a program
   */
  static async removeWorkoutFromProgram(programWorkoutId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('program_workouts')
        .delete()
        .eq('id', programWorkoutId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing workout from program:', error);
      return false;
    }
  }

  /**
   * Schedule a single workout to planner
   */
  static async scheduleWorkout(
    workoutId: string,
    date: string,
    time?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get workout details
      const { data: workout, error: workoutError } = await (supabase as any)
        .from('custom_workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (workoutError) throw workoutError;

      // Create planner event
      const { error } = await (supabase as any)
        .from('planner_events')
        .insert({
          user_id: user.id,
          date: date,
          type: 'workout',
          title: workout.name,
          workout_id: workoutId,
          duration_min: workout.estimated_duration,
          time: time || null,
          notes: notes || workout.description || '',
          completed: false,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error scheduling workout:', error);
      return false;
    }
  }

  /**
   * Schedule entire program to planner
   */
  static async scheduleProgram(
    programId: string,
    startDate: string
  ): Promise<{ success: boolean; scheduled: number }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get program with workouts
      const program = await this.getProgramWithWorkouts(programId);
      if (!program || !program.workouts.length) {
        throw new Error('Program not found or has no workouts');
      }

      const start = new Date(startDate);
      const events = [];

      // Generate events for each workout in the program
      for (const programWorkout of program.workouts) {
        // Calculate the date for this workout
        const weeksOffset = programWorkout.week_number - 1;
        const daysOffset = weeksOffset * 7 + programWorkout.day_of_week;

        const workoutDate = new Date(start);
        workoutDate.setDate(start.getDate() + daysOffset);

        events.push({
          user_id: user.id,
          date: workoutDate.toISOString().split('T')[0],
          type: 'workout',
          title: programWorkout.workout_name,
          workout_id: programWorkout.workout_id,
          duration_min: programWorkout.estimated_duration,
          notes: programWorkout.notes || programWorkout.workout_description || '',
          completed: false,
          meta: {
            program_id: programId,
            program_name: program.name,
            week: programWorkout.week_number,
          },
        });
      }

      // Insert all events
      const { error } = await (supabase as any)
        .from('planner_events')
        .insert(events);

      if (error) throw error;

      return { success: true, scheduled: events.length };
    } catch (error) {
      console.error('Error scheduling program:', error);
      return { success: false, scheduled: 0 };
    }
  }

  /**
   * Get workouts scheduled for a specific date
   */
  static async getScheduledWorkouts(date: string, userId: string) {
    try {
      const { data, error } = await (supabase as any)
        .from('planner_events')
        .select(`
          *,
          custom_workouts (
            id,
            name,
            description,
            difficulty,
            estimated_duration,
            estimated_calories,
            total_exercises,
            hero_image_url
          )
        `)
        .eq('user_id', userId)
        .eq('date', date)
        .eq('type', 'workout')
        .not('workout_id', 'is', null);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching scheduled workouts:', error);
      return [];
    }
  }
}