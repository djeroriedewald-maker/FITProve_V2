/**
 * Periodization Tracking Types
 * For database persistence of periodization state
 */

export type MacroCyclePhase = 'base' | 'build' | 'peak' | 'recovery';
export type MicroCycleWeek = 'week1' | 'week2' | 'week3' | 'deload';
export type TrainingGoal = 'strength' | 'muscle' | 'endurance' | 'weight-loss' | 'event' | 'wellness';

/**
 * Database row for user_periodization table
 */
export interface UserPeriodizationRow {
  id: string;
  user_id: string;
  goal: TrainingGoal;

  // Week tracking
  current_week: number;
  total_weeks_completed: number;
  workouts_this_week: number;

  // Macro cycle (12-16 weeks)
  macro_phase: MacroCyclePhase;
  macro_cycle_started_at: string; // ISO timestamp

  // Micro cycle (4 weeks)
  micro_week: MicroCycleWeek;

  // Deload tracking
  is_deload_week: boolean;
  last_deload_week: number | null;
  weeks_since_last_deload: number;
  next_deload_week: number;

  // Multipliers
  current_volume_multiplier: number;
  current_intensity_multiplier: number;

  // Timestamps
  started_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_workout_at: string | null; // ISO timestamp
}

/**
 * Client-side periodization state (matches PeriodizationState from periodization.types.ts)
 */
export interface PeriodizationTrackingState {
  currentWeek: number;
  totalWeeksCompleted: number;
  workoutsThisWeek: number;

  macroCyclePhase: MacroCyclePhase;
  macroCycleStartedAt: Date;

  microCycleWeek: MicroCycleWeek;

  isDeloadWeek: boolean;
  lastDeloadWeek: number | null;
  weeksSinceLastDeload: number;
  nextDeloadWeek: number;

  currentVolumeMultiplier: number;
  currentIntensityMultiplier: number;

  startedAt: Date;
  updatedAt: Date;
  lastWorkoutAt: Date | null;
}

/**
 * Parameters for creating new periodization tracking
 */
export interface CreatePeriodizationParams {
  userId: string;
  goal: TrainingGoal;
  macroCyclePhase?: MacroCyclePhase; // Default: 'base'
  microCycleWeek?: MicroCycleWeek; // Default: 'week1'
}

/**
 * Parameters for updating periodization after workout
 */
export interface UpdatePeriodizationParams {
  userId: string;
  goal: TrainingGoal;

  // Increment week if workout completes a week
  incrementWeek?: boolean;

  // Override specific values
  currentWeek?: number;
  macroCyclePhase?: MacroCyclePhase;
  microCycleWeek?: MicroCycleWeek;
  isDeloadWeek?: boolean;
  currentVolumeMultiplier?: number;
  currentIntensityMultiplier?: number;
}

/**
 * Helper to convert database row to client state
 */
export function dbRowToState(row: UserPeriodizationRow): PeriodizationTrackingState {
  return {
    currentWeek: row.current_week,
    totalWeeksCompleted: row.total_weeks_completed,
    workoutsThisWeek: row.workouts_this_week,

    macroCyclePhase: row.macro_phase,
    macroCycleStartedAt: new Date(row.macro_cycle_started_at),

    microCycleWeek: row.micro_week,

    isDeloadWeek: row.is_deload_week,
    lastDeloadWeek: row.last_deload_week,
    weeksSinceLastDeload: row.weeks_since_last_deload,
    nextDeloadWeek: row.next_deload_week,

    currentVolumeMultiplier: row.current_volume_multiplier,
    currentIntensityMultiplier: row.current_intensity_multiplier,

    startedAt: new Date(row.started_at),
    updatedAt: new Date(row.updated_at),
    lastWorkoutAt: row.last_workout_at ? new Date(row.last_workout_at) : null,
  };
}

/**
 * Helper to convert client state to database row (for updates)
 */
export function stateToDbUpdate(state: Partial<PeriodizationTrackingState>): Partial<UserPeriodizationRow> {
  const update: Partial<UserPeriodizationRow> = {};

  if (state.currentWeek !== undefined) update.current_week = state.currentWeek;
  if (state.totalWeeksCompleted !== undefined) update.total_weeks_completed = state.totalWeeksCompleted;
  if (state.workoutsThisWeek !== undefined) update.workouts_this_week = state.workoutsThisWeek;

  if (state.macroCyclePhase !== undefined) update.macro_phase = state.macroCyclePhase;
  if (state.macroCycleStartedAt !== undefined) update.macro_cycle_started_at = state.macroCycleStartedAt.toISOString();

  if (state.microCycleWeek !== undefined) update.micro_week = state.microCycleWeek;

  if (state.isDeloadWeek !== undefined) update.is_deload_week = state.isDeloadWeek;
  if (state.lastDeloadWeek !== undefined) update.last_deload_week = state.lastDeloadWeek;
  if (state.weeksSinceLastDeload !== undefined) update.weeks_since_last_deload = state.weeksSinceLastDeload;
  if (state.nextDeloadWeek !== undefined) update.next_deload_week = state.nextDeloadWeek;

  if (state.currentVolumeMultiplier !== undefined) update.current_volume_multiplier = state.currentVolumeMultiplier;
  if (state.currentIntensityMultiplier !== undefined) update.current_intensity_multiplier = state.currentIntensityMultiplier;

  if (state.lastWorkoutAt !== undefined) {
    update.last_workout_at = state.lastWorkoutAt ? state.lastWorkoutAt.toISOString() : null;
  }

  return update;
}
