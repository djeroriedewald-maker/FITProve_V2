/**
 * Periodization Service
 *
 * Manages intelligent program cycling:
 * - Calculates current training phase (base/build/peak/recovery)
 * - Determines deload weeks automatically
 * - Provides volume/intensity multipliers for wave progression
 */

import type {
  PeriodizationConfig,
  PeriodizationState,
  MacroCyclePhase,
  MicroCycleWeek,
  WaveProgression,
} from '../types/periodization.types';
import {
  PERIODIZATION_CONFIGS,
  MACRO_PHASE_CONFIGS,
  DELOAD_CONFIG,
} from '../types/periodization.types';

export class PeriodizationService {
  /**
   * Calculate current periodization state based on workout count
   */
  static calculatePeriodizationState(
    workoutCount: number,
    goal: string = 'muscle'
  ): PeriodizationState {
    // Get config for goal (default to muscle if not found)
    const config = PERIODIZATION_CONFIGS[goal] || PERIODIZATION_CONFIGS.muscle;

    // Assuming ~3 workouts per week (adjust based on frequency)
    const currentWeek = Math.floor(workoutCount / 3) + 1;

    // Determine if this is a deload week
    const isDeloadWeek = this.isDeloadWeek(currentWeek, config.deloadFrequency);
    const weeksSinceLastDeload = (currentWeek - 1) % config.deloadFrequency;
    const nextDeloadWeek = currentWeek + (config.deloadFrequency - weeksSinceLastDeload);

    // Determine macro cycle phase
    const macroCyclePhase = this.getMacroCyclePhase(currentWeek, config);

    // Determine micro cycle week (within 4-week block)
    const microCycleWeek = this.getMicroCycleWeek(currentWeek, isDeloadWeek);

    // Calculate volume/intensity multipliers
    const { volumeMultiplier, intensityMultiplier } = this.getMultipliers(
      macroCyclePhase,
      microCycleWeek,
      isDeloadWeek
    );

    return {
      currentWeek,
      totalWeeksCompleted: currentWeek - 1,
      macroCyclePhase,
      microCycleWeek,
      isDeloadWeek,
      weeksSinceLastDeload,
      nextDeloadWeek,
      currentVolumeMultiplier: volumeMultiplier,
      currentIntensityMultiplier: intensityMultiplier,
    };
  }

  /**
   * Check if current week is a deload week
   */
  static isDeloadWeek(currentWeek: number, deloadFrequency: number): boolean {
    return currentWeek % deloadFrequency === 0;
  }

  /**
   * Get current macro cycle phase
   */
  static getMacroCyclePhase(
    currentWeek: number,
    config: PeriodizationConfig
  ): MacroCyclePhase {
    // Position within the macro cycle
    const cyclePosition = (currentWeek - 1) % config.cycleLengthWeeks + 1;

    // Base phase
    if (cyclePosition <= config.basePhaseDuration) {
      return 'base';
    }

    // Build phase
    if (cyclePosition <= config.basePhaseDuration + config.buildPhaseDuration) {
      return 'build';
    }

    // Peak phase
    if (
      cyclePosition <=
      config.basePhaseDuration + config.buildPhaseDuration + config.peakPhaseDuration
    ) {
      return 'peak';
    }

    // Recovery phase
    return 'recovery';
  }

  /**
   * Get micro cycle week (4-week block)
   */
  static getMicroCycleWeek(
    currentWeek: number,
    isDeloadWeek: boolean
  ): MicroCycleWeek {
    if (isDeloadWeek) return 'deload';

    const weekInBlock = ((currentWeek - 1) % 4) + 1;
    if (weekInBlock === 1) return 'week1';
    if (weekInBlock === 2) return 'week2';
    if (weekInBlock === 3) return 'week3';

    // This shouldn't happen if deload is on week 4
    return 'week1';
  }

  /**
   * Calculate volume and intensity multipliers
   */
  static getMultipliers(
    macroCyclePhase: MacroCyclePhase,
    microCycleWeek: MicroCycleWeek,
    isDeloadWeek: boolean
  ): { volumeMultiplier: number; intensityMultiplier: number } {
    // Deload week overrides everything
    if (isDeloadWeek) {
      return {
        volumeMultiplier: DELOAD_CONFIG.volumeReduction,
        intensityMultiplier: DELOAD_CONFIG.intensityReduction,
      };
    }

    const phaseConfig = MACRO_PHASE_CONFIGS[macroCyclePhase];

    // Base multipliers from macro phase
    let volumeMultiplier = (phaseConfig.volumeRange[0] + phaseConfig.volumeRange[1]) / 2;
    let intensityMultiplier =
      (phaseConfig.intensityRange[0] + phaseConfig.intensityRange[1]) / 2;

    // Wave progression within micro cycle (3-week wave)
    if (microCycleWeek === 'week1') {
      // Week 1: Moderate volume, moderate intensity
      volumeMultiplier *= 0.9;
      intensityMultiplier *= 0.95;
    } else if (microCycleWeek === 'week2') {
      // Week 2: Higher volume, similar intensity
      volumeMultiplier *= 1.05;
      intensityMultiplier *= 1.0;
    } else if (microCycleWeek === 'week3') {
      // Week 3: Moderate volume, higher intensity
      volumeMultiplier *= 0.95;
      intensityMultiplier *= 1.05;
    }

    return {
      volumeMultiplier: Math.round(volumeMultiplier * 100) / 100,
      intensityMultiplier: Math.round(intensityMultiplier * 100) / 100,
    };
  }

