/**
 * Workout Style Service
 * Generates advanced workout prescriptions for different training styles
 */

import {
  WorkoutStyle,
  WorkoutStyleConfig,
  WORKOUT_STYLE_CONFIGS,
  GOAL_STYLE_RECOMMENDATIONS,
} from '../types/workout-style.types';
import type { WorkoutPlanItem } from '../hooks/useGenerateWorkout';

export class WorkoutStyleService {
  /**
   * Automatically select best workout style for user's goal and fitness level
   */
  static selectOptimalStyle(
    goal: string,
    fitnessLevel: string,
    sessionMinutes?: number
  ): WorkoutStyle {
    const recommendedStyles = GOAL_STYLE_RECOMMENDATIONS[goal] || GOAL_STYLE_RECOMMENDATIONS.wellness;

    // Filter by fitness level
    const levelFiltered = recommendedStyles.filter((style: WorkoutStyle) => {
      const config = WORKOUT_STYLE_CONFIGS[style];
      if (fitnessLevel === 'beginner') {
        return config.difficulty === 'beginner';
      } else if (fitnessLevel === 'intermediate') {
        return config.difficulty !== 'advanced';
      }
      return true; // Advanced users can do anything
    });

    // Filter by time availability (prefer time-efficient styles for short sessions)
    if (sessionMinutes && sessionMinutes < 30) {
      const timeEfficient = levelFiltered.filter((style: WorkoutStyle) => {
        const config = WORKOUT_STYLE_CONFIGS[style];
        return config.timeEfficiency >= 4;
      });
      if (timeEfficient.length > 0) {
        return timeEfficient[0];
      }
    }

    // Return first recommended style that matches level
    return levelFiltered[0] || 'traditional';
  }

  /**
   * Apply workout style to a workout plan
   */
  static applyStyleToPlan(
    plan: WorkoutPlanItem[],
    style: WorkoutStyle,
    _goal: string
  ): WorkoutPlanItem[] {
    const config = WORKOUT_STYLE_CONFIGS[style];

    // Only apply to main exercises (not warmup/cooldown)
    const mainExercises = plan.filter(item => item.section === 'main');
    const otherExercises = plan.filter(item => item.section !== 'main');

    let styledMainExercises: WorkoutPlanItem[] = [];

    switch (style) {
      case 'emom':
        styledMainExercises = this.applyEMOM(mainExercises, config);
        break;

      case 'amrap':
        styledMainExercises = this.applyAMRAP(mainExercises, config);
        break;

      case 'tabata':
        styledMainExercises = this.applyTabata(mainExercises, config);
        break;

      case 'circuit':
        styledMainExercises = this.applyCircuit(mainExercises, config);
        break;

      case 'superset':
        styledMainExercises = this.applySuperset(mainExercises, config);
        break;

      case 'drop-set':
        styledMainExercises = this.applyDropSet(mainExercises, config);
        break;

      case 'pyramid':
        styledMainExercises = this.applyPyramid(mainExercises, config);
        break;

      case 'ladder':
        styledMainExercises = this.applyLadder(mainExercises, config);
        break;

      case 'complex':
        styledMainExercises = this.applyComplex(mainExercises, config);
        break;

      case 'for-time':
        styledMainExercises = this.applyForTime(mainExercises, config);
        break;

      default:
        styledMainExercises = mainExercises; // Traditional style
    }

    return [...otherExercises, ...styledMainExercises];
  }

  /**
   * EMOM: Every Minute On the Minute
   */
  private static applyEMOM(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const minutesTotal = config.parameters?.minutesTotal || 12;
    const minutesPerExercise = Math.floor(minutesTotal / exercises.length);

    return exercises.map((item, index) => ({
      ...item,
      sets: minutesPerExercise,
      reps: item.reps || '10-12',
      rest: 0, // Rest is built into the minute
      reason: `Min ${index * minutesPerExercise + 1}-${(index + 1) * minutesPerExercise}: ${item.reps || '10-12'} reps at top of each minute, rest remaining time`,
    }));
  }

  /**
   * AMRAP: As Many Rounds/Reps As Possible
   */
  private static applyAMRAP(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const duration = config.parameters?.durationMinutes || 12;

    return exercises.map((item, index) => ({
      ...item,
      sets: 1, // AMRAP is continuous
      reps: item.reps || '10',
      rest: 0,
      reason: `${duration} min AMRAP - Round ${index + 1}: ${item.reps || '10'} reps, move immediately to next exercise`,
    }));
  }

