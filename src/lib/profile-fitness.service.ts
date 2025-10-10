/**
 * Profile Fitness Service
 * Handles saving and loading fitness-related profile data from Supabase
 */

import { supabase } from './supabase';
import type { UserProfile } from '../types/profile.types';

export interface FitnessProfileData {
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  age?: number;
  eventType?: string;
  limitations?: string[];
  availableEquipment?: string[];
  preferredDuration?: number;
  preferredWorkoutStyles?: string[];
  preferredMuscles?: string[];
  frequencyDays?: string[];
  preferredTime?: string;
  onboardingCompleted?: boolean;
}

export class ProfileFitnessService {
  /**
   * Save fitness profile data after onboarding
   */
  static async saveFitnessProfile(
    userId: string,
    data: FitnessProfileData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          fitness_level: data.fitnessLevel,
          age: data.age,
          event_type: data.eventType,
          limitations: data.limitations || [],
          available_equipment: data.availableEquipment || [],
          preferred_duration: data.preferredDuration,
          preferred_workout_styles: data.preferredWorkoutStyles || [],
          preferred_muscles: data.preferredMuscles || [],
          frequency_days: data.frequencyDays || [],
          preferred_time: data.preferredTime,
          onboarding_completed: data.onboardingCompleted !== undefined ? data.onboardingCompleted : true,
          onboarding_completed_at: data.onboardingCompleted ? new Date().toISOString() : null,
        })
        .eq('id', userId);

      if (error) {
        console.error('[ProfileFitnessService] Save error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('[ProfileFitnessService] Save exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load fitness profile data
   */
  static async loadFitnessProfile(userId: string): Promise<{
    data: FitnessProfileData | null;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          fitness_level,
          age,
          event_type,
          limitations,
          available_equipment,
          preferred_duration,
          preferred_workout_styles,
          preferred_muscles,
          frequency_days,
          preferred_time,
          onboarding_completed,
          onboarding_completed_at
        `
        )
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[ProfileFitnessService] Load error:', error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null };
      }

      // Map database fields to client format
      return {
        data: {
          fitnessLevel: data.fitness_level as 'beginner' | 'intermediate' | 'advanced' | undefined,
          age: data.age || undefined,
          eventType: data.event_type || undefined,
          limitations: data.limitations || [],
          availableEquipment: data.available_equipment || [],
          preferredDuration: data.preferred_duration || undefined,
          preferredWorkoutStyles: data.preferred_workout_styles || [],
          preferredMuscles: data.preferred_muscles || [],
          frequencyDays: data.frequency_days || [],
          preferredTime: data.preferred_time || undefined,
          onboardingCompleted: data.onboarding_completed || false,
        },
      };
    } catch (error) {
      console.error('[ProfileFitnessService] Load exception:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update workout generation stats
   */
  static async incrementWorkoutGeneration(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('increment_workout_count', {
        user_id_param: userId,
      });

      // If RPC doesn't exist, fallback to manual update
      if (error && error.message.includes('function')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_workouts_generated')
          .eq('id', userId)
          .single();

        const currentCount = profile?.total_workouts_generated || 0;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_workouts_generated: currentCount + 1,
            last_workout_generated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[ProfileFitnessService] Increment error:', updateError);
          return { success: false, error: updateError.message };
        }

        return { success: true };
      }

      if (error) {
        console.error('[ProfileFitnessService] Increment error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('[ProfileFitnessService] Increment exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[ProfileFitnessService] Check onboarding error:', error);
        return false;
      }

      return data?.onboarding_completed || false;
    } catch (error) {
      console.error('[ProfileFitnessService] Check onboarding exception:', error);
      return false;
    }
  }

  /**
   * Get user's preferred workout parameters (for auto-populating generator)
   */
  static async getPreferredWorkoutParams(userId: string): Promise<{
    goal?: string;
    fitnessLevel?: string;
    age?: number;
    eventType?: string;
    equipment?: string[];
    muscles?: string[];
    duration?: number;
    limitations?: string[];
    frequencyDays?: string[];
    preferredTime?: string;
    preferredStyles?: string[];
  } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          fitness_goals,
          fitness_level,
          age,
          event_type,
          available_equipment,
          preferred_muscles,
          preferred_duration,
          limitations,
          frequency_days,
          preferred_time,
          preferred_workout_styles
        `
        )
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        goal: data.fitness_goals?.[0] || undefined,
        fitnessLevel: data.fitness_level || undefined,
        age: data.age || undefined,
        eventType: data.event_type || undefined,
        equipment: data.available_equipment || [],
        muscles: data.preferred_muscles || [],
        duration: data.preferred_duration || undefined,
        limitations: data.limitations || [],
        frequencyDays: data.frequency_days || [],
        preferredTime: data.preferred_time || undefined,
        preferredStyles: data.preferred_workout_styles || [],
      };
    } catch (error) {
      console.error('[ProfileFitnessService] Get preferred params exception:', error);
      return null;
    }
  }
}
