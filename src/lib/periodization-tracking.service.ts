/**
 * Periodization Tracking Service
 * Handles database persistence of periodization state
 */

import { supabase } from './supabase';
import { PeriodizationService } from './periodization.service';
import type {
  UserPeriodizationRow,
  PeriodizationTrackingState,
  CreatePeriodizationParams,
  UpdatePeriodizationParams,
  TrainingGoal,
  dbRowToState,
  stateToDbUpdate,
} from '../types/periodization-tracking.types';
import type { PeriodizationState } from '../types/periodization.types';

export class PeriodizationTrackingService {
  /**
   * Get or create periodization state for user + goal
   * This is the main entry point - it will fetch from DB or create new
   */
  static async getOrCreatePeriodization(
    userId: string,
    goal: TrainingGoal
  ): Promise<{ data: PeriodizationState | null; error?: string }> {
    try {
      // Try to fetch existing periodization
      const { data: existing, error: fetchError } = await supabase
        .from('user_periodization')
        .select('*')
        .eq('user_id', userId)
        .eq('goal', goal)
        .single();

      // If exists, convert to PeriodizationState format
      if (existing && !fetchError) {
        return {
          data: this.dbRowToPeriodizationState(existing as UserPeriodizationRow),
        };
      }

      // If doesn't exist, create new
      if (fetchError?.code === 'PGRST116') {
        // Not found - create new
        const createResult = await this.createPeriodization({ userId, goal });
        if (createResult.data) {
          return { data: this.dbRowToPeriodizationState(createResult.data) };
        }
        return { data: null, error: createResult.error };
      }

      // Other error
      console.error('[PeriodizationTrackingService] Fetch error:', fetchError);
      return { data: null, error: fetchError?.message };
    } catch (error) {
      console.error('[PeriodizationTrackingService] Get/Create exception:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create new periodization tracking for user
   */
  static async createPeriodization(
    params: CreatePeriodizationParams
  ): Promise<{ data: UserPeriodizationRow | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_periodization')
        .insert({
          user_id: params.userId,
          goal: params.goal,
          current_week: 1,
          total_weeks_completed: 0,
          workouts_this_week: 0,
          macro_phase: params.macroCyclePhase || 'base',
          macro_cycle_started_at: new Date().toISOString(),
          micro_week: params.microCycleWeek || 'week1',
          is_deload_week: false,
          last_deload_week: null,
          weeks_since_last_deload: 0,
          next_deload_week: 4,
          current_volume_multiplier: 1.0,
          current_intensity_multiplier: 1.0,
        })
        .select()
        .single();

      if (error) {
        console.error('[PeriodizationTrackingService] Create error:', error);
        return { data: null, error: error.message };
      }

      return { data: data as UserPeriodizationRow };
    } catch (error) {
      console.error('[PeriodizationTrackingService] Create exception:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update periodization after workout generation
   * This recalculates the periodization state and saves it
   */
  static async updateAfterWorkout(
    userId: string,
    goal: TrainingGoal,
    currentProgressionLevel: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Calculate new periodization state using PeriodizationService
      const newState = PeriodizationService.calculatePeriodizationState(
        currentProgressionLevel + 1, // Increment for next workout
        goal
      );

      // Fetch current record
      const { data: current } = await supabase
        .from('user_periodization')
        .select('workouts_this_week')
        .eq('user_id', userId)
        .eq('goal', goal)
        .single();

      const workoutsThisWeek = (current?.workouts_this_week || 0) + 1;

      // Update database
      const { error } = await supabase
        .from('user_periodization')
        .update({
          current_week: newState.currentWeek,
          total_weeks_completed: newState.totalWeeksCompleted,
          workouts_this_week: workoutsThisWeek,
          macro_phase: newState.macroCyclePhase,
          micro_week: newState.microCycleWeek,
          is_deload_week: newState.isDeloadWeek,
          last_deload_week: newState.isDeloadWeek ? newState.currentWeek : undefined,
          weeks_since_last_deload: newState.weeksSinceLastDeload,
          next_deload_week: newState.nextDeloadWeek,
          current_volume_multiplier: newState.currentVolumeMultiplier,
          current_intensity_multiplier: newState.currentIntensityMultiplier,
          last_workout_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('goal', goal);

      if (error) {
        console.error('[PeriodizationTrackingService] Update error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('[PeriodizationTrackingService] Update exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Reset periodization (start new program)
   */
  static async resetPeriodization(
    userId: string,
    goal: TrainingGoal
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_periodization')
        .update({
          current_week: 1,
          total_weeks_completed: 0,
          workouts_this_week: 0,
          macro_phase: 'base',
          macro_cycle_started_at: new Date().toISOString(),
          micro_week: 'week1',
          is_deload_week: false,
          last_deload_week: null,
          weeks_since_last_deload: 0,
          next_deload_week: 4,
          current_volume_multiplier: 1.0,
          current_intensity_multiplier: 1.0,
          last_workout_at: null,
        })
        .eq('user_id', userId)
        .eq('goal', goal);

      if (error) {
        console.error('[PeriodizationTrackingService] Reset error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('[PeriodizationTrackingService] Reset exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete periodization tracking
   */
  static async deletePeriodization(
    userId: string,
    goal: TrainingGoal
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_periodization')
        .delete()
        .eq('user_id', userId)
        .eq('goal', goal);

      if (error) {
        console.error('[PeriodizationTrackingService] Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('[PeriodizationTrackingService] Delete exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Helper: Convert database row to PeriodizationState format (for workout generation)
   */
  private static dbRowToPeriodizationState(row: UserPeriodizationRow): PeriodizationState {
    return {
      currentWeek: row.current_week,
      totalWeeksCompleted: row.total_weeks_completed,
      macroCyclePhase: row.macro_phase,
      microCycleWeek: row.micro_week,
      isDeloadWeek: row.is_deload_week,
      weeksSinceLastDeload: row.weeks_since_last_deload,
      nextDeloadWeek: row.next_deload_week,
      currentVolumeMultiplier: row.current_volume_multiplier,
      currentIntensityMultiplier: row.current_intensity_multiplier,
    };
  }

  /**
   * Get all periodization records for a user (all goals)
   */
  static async getAllUserPeriodization(userId: string): Promise<{
    data: UserPeriodizationRow[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_periodization')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('[PeriodizationTrackingService] Get all error:', error);
        return { data: [], error: error.message };
      }

      return { data: (data as UserPeriodizationRow[]) || [] };
    } catch (error) {
      console.error('[PeriodizationTrackingService] Get all exception:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
