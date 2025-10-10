/**
 * Periodization Types
 *
 * Implements intelligent program cycling to prevent plateaus and overtraining:
 * - Macro cycles (base → build → peak → recovery)
 * - Automatic deload weeks
 * - Volume/intensity wave programming
 */

export type MacroCyclePhase = 'base' | 'build' | 'peak' | 'recovery';

export type MicroCycleWeek = 'week1' | 'week2' | 'week3' | 'deload';

export interface PeriodizationConfig {
  // Macro cycle configuration
  cycleLengthWeeks: number;        // Total weeks in full macro cycle (default: 12)
  deloadFrequency: number;          // Deload every N weeks (default: 4)

  // Phase durations (in weeks)
  basePhaseDuration: number;        // Anatomical adaptation (default: 3)
  buildPhaseDuration: number;       // Hypertrophy/strength building (default: 5)
  peakPhaseDuration: number;        // Peak performance (default: 2)
  recoveryPhaseDuration: number;    // Active recovery (default: 2)
}

export interface PeriodizationState {
  // Current position in program
  currentWeek: number;              // Absolute week number (1, 2, 3, ...)
  totalWeeksCompleted: number;      // Total weeks in program

  // Current phases
  macroCyclePhase: MacroCyclePhase;
  microCycleWeek: MicroCycleWeek;

  // Deload tracking
  isDeloadWeek: boolean;
  weeksSinceLastDeload: number;
  nextDeloadWeek: number;

  // Volume/intensity tracking
  currentVolumeMultiplier: number;  // 0.6 (deload) to 1.2 (peak)
  currentIntensityMultiplier: number; // 0.7 (base) to 1.1 (peak)
}

export interface MacroCyclePhaseConfig {
  name: string;
  description: string;
  volumeRange: [number, number];    // [min, max] multipliers
  intensityRange: [number, number]; // [min, max] multipliers
  restMultiplier: number;           // Rest period adjustment
  focusAreas: string[];             // Training focus for this phase
}

export interface DeloadWeekConfig {
  volumeReduction: number;          // Reduce volume to % (default: 0.6 = 40% reduction)
  intensityReduction: number;       // Reduce intensity to % (default: 0.8 = 20% reduction)
  skipCardio: boolean;              // Skip high-intensity cardio (default: true)
  emphasizeRecovery: boolean;       // Add mobility/stretching (default: true)
}

export interface WaveProgression {
  week: number;
  volumeMultiplier: number;
  intensityMultiplier: number;
  phase: MacroCyclePhase;
  isDeload: boolean;
  description: string;
}

/**
 * Default periodization configurations by goal
 */
export const PERIODIZATION_CONFIGS: Record<string, PeriodizationConfig> = {
  strength: {
    cycleLengthWeeks: 12,
    deloadFrequency: 4,
    basePhaseDuration: 3,
    buildPhaseDuration: 5,
    peakPhaseDuration: 2,
    recoveryPhaseDuration: 2,
  },
  muscle: {
    cycleLengthWeeks: 12,
    deloadFrequency: 4,
    basePhaseDuration: 2,
    buildPhaseDuration: 6,
    peakPhaseDuration: 2,
    recoveryPhaseDuration: 2,
  },
  endurance: {
    cycleLengthWeeks: 16,
    deloadFrequency: 4,
    basePhaseDuration: 4,
    buildPhaseDuration: 8,
    peakPhaseDuration: 2,
    recoveryPhaseDuration: 2,
  },
  'weight-loss': {
    cycleLengthWeeks: 8,
    deloadFrequency: 4,
    basePhaseDuration: 2,
    buildPhaseDuration: 4,
    peakPhaseDuration: 1,
    recoveryPhaseDuration: 1,
  },
  event: {
    cycleLengthWeeks: 12,
    deloadFrequency: 3, // More frequent deloads for event prep
    basePhaseDuration: 3,
    buildPhaseDuration: 6,
    peakPhaseDuration: 2,
    recoveryPhaseDuration: 1,
  },
  wellness: {
    cycleLengthWeeks: 8,
    deloadFrequency: 4,
    basePhaseDuration: 2,
    buildPhaseDuration: 4,
    peakPhaseDuration: 1,
    recoveryPhaseDuration: 1,
  },
};

/**
 * Macro cycle phase characteristics
 */
export const MACRO_PHASE_CONFIGS: Record<MacroCyclePhase, MacroCyclePhaseConfig> = {
  base: {
    name: 'Base Phase',
    description: 'Anatomical adaptation and movement pattern development',
    volumeRange: [0.7, 0.9],
    intensityRange: [0.6, 0.75],
    restMultiplier: 1.2, // Longer rest for technique focus
    focusAreas: [
      'Movement quality',
      'Mobility development',
      'Postural correction',
      'Work capacity building',
    ],
  },
  build: {
    name: 'Build Phase',
    description: 'Progressive overload and strength/hypertrophy development',
    volumeRange: [0.9, 1.1],
    intensityRange: [0.75, 0.9],
    restMultiplier: 1.0,
    focusAreas: [
      'Progressive overload',
      'Muscle building',
      'Strength development',
      'Technical mastery',
    ],
  },
  peak: {
    name: 'Peak Phase',
    description: 'Maximum performance and peak strength/power',
    volumeRange: [0.8, 1.0],
    intensityRange: [0.9, 1.1],
    restMultiplier: 1.3, // Longer rest for max effort
    focusAreas: [
      'Peak performance',
      'Maximum strength',
      'Power development',
      'Competition prep',
    ],
  },
  recovery: {
    name: 'Recovery Phase',
    description: 'Active recovery and preparation for next cycle',
    volumeRange: [0.5, 0.7],
    intensityRange: [0.5, 0.7],
    restMultiplier: 1.1,
    focusAreas: [
      'Active recovery',
      'Mobility work',
      'Mental reset',
      'Preparation for new cycle',
    ],
  },
};

/**
 * Deload week configuration
 */
export const DELOAD_CONFIG: DeloadWeekConfig = {
  volumeReduction: 0.6,        // 40% volume reduction
  intensityReduction: 0.8,     // 20% intensity reduction
  skipCardio: true,            // Skip high-intensity cardio
  emphasizeRecovery: true,     // Add mobility/stretching
};
