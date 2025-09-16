/**/**

 * FIXED Workout Creator Service with proper authentication * FIXED Workout Creator Service with proper authentication

 * This version ensures Supabase session is included for RLS to work * This version ensures Supabase session is included for RLS to work

 */ */



import { createClient } from '@supabase/supabase-js';import { createClient } from '@supabase/supabase-js';

import { supabaseUrl, supabaseKey } from './supabase';import { supabaseUrl, supabaseKey } from './supabase';

import {import {

  CustomWorkout,  CustomWorkout,

  WorkoutFormData,  WorkoutFormData,

  WorkoutDetails,  WorkoutDetails,

  WorkoutSession,  WorkoutSession,

  WorkoutExerciseResult,  WorkoutExerciseResult,

  WorkoutSearchFilters,  WorkoutSearchFilters,

  WorkoutExerciseDetails,  WorkoutExerciseDetails,

} from '../types/workout-creator.types';} from '../types/workout-creator.types';



export class WorkoutCreatorService {export class WorkoutCreatorService {

  /**  /**

   * Create a new custom workout with proper authentication   * Create a new custom workout with proper authentication

   */   */

  static async createWorkout(  static async createWorkout(

    workoutData: WorkoutFormData,    workoutData: WorkoutFormData,

    userId?: string    userId?: string

  ): Promise<CustomWorkout | null> {  ): Promise<CustomWorkout | null> {

    console.log('🔄 WorkoutCreatorService.createWorkout called');    console.log('🔄 WorkoutCreatorService.createWorkout called');

    console.log('🔄 Provided userId:', userId);    console.log('🔄 Provided userId:', userId);

    console.log('📋 Workout data:', workoutData);    console.log('📋 Workout data:', workoutData);



    try {    try {

      // CRITICAL: Create client with session persistence for RLS      // CRITICAL: Create client with session persistence for RLS

      const supabaseWithSession = createClient(supabaseUrl, supabaseKey, {      const supabaseWithSession = createClient(supabaseUrl, supabaseKey, {

        auth: {        auth: {

          persistSession: true,          persistSession: true,

          autoRefreshToken: true,          autoRefreshToken: true,

          detectSessionInUrl: true,          detectSessionInUrl: true,

          storage: typeof window !== 'undefined' ? window.localStorage : undefined,          storage: typeof window !== 'undefined' ? window.localStorage : undefined,

          storageKey: 'fitprove-auth-token',          storageKey: 'fitprove-auth-token',

          flowType: 'pkce',          flowType: 'pkce'

        },        }

      });      });



      // Verify session exists (required for RLS)      // Verify session exists (required for RLS)

      const {      const { data: { session }, error: sessionError } = await supabaseWithSession.auth.getSession();

        data: { session },      

        error: sessionError,      if (sessionError || !session?.user) {

      } = await supabaseWithSession.auth.getSession();        console.error('❌ No valid session in service:', sessionError);

        throw new Error('Authentication required. Please sign in to save workouts.');

      if (sessionError || !session?.user) {      }

        console.error('❌ No valid session in service:', sessionError);

        throw new Error('Authentication required. Please sign in to save workouts.');      const authenticatedUserId = session.user.id;

      }      console.log('✅ Service session verified:', session.user.email, 'ID:', authenticatedUserId);



      const authenticatedUserId = session.user.id;      // Security: always use session user ID

      console.log('✅ Service session verified:', session.user.email, 'ID:', authenticatedUserId);      if (userId && userId !== authenticatedUserId) {

        console.warn('⚠️ Using session user ID for security:', authenticatedUserId);

      // Security: always use session user ID      }

      if (userId && userId !== authenticatedUserId) {

        console.warn('⚠️ Using session user ID for security:', authenticatedUserId);      // Create workout with authenticated session

      }      console.log('📤 Creating workout with authenticated session...');

      const workoutInsert = {

      // Create workout with authenticated session        user_id: authenticatedUserId,

      console.log('📤 Creating workout with authenticated session...');        name: workoutData.name,

      const workoutInsert = {        description: workoutData.description || '',

        user_id: authenticatedUserId,        is_public: workoutData.is_public || false,

        name: workoutData.name,      };

        description: workoutData.description || '',      

        is_public: workoutData.is_public || false,      console.log('📤 Workout insert data:', workoutInsert);

      };      

      const { data: workout, error: workoutError } = await supabaseWithSession

      console.log('📤 Workout insert data:', workoutInsert);        .from('custom_workouts')

        .insert([workoutInsert])

      const { data: workout, error: workoutError } = await supabaseWithSession        .select()

        .from('custom_workouts')        .single();

        .insert([workoutInsert])

        .select()      if (workoutError) {

        .single();        console.error('❌ Error creating workout:', workoutError);

        throw new Error(`Failed to create workout: ${workoutError.message}`);

      if (workoutError) {      }

        console.error('❌ Error creating workout:', workoutError);

        throw new Error(`Failed to create workout: ${workoutError.message}`);      console.log('✅ Workout created successfully:', workout);

      }

      // Create exercises if provided

      console.log('✅ Workout created successfully:', workout);      if (workoutData.exercises && workoutData.exercises.length > 0) {

        console.log('📤 Creating workout exercises...');

      // Create exercises if provided        const exerciseInserts = workoutData.exercises.map((exercise, index) => ({

      if (workoutData.exercises && workoutData.exercises.length > 0) {          custom_workout_id: workout.id,

        console.log('📤 Creating workout exercises...');          exercise_id: exercise.exercise_id,

        const exerciseInserts = workoutData.exercises.map((exercise, index) => ({          order_index: index,

          custom_workout_id: workout.id,          sets: exercise.sets || 3,

          exercise_id: exercise.exercise_id,          reps: exercise.reps || '8-12',

          order_index: index,          weight_suggestion: exercise.weight_suggestion || null,

          sets: exercise.sets || 3,          rest_seconds: exercise.rest_seconds || 60,

          reps: exercise.reps || '8-12',          notes: exercise.notes || '',

          weight_suggestion: exercise.weight_suggestion || null,          is_warmup: exercise.is_warmup || false,

          rest_seconds: exercise.rest_seconds || 60,          is_cooldown: exercise.is_cooldown || false,

          notes: exercise.notes || '',          superset_group: exercise.superset_group || null,

          is_warmup: exercise.is_warmup || false,        }));

          is_cooldown: exercise.is_cooldown || false,

          superset_group: exercise.superset_group || null,        const { error: exerciseError } = await supabaseWithSession

        }));          .from('custom_workout_exercises')

          .insert(exerciseInserts);

        const { error: exerciseError } = await supabaseWithSession

          .from('custom_workout_exercises')        if (exerciseError) {

          .insert(exerciseInserts);          console.error('❌ Error creating exercises:', exerciseError);

          console.warn('⚠️ Workout created but exercises failed');

        if (exerciseError) {        } else {

          console.error('❌ Error creating exercises:', exerciseError);          console.log('✅ Workout exercises created successfully');

          console.warn('⚠️ Workout created but exercises failed');        }

        } else {      }

          console.log('✅ Workout exercises created successfully');

        }      return workout;

      }

    } catch (error) {

      return workout;      console.error('❌ WorkoutCreatorService.createWorkout error:', error);

    } catch (error) {      throw error;

      console.error('❌ WorkoutCreatorService.createWorkout error:', error);    }

      throw error;  }

    }

  }  // Placeholder methods - keeping it simple for now

  static async getWorkouts(): Promise<CustomWorkout[]> {

  // Placeholder methods    return [];

  static async getWorkouts(): Promise<CustomWorkout[]> {  }

    return [];

  }  static async getWorkoutById(_id: string): Promise<CustomWorkout | null> {

    return null;

  static async getWorkoutById(_id: string): Promise<CustomWorkout | null> {  }

    return null;

  }  static async deleteWorkout(_id: string): Promise<boolean> {

    return false;

  static async deleteWorkout(_id: string): Promise<boolean> {  }

    return false;

  }  static async updateWorkout(_id: string, _workoutData: Partial<WorkoutFormData>): Promise<CustomWorkout | null> {

    return null;

  static async updateWorkout(  }

    _id: string,

    _workoutData: Partial<WorkoutFormData>  static async searchWorkouts(_filters: WorkoutSearchFilters): Promise<CustomWorkout[]> {

  ): Promise<CustomWorkout | null> {    return [];

    return null;  }

  }

  static async createSession(_workoutId: string): Promise<WorkoutSession | null> {

  static async searchWorkouts(_filters: WorkoutSearchFilters): Promise<CustomWorkout[]> {    return null;

    return [];  }

  }

  static async saveExerciseResult(_sessionId: string, _result: WorkoutExerciseResult): Promise<boolean> {

  static async createSession(_workoutId: string): Promise<WorkoutSession | null> {    return false;

    return null;  }

  }

  static async getSessionById(_id: string): Promise<WorkoutSession | null> {

  static async saveExerciseResult(    return null;

    _sessionId: string,  }

    _result: WorkoutExerciseResult

  ): Promise<boolean> {  static async completeSession(_sessionId: string): Promise<boolean> {

    return false;    return false;

  }  }



  static async getSessionById(_id: string): Promise<WorkoutSession | null> {  static async getWorkoutDetails(_id: string): Promise<WorkoutDetails | null> {

    return null;    return null;

  }  }



  static async completeSession(_sessionId: string): Promise<boolean> {  static async getWorkoutExercises(_workoutId: string): Promise<WorkoutExerciseDetails[]> {

    return false;    return [];

  }  }

}
  static async getWorkoutDetails(_id: string): Promise<WorkoutDetails | null> {
    return null;
  }

  static async getWorkoutExercises(_workoutId: string): Promise<WorkoutExerciseDetails[]> {
    return [];
  }
}