  /**
   * Generate wave progression for next N weeks
   */
  static generateWaveProgression(
    startWeek: number,
    weeksToShow: number,
    goal: string = 'muscle'
  ): WaveProgression[] {
    const config = PERIODIZATION_CONFIGS[goal] || PERIODIZATION_CONFIGS.muscle;
    const progression: WaveProgression[] = [];

    for (let i = 0; i < weeksToShow; i++) {
      const week = startWeek + i;
      const isDeload = this.isDeloadWeek(week, config.deloadFrequency);
      const phase = this.getMacroCyclePhase(week, config);
      const microWeek = this.getMicroCycleWeek(week, isDeload);
      const { volumeMultiplier, intensityMultiplier } = this.getMultipliers(
        phase,
        microWeek,
        isDeload
      );

      let description = '';
      if (isDeload) {
        description = '🔄 Deload & Recovery';
      } else if (microWeek === 'week1') {
        description = '📈 Volume Focus';
      } else if (microWeek === 'week2') {
        description = '💪 Build Week';
      } else if (microWeek === 'week3') {
        description = '🔥 Intensity Peak';
      }

      progression.push({
        week,
        volumeMultiplier,
        intensityMultiplier,
        phase,
        isDeload,
        description,
      });
    }

    return progression;
  }

  /**
   * Get phase description and recommendations
   */
  static getPhaseDescription(phase: MacroCyclePhase): {
    name: string;
    description: string;
    recommendations: string[];
  } {
    const config = MACRO_PHASE_CONFIGS[phase];

    const recommendations: Record<MacroCyclePhase, string[]> = {
      base: [
        'Focus on perfect form and technique',
        'Build movement patterns and mobility',
        'Establish consistent training routine',
        'Gradually increase work capacity',
      ],
      build: [
        'Progressive overload every workout',
        'Increase weight when hitting rep targets',
        'Push close to failure on working sets',
        'Maintain good recovery practices',
      ],
      peak: [
        'Max effort on compound lifts',
        'Reduce volume, increase intensity',
        'Perfect form on heavy weights',
        'Prepare for competition or testing',
      ],
      recovery: [
        'Active recovery and mobility work',
        'Light cardio and movement',
        'Address any nagging injuries',
        'Mental and physical reset',
      ],
    };

    return {
      name: config.name,
      description: config.description,
      recommendations: recommendations[phase],
    };
  }

  /**
   * Get deload week recommendations
   */
  static getDeloadRecommendations(): string[] {
    return [
      '✅ Reduce volume by 40% (fewer sets)',
      '✅ Reduce intensity by 20% (lighter weights)',
      '✅ Focus on mobility and flexibility',
      '✅ Maintain exercise selection',
      '✅ Keep good form and technique',
      '❌ Avoid training to failure',
      '❌ Skip high-intensity cardio',
      '🧘 Add yoga or stretching sessions',
    ];
  }

  /**
   * Adjust workout prescription based on periodization
   */
  static applyPeriodization(
    sets: number,
    reps: string,
    rest: number,
    state: PeriodizationState
  ): { sets: number; reps: string; rest: number } {
    let adjustedSets = sets;
    let adjustedReps = reps;
    let adjustedRest = rest;

    // Apply volume multiplier to sets
    adjustedSets = Math.max(1, Math.round(sets * state.currentVolumeMultiplier));

    // Apply intensity multiplier to reps (for deload/recovery)
    if (state.isDeloadWeek || state.macroCyclePhase === 'recovery') {
      // Keep rep range but suggest lighter weights (implicitly)
      // No change to rep range, but user should lift lighter
    } else if (state.macroCyclePhase === 'peak') {
      // Peak phase: Lower reps, higher intensity
      if (reps.includes('-')) {
        const [low, high] = reps.split('-').map(Number);
        adjustedReps = `${Math.max(1, low - 2)}-${Math.max(3, high - 2)}`;
      }
    }

    // Apply rest multiplier from phase
    const phaseConfig = MACRO_PHASE_CONFIGS[state.macroCyclePhase];
    adjustedRest = Math.round(rest * phaseConfig.restMultiplier);

    return {
      sets: adjustedSets,
      reps: adjustedReps,
      rest: adjustedRest,
    };
  }

  /**
   * Get training advice for current state
   */
  static getTrainingAdvice(state: PeriodizationState): string {
    if (state.isDeloadWeek) {
      return `🔄 **Deload Week**: This is a recovery week. Reduce weight by 20% and focus on form. Your body needs this to adapt and grow stronger.`;
    }

    const phaseAdvice: Record<MacroCyclePhase, string> = {
      base: `📚 **Base Phase**: Focus on mastering movement patterns. Perfect your form before adding intensity.`,
      build: `💪 **Build Phase**: Time to push! Increase weight when you hit rep targets. This is where you make gains.`,
      peak: `🔥 **Peak Phase**: Maximum intensity! Lower volume, heavier weights. Show what you've built.`,
      recovery: `🧘 **Recovery Phase**: Active recovery week. Light movement, mobility work, and mental reset before the next cycle.`,
    };

    return phaseAdvice[state.macroCyclePhase];
  }
}