  /**
   * Tabata: 20s work / 10s rest × 8 rounds
   */
  private static applyTabata(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const workSeconds = config.parameters?.workSeconds || 20;
    const restSeconds = config.parameters?.restSeconds || 10;
    const rounds = config.parameters?.rounds || 8;

    return exercises.map((item, index) => ({
      ...item,
      sets: rounds,
      reps: 'Max reps',
      time: `${workSeconds}s`,
      rest: restSeconds,
      reason: `Tabata Round ${index + 1}: ${workSeconds}s max effort / ${restSeconds}s rest × ${rounds}`,
    }));
  }

  /**
   * Circuit Training
   */
  private static applyCircuit(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const rounds = config.parameters?.roundsTotal || 3;
    const transition = config.parameters?.restBetweenExercises || 10;
    const roundRest = config.parameters?.restBetweenRounds || 90;

    return exercises.map((item, index) => ({
      ...item,
      sets: rounds,
      reps: item.reps || '12',
      rest: index === exercises.length - 1 ? roundRest : transition,
      reason: `Circuit Station ${index + 1}: ${item.reps || '12'} reps, ${index === exercises.length - 1 ? roundRest + 's rest after round' : transition + 's transition'}`,
    }));
  }

  /**
   * Superset Pairs
   */
  private static applySuperset(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const pairRest = config.parameters?.restBetweenPairs || 60;

    // Pair exercises (push-pull, upper-lower, etc.)
    return exercises.map((item, index) => {
      const isOdd = index % 2 === 0;
      const pairLetter = String.fromCharCode(65 + Math.floor(index / 2)); // A, B, C...

      return {
        ...item,
        sets: item.sets || 3,
        reps: item.reps || '10-12',
        rest: isOdd ? 0 : pairRest,
        reason: `Superset ${pairLetter}${isOdd ? '1' : '2'}: ${item.reps || '10-12'} reps, ${isOdd ? 'no rest' : pairRest + 's rest after pair'}`,
      };
    });
  }

  /**
   * Drop Sets
   */
  private static applyDropSet(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const dropPercentage = config.parameters?.dropPercentage || 25;
    const drops = config.parameters?.dropsPerSet || 2;

    return exercises.map((item, _index) => ({
      ...item,
      sets: item.sets || 3,
      reps: item.reps || '8-10',
      rest: item.rest || 90,
      reason: `Drop Set: ${item.reps || '8-10'} reps to failure → drop ${dropPercentage}% → continue × ${drops} drops`,
    }));
  }

  /**
   * Pyramid Sets
   */
  private static applyPyramid(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const pyramidType = config.parameters?.pyramidType || 'ascending';
    const repScheme = config.parameters?.repScheme || [6, 8, 10, 12];

    return exercises.map((item, index) => ({
      ...item,
      sets: repScheme.length,
      reps: repScheme.join('-'),
      rest: item.rest || 60,
      reason: `${pyramidType === 'ascending' ? 'Ascending' : 'Descending'} Pyramid: ${repScheme.join(' → ')} reps`,
    }));
  }

  /**
   * Ladder
   */
  private static applyLadder(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const startReps = config.parameters?.startReps || 1;
    const endReps = config.parameters?.endReps || 10;
    const increment = config.parameters?.increment || 1;

    const rounds = Math.floor((endReps - startReps) / increment) + 1;

    return exercises.map((item, index) => ({
      ...item,
      sets: rounds,
      reps: `${startReps} to ${endReps}`,
      rest: 30,
      reason: `Ladder: Start at ${startReps} reps, add ${increment} rep(s) each set, finish at ${endReps} reps`,
    }));
  }

  /**
   * Barbell/Dumbbell Complex
   */
  private static applyComplex(
    exercises: WorkoutPlanItem[],
    config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    const complexRounds = config.parameters?.complexRounds || 4;

    return exercises.map((item, index) => ({
      ...item,
      sets: complexRounds,
      reps: item.reps || '6',
      rest: index === exercises.length - 1 ? 120 : 0,
      reason: `Complex ${index + 1}: ${item.reps || '6'} reps, ${index === exercises.length - 1 ? 'then rest 2 min' : 'flow immediately to next exercise'}`,
    }));
  }

  /**
   * For Time
   */
  private static applyForTime(
    exercises: WorkoutPlanItem[],
    _config: WorkoutStyleConfig
  ): WorkoutPlanItem[] {
    // Classic CrossFit-style descending reps (21-15-9)
    const repScheme = [21, 15, 9];

    return exercises.map((item, _index) => ({
      ...item,
      sets: repScheme.length,
      reps: repScheme.join('-'),
      rest: 0,
      reason: `For Time: ${repScheme.join('-')} reps as fast as possible`,
    }));
  }

  /**
   * Get style summary for display
   */
  static getStyleSummary(style: WorkoutStyle): {
    name: string;
    emoji: string;
    description: string;
    difficulty: string;
    timeEfficiency: number;
    intensityLevel: number;
  } {
    const config = WORKOUT_STYLE_CONFIGS[style];

    return {
      name: config.name,
      emoji: config.emoji,
      description: config.description,
      difficulty: config.difficulty,
      timeEfficiency: config.timeEfficiency,
      intensityLevel: config.intensityLevel,
    };
  }

  /**
   * Get detailed instructions for a style
   */
  static getDetailedInstructions(style: WorkoutStyle): string[] {
    switch (style) {
      case 'emom':
        return [
          'Start each exercise at the top of the minute',
          'Complete prescribed reps as fast as possible',
          'Rest for remaining time in the minute',
          'Maintain consistent pace throughout',
          'If you cannot complete reps in 40s, reduce reps',
        ];

      case 'amrap':
        return [
          'Move continuously through all exercises',
          'Complete as many full rounds as possible',
          'Minimal rest between exercises',
          'Maintain good form over speed',
          'Count total rounds completed',
        ];

      case 'tabata':
        return [
          'Work at maximum intensity for 20 seconds',
          'Rest completely for 10 seconds',
          'Repeat for 8 total rounds (4 minutes)',
          'Count reps in each round',
          'Try to maintain consistent reps across rounds',
        ];

      case 'circuit':
        return [
          'Complete all reps at first station',
          'Move to next station with minimal transition',
          'Complete all stations = 1 round',
          'Rest after completing full round',
          'Maintain steady pace throughout',
        ];

      case 'superset':
        return [
          'Complete first exercise (A1)',
          'Immediately move to paired exercise (A2)',
          'Rest after completing the pair',
          'Repeat for all sets before moving to next pair',
          'Maintain intensity on both exercises',
        ];

      case 'drop-set':
        return [
          'Perform set to muscular failure',
          'Immediately reduce weight by 20-30%',
          'Continue to failure again',
          'Repeat drops as prescribed',
          'Focus on form despite fatigue',
        ];

      case 'pyramid':
        return [
          'Start with prescribed rep range',
          'Progress up (ascending) or down (descending)',
          'Adjust weight as needed to maintain intensity',
          'Rest between sets',
          'Full pyramid = up and back down',
        ];

      case 'ladder':
        return [
          'Start with lowest rep count',
          'Add reps each set',
          'Continue until prescribed max reps',
          'Short rest between sets',
          'Can be done solo or with partner alternating',
        ];

      case 'complex':
        return [
          'Load barbell/dumbbells with appropriate weight',
          'Complete all exercises without putting weight down',
          'Flow smoothly between movements',
          'Rest after completing all exercises',
          'Focus on technique under fatigue',
        ];

      case 'for-time':
        return [
          'Complete all prescribed work as fast as possible',
          'Typical format: 21-15-9 reps',
          'Alternate between exercises',
          'Record total time to completion',
          'Maintain safe form despite speed',
        ];

      default:
        return [
          'Complete prescribed sets and reps',
          'Rest between sets',
          'Maintain good form',
          'Control tempo on each rep',
          'Progressive overload over time',
        ];
    }
  }

  /**
   * Determine if exercises are suitable for a given style
   */
  static validateExercisesForStyle(
    exercises: WorkoutPlanItem[],
    style: WorkoutStyle
  ): { valid: boolean; reason?: string } {
    switch (style) {
      case 'complex':
        // Complex requires all exercises to use same equipment
        const equipment = exercises.map(e => e.exercise.equipment);
        const uniqueEquipment = [...new Set(equipment)];
        if (uniqueEquipment.length > 1) {
          return {
            valid: false,
            reason: 'Complexes require all exercises to use the same equipment (e.g., all barbell)',
          };
        }
        break;

      case 'tabata':
        // Tabata works best with 1-4 exercises
        if (exercises.length > 4) {
          return {
            valid: false,
            reason: 'Tabata format works best with 1-4 exercises for maximum intensity',
          };
        }
        break;

      case 'superset':
        // Supersets need even number of exercises
        if (exercises.length % 2 !== 0) {
          return {
            valid: false,
            reason: 'Supersets require an even number of exercises to create pairs',
          };
        }
        break;
    }

    return { valid: true };
  }
}
