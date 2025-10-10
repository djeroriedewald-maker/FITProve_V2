import { useMemo } from 'react';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { Exercise, MuscleGroup } from '../types/exercise.types';
import { PeriodizationService } from '../lib/periodization.service';
import type { PeriodizationState } from '../types/periodization.types';
import { WorkoutStyleService } from '../lib/workout-style.service';
import type { WorkoutStyle } from '../types/workout-style.types';

export interface WorkoutGenerationParams {
  gender: string;
  age: number;
  goal: string;
  eventType?: string; // 🎯 NEW: Specific event (hyrox, spartan, marathon, etc.)
  fitnessLevel: string;
  equipment: string[];
  muscles: string[];
  sessionMinutes?: number;
  limitations?: string[];
  frequencyDays?: string[];
  preferredTime?: string;
  recentExercises?: string[];
  progressionLevel?: number;
  workoutStyle?: WorkoutStyle; // 🎨 NEW: Advanced workout style (EMOM, AMRAP, etc.)
}

export interface WorkoutPlanItem {
  exercise: Exercise;
  sets?: number;
  reps?: string;
  distance?: string;
  time?: string;
  rest?: number;
  reason?: string;
  section: 'warmup' | 'main' | 'cooldown';
}

export interface GeneratedWorkout {
  exercises: Exercise[];
  plan: WorkoutPlanItem[];
  periodization?: PeriodizationState;
  workoutStyle?: WorkoutStyle; // 🎨 NEW: Applied workout style
}

// 6. Progression: avoid repeating recent exercises, increase difficulty over time
// Accept an optional recentExercises array and a progressionLevel (number of previous workouts)
// 6. Progression: avoid repeating recent exercises, increase difficulty over time
// Accept an optional recentExercises array and a progressionLevel (number of previous workouts)
// (You can pass these from user history in the future)

export function useGenerateWorkout(
  params: WorkoutGenerationParams & {
    exerciseLibrary?: Exercise[];
  }
): GeneratedWorkout {
  // Helper: get sets/reps for an exercise
  type Prescription = {
    sets?: number;
    reps?: string;
    distance?: string;
    time?: string;
    rest?: number;
  };

  // 🎯 DURATION PRECISION: Calculate time per exercise
  function estimateExerciseDuration(prescription: Prescription): number {
    // Time-based exercises (cardio, stretches)
    if (prescription.time) {
      const match = prescription.time.match(/(\d+)/);
      const avgMinutes = match ? parseInt(match[0], 10) : 4;
      return avgMinutes * 60; // Convert to seconds
    }

    // Distance-based exercises (row, run, ski)
    if (prescription.distance) {
      const match = prescription.distance.match(/(\d+)/);
      const meters = match ? parseInt(match[0], 10) : 500;
      // Rough estimates: 500m = ~2min, 800m = ~3min
      const estimatedMinutes = meters / 250;
      return estimatedMinutes * 60; // Convert to seconds
    }

    // Sets/reps exercises
    if (prescription.sets && prescription.reps) {
      const sets = prescription.sets;
      const rest = prescription.rest || 60;

      // Estimate work time per set (rep tempo: ~3 seconds per rep)
      const repsMatch = prescription.reps.match(/(\d+)/);
      const avgReps = repsMatch ? parseInt(repsMatch[0], 10) : 10;
      const workTimePerSet = avgReps * 3; // 3 seconds per rep

      // Total = (work time + rest) * sets - last rest
      const totalSeconds = (workTimePerSet + rest) * sets - rest;
      return totalSeconds;
    }

    return 180; // Default 3 minutes
  }

  // 🎯 GOAL-SPECIFIC TEMPLATES: Evidence-based workout structures
  const goalTemplates = useMemo(() => ({
    strength: {
      // 5x5 or 5x3 for compound lifts, lower reps/higher rest
      sets: 5,
      reps: '4-8',
      rest: 120, // Longer rest for strength
      focusCompound: true, // Prioritize compound movements
      cardioRatio: 0.1, // Minimal cardio
    },
    muscle: {
      // Classic hypertrophy: 3-4 sets, 8-12 reps, moderate rest
      sets: 4,
      reps: '8-12',
      rest: 75,
      focusCompound: false, // Mix of compound and isolation
      cardioRatio: 0.15,
    },
    endurance: {
      // High reps, short rest, circuit-style
      sets: 2,
      reps: '15-25',
      rest: 45,
      focusCompound: false,
      cardioRatio: 0.4, // More cardio emphasis
    },
    weight: {
      // Fat loss: moderate volume, higher reps, short rest
      sets: 3,
      reps: '12-20',
      rest: 60,
      focusCompound: false,
      cardioRatio: 0.3, // Significant cardio component
    },
    wellness: {
      // General fitness: balanced approach
      sets: 3,
      reps: '10-15',
      rest: 60,
      focusCompound: false,
      cardioRatio: 0.25,
    },
    event: {
      // Event-specific: work capacity focused
      sets: 3,
      reps: '8-15',
      rest: 75,
      focusCompound: true,
      cardioRatio: 0.3,
    },
  }), []);

  // 🎯 PROGRESSIVE OVERLOAD with PERIODIZATION: Apply progression based on workout history and macro/micro cycles
  function applyProgressiveOverload(prescription: Prescription, progressionLevel: number): Prescription {
    if (progressionLevel === 0) return prescription; // First workout

    // Calculate periodization state
    const periodizationState = PeriodizationService.calculatePeriodizationState(
      progressionLevel,
      params.goal
    );

    // Apply periodization multipliers to prescription
    const periodized = PeriodizationService.applyPeriodization(
      prescription.sets ?? 3,
      prescription.reps ?? '8-12',
      prescription.rest ?? 60,
      periodizationState
    );

    prescription.sets = periodized.sets;
    prescription.reps = periodized.reps;
    prescription.rest = periodized.rest;

    // Additional progressive overload on top of periodization (for non-deload weeks)
    if (!periodizationState.isDeloadWeek) {
      const phase = progressionLevel % 3; // 0, 1, 2

      // Strategy based on phase
      if (phase === 0) {
        // Week 1 of cycle: Increase volume (add 1 set)
        if (prescription.sets) {
          prescription.sets = Math.min(6, prescription.sets + 1);
        }
      } else if (phase === 1) {
        // Week 2 of cycle: Increase intensity (reduce reps, imply heavier weight)
        if (prescription.reps && prescription.reps.includes('-')) {
          const [low, high] = prescription.reps.split('-').map(Number);
          prescription.reps = `${Math.max(3, low - 2)}-${Math.max(5, high - 2)}`;
        }
      } else {
        // Week 3 of cycle: Reduce rest periods (increase density)
        if (prescription.rest) {
          prescription.rest = Math.max(30, prescription.rest - 10);
        }
      }
    }

    return prescription;
  }

  function getSetsReps(ex: Exercise, goal: string, level: string): Prescription {
    // Cardio/endurance: prescribe distance or time, not sets/reps
    const isCardio = (ex.category && ['cardio', 'endurance'].includes(ex.category.toLowerCase())) ||
      (ex.tags && (ex.tags.includes('cardio') || ex.tags.includes('endurance')));
    if (isCardio) {
      if (ex.name.toLowerCase().includes('row') || ex.name.toLowerCase().includes('ski') || ex.name.toLowerCase().includes('bike') || ex.name.toLowerCase().includes('run')) {
        // 🎯 PROGRESSIVE OVERLOAD: Increase cardio distance over time
        const baseDistance = 400 + (params.progressionLevel ?? 0) * 50;
        const maxDistance = Math.min(1000, baseDistance);
        return { distance: `${maxDistance}m`, rest: 60 };
      }
      return { time: '3-5 min', rest: 45 };
    }

    // 🎯 GOAL TEMPLATES: Use goal-specific templates as base
    const normalizedGoal = goal?.toLowerCase() ?? '';
    let template = goalTemplates.wellness; // Default

    if (normalizedGoal.includes('strength')) template = goalTemplates.strength;
    else if (normalizedGoal.includes('muscle')) template = goalTemplates.muscle;
    else if (normalizedGoal.includes('endurance')) template = goalTemplates.endurance;
    else if (normalizedGoal.includes('weight') || normalizedGoal.includes('loss')) template = goalTemplates.weight;
    else if (normalizedGoal.includes('event')) template = goalTemplates.event;

    // Start with template values
    let sets = template.sets;
    let reps = template.reps;
    let rest = template.rest;

    // Apply exercise-specific overrides if they exist
    if (ex.recommended_sets) sets = ex.recommended_sets;
    if (ex.recommended_reps) reps = ex.recommended_reps;

    // 🎯 EXPERIENCE LEVEL ADJUSTMENTS
    const normalizedLevel = level?.toLowerCase();
    if (normalizedLevel === 'beginner') {
      sets = Math.max(2, sets - 1);
      rest = Math.max(45, rest - 15);
    }
    if (normalizedLevel === 'advanced' || normalizedLevel === 'athlete') {
      sets = sets + 1;
      rest = rest + 15;
    }

    let prescription: Prescription = { sets, reps, rest };

    // 🎯 PROGRESSIVE OVERLOAD: Apply progression
    prescription = applyProgressiveOverload(prescription, params.progressionLevel ?? 0);

    return prescription;
  }

  // 🎯 EVENT-SPECIFIC CONFIGURATION
  const eventConfig = useMemo(() => {
    if (!params.eventType || params.goal !== 'event') return null;

    const configs: Record<string, {
      priorityMovements: string[];
      priorityTags: string[];
      focusAreas: MuscleGroup[];
      cardioRatio: number;
      strengthRatio: number;
      workCapacityFocus: boolean;
      recommendedDuration?: number;
    }> = {
      hyrox: {
        priorityMovements: ['row', 'ski', 'sled', 'sandbag', 'wall ball', 'burpee', 'lunge'],
        priorityTags: ['hyrox', 'functional', 'conditioning', 'rowing', 'sled'],
        focusAreas: ['back', 'quadriceps', 'shoulders', 'hamstrings'],
        cardioRatio: 0.4,
        strengthRatio: 0.6,
        workCapacityFocus: true,
        recommendedDuration: 50
      },
      spartan: {
        priorityMovements: ['pull', 'rope', 'carry', 'climb', 'run', 'burpee', 'lunge', 'farmer'],
        priorityTags: ['obstacle', 'grip', 'pull', 'carry', 'functional'],
        focusAreas: ['back', 'forearms', 'abs', 'quadriceps', 'shoulders'],
        cardioRatio: 0.5,
        strengthRatio: 0.5,
        workCapacityFocus: true,
        recommendedDuration: 45
      },
      marathon: {
        priorityMovements: ['run', 'jog', 'sprint', 'lunge', 'step'],
        priorityTags: ['cardio', 'endurance', 'running', 'legs'],
        focusAreas: ['quadriceps', 'hamstrings', 'calves', 'glutes', 'abs'],
        cardioRatio: 0.7,
        strengthRatio: 0.3,
        workCapacityFocus: false,
        recommendedDuration: 60
      },
      triathlon: {
        priorityMovements: ['swim', 'bike', 'run', 'row', 'plank'],
        priorityTags: ['cardio', 'endurance', 'swimming', 'cycling', 'running'],
        focusAreas: ['back', 'shoulders', 'quadriceps', 'hamstrings', 'abs'],
        cardioRatio: 0.8,
        strengthRatio: 0.2,
        workCapacityFocus: false,
        recommendedDuration: 60
      },
      crossfit: {
        priorityMovements: ['snatch', 'clean', 'jerk', 'thruster', 'pull-up', 'box', 'burpee', 'row'],
        priorityTags: ['olympic', 'crossfit', 'wod', 'functional', 'barbell'],
        focusAreas: ['back', 'shoulders', 'quadriceps', 'glutes', 'abs'],
        cardioRatio: 0.3,
        strengthRatio: 0.7,
        workCapacityFocus: true,
        recommendedDuration: 45
      }
    };

    return configs[params.eventType.toLowerCase()] || null;
  }, [params.eventType, params.goal]);

  const kneeSensitiveNames = ['jump', 'plyo', 'box', 'burpee', 'lunge', 'step-up'];
  const backSensitiveNames = ['deadlift', 'good morning', 'good-morning', 'snatch', 'clean', 'goodmorning'];
  const shoulderSensitiveNames = ['overhead', 'snatch', 'jerk', 'press'];

  function hasSensitiveName(ex: Exercise, patterns: string[]): boolean {
    const lower = ex.name.toLowerCase();
    return patterns.some((pattern) => lower.includes(pattern));
  }

  function hasSensitiveTag(ex: Exercise, patterns: string[]): boolean {
    const tags = (ex.tags ?? []).map((tag) => tag.toLowerCase());
    return tags.some((tag) => patterns.some((pattern) => tag.includes(pattern)));
  }

  // 🎯 ENHANCED LIMITATION HANDLING: More comprehensive injury-safe filtering
  const limitationFilters: Record<string, (ex: Exercise) => boolean> = {
    knee: (ex) =>
      !hasSensitiveName(ex, kneeSensitiveNames) &&
      !hasSensitiveTag(ex, ['jump', 'plyometric', 'plyo', 'box', 'deep squat', 'sprint']) &&
      // Allow: seated exercises, upper body, gentle leg work
      (ex.category !== 'power' || !ex.primary_muscles?.some(m => ['quadriceps', 'hamstrings'].includes(m))),
    back: (ex) =>
      !hasSensitiveName(ex, backSensitiveNames) &&
      !hasSensitiveTag(ex, ['heavy hinge', 'hinge', 'barbell hinge', 'spinal loading']) &&
      // Allow: supported back exercises, avoid heavy spinal loading
      !ex.name.toLowerCase().includes('heavy'),
    shoulder: (ex) =>
      !hasSensitiveName(ex, shoulderSensitiveNames) &&
      !hasSensitiveTag(ex, ['overhead', 'press', 'handstand', 'dip']) &&
      // Allow: neutral grip, lateral raises, posterior delt work at light intensity
      (!ex.primary_muscles?.includes('shoulders') || ex.difficulty === 'beginner'),
    wrist: (ex) =>
      // Common wrist issues: push-ups, planks, heavy pressing
      !ex.name.toLowerCase().includes('push-up') &&
      !ex.name.toLowerCase().includes('plank') &&
      !ex.name.toLowerCase().includes('handstand') &&
      !hasSensitiveTag(ex, ['wrist-intensive', 'handstand']),
    ankle: (ex) =>
      // Ankle issues: jumping, running, calf raises
      !hasSensitiveName(ex, ['jump', 'hop', 'skip', 'run', 'sprint']) &&
      !ex.primary_muscles?.includes('calves') &&
      !hasSensitiveTag(ex, ['plyometric', 'plyo', 'agility']),
  };

  // 🎯 GENDER-SPECIFIC CONSIDERATIONS
  const genderAdjustments = useMemo(() => {
    const gender = params.gender?.toLowerCase();

    return {
      // Female athletes: typically excel at endurance, may need more upper body focus
      femaleConsiderations: gender === 'female' ? {
        upperBodyEmphasis: true, // Many women want upper body strength development
        coreEmphasis: true, // Pelvic floor and core strength important
        lowerBodyStrength: true, // Already strong, but focus on posterior chain balance
        safetyPriority: ['hip stability', 'knee tracking', 'pelvic floor'],
      } : null,

      // Male athletes: typically more upper body strength, may need leg/mobility work
      maleConsiderations: gender === 'male' ? {
        mobilityEmphasis: true, // Men often have less flexibility
        posteriorChain: true, // Emphasize hamstrings, glutes, back
        legDevelopment: true, // Many men skip leg day
        safetyPriority: ['shoulder health', 'lower back', 'hip flexibility'],
      } : null,
    };
  }, [params.gender]);

  // Helper: pick at least one exercise per selected muscle
  function pickExercisesForMuscles(exercises: Exercise[], muscles: Array<string | MuscleGroup>): Exercise[] {
    const picked: Exercise[] = [];
    const usedIds = new Set<string>();
    for (const muscle of muscles) {
      const found = exercises.find(
        (ex) =>
          (ex.primary_muscles || []).includes(muscle as MuscleGroup) ||
          (ex.secondary_muscles || []).includes(muscle as MuscleGroup)
      );
      if (found && !usedIds.has(found.id)) {
        picked.push(found);
        usedIds.add(found.id);
      }
    }
    return picked;
  }

  // 🎯 MUSCLE BALANCE: Categorize muscles as push/pull/legs
  const PUSH_MUSCLES: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
  const PULL_MUSCLES: MuscleGroup[] = ['back', 'biceps', 'forearms'];
  const LEG_MUSCLES: MuscleGroup[] = ['quadriceps', 'hamstrings', 'glutes', 'calves'];
  const CORE_MUSCLES: MuscleGroup[] = ['abs', 'obliques', 'lower_back'];

  function getMuscleCategory(muscles: MuscleGroup[]): 'push' | 'pull' | 'legs' | 'core' | 'mixed' {
    if (!muscles || muscles.length === 0) return 'mixed';

    const hasPush = muscles.some(m => PUSH_MUSCLES.includes(m));
    const hasPull = muscles.some(m => PULL_MUSCLES.includes(m));
    const hasLegs = muscles.some(m => LEG_MUSCLES.includes(m));
    const hasCore = muscles.some(m => CORE_MUSCLES.includes(m));

    const categories = [hasPush, hasPull, hasLegs, hasCore].filter(Boolean).length;

    if (categories > 1) return 'mixed';
    if (hasPush) return 'push';
    if (hasPull) return 'pull';
    if (hasLegs) return 'legs';
    if (hasCore) return 'core';
    return 'mixed';
  }

  function getBalanceScore(exercises: Exercise[]): { pushCount: number; pullCount: number; isBalanced: boolean } {
    // Count push/pull exercises
    const pushCount = exercises.filter(ex =>
      getMuscleCategory(ex.primary_muscles || []) === 'push'
    ).length;
    const pullCount = exercises.filter(ex =>
      getMuscleCategory(ex.primary_muscles || []) === 'pull'
    ).length;

    // Check if balanced (within 1.5:1 ratio)
    const ratio = pullCount > 0 ? pushCount / pullCount : pushCount;
    const isBalanced = ratio >= 0.67 && ratio <= 1.5;

    return { pushCount, pullCount, isBalanced };
  }

  // 🎯 MUSCLE BALANCE: Fill with variety while maintaining push/pull balance
  function fillWithVariety(
    pool: Exercise[],
    picked: Exercise[],
    count: number,
    disallow?: Set<string>
  ): Exercise[] {
    const usedIds = new Set(picked.map((e) => e.id));
    const result = [...picked];

    // Prioritize balance: alternate push/pull when possible
    const balance = getBalanceScore(result);
    const needsMorePull = balance.pushCount > balance.pullCount + 1;
    const needsMorePush = balance.pullCount > balance.pushCount + 1;

    // Sort pool to prioritize balancing exercises
    const sortedPool = [...pool].sort((a, b) => {
      const catA = getMuscleCategory(a.primary_muscles || []);
      const catB = getMuscleCategory(b.primary_muscles || []);

      if (needsMorePull && catA === 'pull' && catB !== 'pull') return -1;
      if (needsMorePull && catB === 'pull' && catA !== 'pull') return 1;
      if (needsMorePush && catA === 'push' && catB !== 'push') return -1;
      if (needsMorePush && catB === 'push' && catA !== 'push') return 1;

      return 0; // Keep original order
    });

    for (const ex of sortedPool) {
      if (disallow?.has(ex.id)) continue;
      if (!usedIds.has(ex.id)) {
        result.push(ex);
        usedIds.add(ex.id);
      }
      if (result.length >= count) break;
    }
    return result;
  }

  // Filter exercises
  const normalizedLimitations = useMemo(
    () => (params.limitations ?? []).filter((limitation) => limitation && limitation !== 'none'),
    [params.limitations]
  );
  const recentExerciseSet = useMemo(() => new Set(params.recentExercises ?? []), [params.recentExercises]);

  const filteredExercises = useMemo(() => {
    const source =
      params.exerciseLibrary && params.exerciseLibrary.length > 0 ? params.exerciseLibrary : exerciseLibrary;
    const normalizedGoal = params.goal?.toLowerCase() ?? '';
    const normalizedLevel = params.fitnessLevel?.toLowerCase() ?? '';
    const allowAllLevels = normalizedGoal.includes('endurance');

    const primaryFiltered = source.filter((ex) => {
      const equipmentMatch =
        params.equipment.length === 0 || ex.equipment.some((eq) => params.equipment.includes(eq));
      const levelMatch = allowAllLevels || !normalizedLevel || ex.difficulty === normalizedLevel;
      let goalMatch = true;
      if (params.goal) {
        const goal = params.goal.toLowerCase();
        if (goal.includes('weight')) {
          goalMatch = (ex.category && ['cardio', 'strength'].includes(ex.category.toLowerCase())) ||
            (ex.tags && (ex.tags.includes('cardio') || ex.tags.includes('strength')));
        }
        if (goal.includes('strength')) {
          goalMatch = (ex.category && ex.category.toLowerCase() === 'strength') ||
            (ex.tags && ex.tags.includes('strength'));
        }
        if (goal.includes('muscle')) {
          goalMatch = (ex.category && ex.category.toLowerCase() === 'strength') ||
            (ex.tags && ex.tags.includes('strength'));
        }
        if (goal.includes('endurance')) {
          goalMatch = (ex.category && ['cardio', 'endurance'].includes(ex.category.toLowerCase())) ||
            (ex.tags && (ex.tags.includes('cardio') || ex.tags.includes('endurance')));
        }
        if (goal.includes('event')) goalMatch = true;
      }
      const hasImage = !!ex.image_url;
      const passesLimitations =
        normalizedLimitations.length === 0 ||
        normalizedLimitations.every((limitation) => {
          const predicate = limitationFilters[limitation];
          return predicate ? predicate(ex) : true;
        });
      const notRecent = !recentExerciseSet.has(ex.id);

      return equipmentMatch && levelMatch && goalMatch && hasImage && passesLimitations && notRecent;
    });

    if (primaryFiltered.length > 0 || !allowAllLevels) {
      return primaryFiltered;
    }

    // Allow fallback to other levels when endurance filter yields nothing
    return source.filter((ex) => {
      const equipmentMatch =
        params.equipment.length === 0 || ex.equipment.some((eq) => params.equipment.includes(eq));
      const goalMatch =
        !params.goal ||
        ex.category?.toLowerCase() === 'cardio' ||
        ex.tags?.some((tag) => tag.toLowerCase().includes('cardio') || tag.toLowerCase().includes('endurance'));
      const passesLimitations =
        normalizedLimitations.length === 0 ||
        normalizedLimitations.every((limitation) => {
          const predicate = limitationFilters[limitation];
          return predicate ? predicate(ex) : true;
        });
      const notRecent = !recentExerciseSet.has(ex.id);
      const hasImage = !!ex.image_url;
      return equipmentMatch && goalMatch && passesLimitations && notRecent && hasImage;
    });
  }, [
    params.exerciseLibrary,
    params.equipment,
    params.fitnessLevel,
    params.goal,
    normalizedLimitations,
    recentExerciseSet,
  ]);

  // 🎯 Helper: Score exercises for event-specific priority
  const scoreExerciseForEvent = (ex: Exercise): number => {
    if (!eventConfig) return 0;

    let score = 0;
    const lowerName = ex.name.toLowerCase();
    const lowerTags = (ex.tags || []).map(t => t.toLowerCase());

    // Priority movements match (highest weight)
    if (eventConfig.priorityMovements.some(m => lowerName.includes(m))) {
      score += 10;
    }

    // Priority tags match
    if (lowerTags.some(tag => eventConfig.priorityTags.includes(tag))) {
      score += 5;
    }

    // Focus area muscles
    const primaryMuscles = ex.primary_muscles || [];
    const secondaryMuscles = ex.secondary_muscles || [];
    if (primaryMuscles.some(m => eventConfig.focusAreas.includes(m))) {
      score += 3;
    }
    if (secondaryMuscles.some(m => eventConfig.focusAreas.includes(m))) {
      score += 1;
    }

    return score;
  };

  // Main generator logic
  return useMemo(() => {
    if (!filteredExercises.length) {
      return {
        exercises: [],
        plan: [],
      };
    }

    // 🎯 EVENT-SPECIFIC DURATION: Use recommended duration if event training
    const sessionMinutes = eventConfig?.recommendedDuration ?? params.sessionMinutes ?? 30;
    const normalizedGoal = params.goal?.toLowerCase() ?? '';
    const normalizedLevel = params.fitnessLevel?.toLowerCase() ?? '';
    const trainingDays = params.frequencyDays?.length ?? 3;

    // 🎯 DURATION PRECISION: Time budget system
    // Reserve time for warmup (5 min) and cooldown (5 min)
    const warmupBudgetSeconds = 5 * 60;
    const cooldownBudgetSeconds = 5 * 60;
    const mainWorkBudgetSeconds = (sessionMinutes * 60) - warmupBudgetSeconds - cooldownBudgetSeconds;

    // 🎯 AGE-BASED ADJUSTMENTS
    const ageMultiplier = params.age >= 50 ? 0.8 : params.age >= 40 ? 0.9 : 1.0;

    // Initial estimate for exercise count (will be refined by time budget)
    let mainCount = Math.round(sessionMinutes / 10) + 1;
    mainCount = Math.max(3, Math.min(8, Math.floor(mainCount * ageMultiplier)));

    if (trainingDays >= 5) mainCount = Math.max(3, mainCount - 1);
    if (trainingDays <= 2) mainCount = Math.min(8, mainCount + 1);
    if (normalizedLevel === 'advanced' || normalizedLevel === 'athlete') {
      mainCount = Math.min(8, mainCount + 1);
    }
    if (normalizedGoal.includes('endurance')) {
      mainCount = Math.max(3, Math.round(sessionMinutes / 12));
    }

    // 🎯 EVENT-SPECIFIC: Adjust count based on work capacity focus
    if (eventConfig?.workCapacityFocus) {
      mainCount = Math.min(10, mainCount + 2); // More exercises for work capacity
    }

    const usedExerciseIds = new Set<string>(recentExerciseSet);

    const warmupCandidates = filteredExercises.filter(
      (ex) => ex.tags?.includes('warmup') || ex.tags?.includes('mobility') || ex.category?.toLowerCase() === 'mobility'
    );
    const cooldownCandidates = filteredExercises.filter(
      (ex) => ex.tags?.includes('cooldown') || ex.tags?.includes('stretch') || ex.category?.toLowerCase() === 'flexibility'
    );

    let mainPool = filteredExercises.filter(
      (ex) => !ex.tags?.includes('warmup') && !ex.tags?.includes('cooldown')
    );

    // 🎯 EVENT-SPECIFIC: Prioritize event-specific exercises
    if (eventConfig) {
      const eventPriority = mainPool.filter(ex => scoreExerciseForEvent(ex) > 0);
      const nonEventSpecific = mainPool.filter(ex => scoreExerciseForEvent(ex) === 0);

      // Sort event-specific exercises by score (highest first)
      eventPriority.sort((a, b) => scoreExerciseForEvent(b) - scoreExerciseForEvent(a));

      // Prioritize event exercises, then fill with variety
      mainPool = [...eventPriority, ...nonEventSpecific];
    } else if (normalizedGoal.includes('endurance')) {
      const cardioFirst = mainPool.filter(
        (ex) =>
          ex.category?.toLowerCase() === 'cardio' ||
          ex.tags?.some((tag) => tag.toLowerCase().includes('cardio') || tag.toLowerCase().includes('endurance'))
      );
      const strengthFallback = mainPool.filter((ex) => !cardioFirst.includes(ex));
      mainPool = [...cardioFirst, ...strengthFallback];
    }

    const fallbackWarmups = filteredExercises
      .filter((ex) => ex.category?.toLowerCase() === 'cardio' || ex.tags?.includes('dynamic'))
      .slice(0, 2);
    const fallbackCooldowns = filteredExercises
      .filter((ex) => ex.category?.toLowerCase() === 'flexibility' || ex.tags?.includes('stretch'))
      .slice(0, 2);

    const warmups = fillWithVariety(
      warmupCandidates.length ? warmupCandidates : fallbackWarmups,
      [],
      1,
      usedExerciseIds
    );
    warmups.forEach((ex) => usedExerciseIds.add(ex.id));

    const cooldowns = fillWithVariety(
      cooldownCandidates.length ? cooldownCandidates : fallbackCooldowns,
      [],
      1,
      usedExerciseIds
    );
    cooldowns.forEach((ex) => usedExerciseIds.add(ex.id));

    // 🎯 EVENT-SPECIFIC: Use event focus areas as target muscles
    let fallbackTargets: MuscleGroup[] = eventConfig?.focusAreas ?? ['chest', 'back', 'quadriceps', 'hamstrings', 'shoulders', 'glutes', 'abs'];

    // 🎯 GENDER-SPECIFIC: Adjust target muscle priorities
    if (genderAdjustments.femaleConsiderations) {
      // Females: prioritize upper body, glutes, core
      fallbackTargets = ['back', 'shoulders', 'chest', 'glutes', 'abs', 'quadriceps', 'triceps', 'biceps'];
    } else if (genderAdjustments.maleConsiderations) {
      // Males: ensure leg development, posterior chain, mobility
      fallbackTargets = ['quadriceps', 'hamstrings', 'back', 'glutes', 'chest', 'shoulders', 'abs', 'calves'];
    }

    const requestedMuscles = (params.muscles ?? []) as MuscleGroup[];
    const targetMuscles =
      requestedMuscles.length > 0
        ? requestedMuscles
        : fallbackTargets.slice(0, Math.min(mainCount, fallbackTargets.length));
    const distinctTargetMuscles = Array.from(new Set(targetMuscles));

    // Ensure at least one per target muscle
    const mainMuscleExercises = pickExercisesForMuscles(mainPool, distinctTargetMuscles);

    const uniqueMain: Exercise[] = [];
    const seenRoots = new Set<string>();
    for (const ex of mainMuscleExercises) {
      if (usedExerciseIds.has(ex.id)) continue;
      const root = ex.name.toLowerCase().replace(/(reverse|lateral|jump|tuck|split)\s*lunge/, 'lunge');
      if (!seenRoots.has(root)) {
        uniqueMain.push(ex);
        seenRoots.add(root);
        usedExerciseIds.add(ex.id);
      }
    }

    let mainExercises = fillWithVariety(
      mainPool.filter((ex) => !usedExerciseIds.has(ex.id)),
      [],
      Math.max(mainCount - uniqueMain.length, 0),
      usedExerciseIds
    );

    mainExercises = [...uniqueMain, ...mainExercises].slice(0, mainCount);

    if (mainExercises.length < mainCount) {
      const allEquipmentMatchPool = (params.exerciseLibrary && params.exerciseLibrary.length > 0
        ? params.exerciseLibrary
        : exerciseLibrary
      ).filter((ex) => {
        if (!ex?.id || !ex.image_url) return false;
        if (usedExerciseIds.has(ex.id)) return false;
        if (params.equipment.length > 0 && !ex.equipment.some((eq) => params.equipment.includes(eq))) {
          return false;
        }
        return true;
      });

      const extended = fillWithVariety(allEquipmentMatchPool, mainExercises, mainCount, usedExerciseIds);
      mainExercises = extended.slice(0, mainCount);
    }

    if (mainExercises.length < mainCount) {
      mainExercises = fillWithVariety(
        filteredExercises.filter((ex) => !usedExerciseIds.has(ex.id)),
        mainExercises,
        mainCount,
        usedExerciseIds
      ).slice(0, mainCount);
    }

    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

    const buildReason = (section: WorkoutPlanItem['section'], ex: Exercise, covered: MuscleGroup[]) => {
      const parts: string[] = [];
      if (section === 'warmup') parts.push('Prime your body for the main work');
      if (section === 'cooldown') parts.push('Ease into recovery and mobility');
      if (covered.length) parts.push(`Targets: ${covered.map(capitalize).join(', ')}`);
      if (normalizedGoal.includes('strength')) parts.push('Supports strength focus');
      if (normalizedGoal.includes('endurance')) parts.push('Builds stamina');
      return parts.join(' • ');
    };

    // 🎯 DURATION PRECISION: Refine exercise count to match time budget
    // Build prescriptions for all exercises first, then check total time
    const mainExercisesWithPrescriptions = mainExercises.map((ex) => {
      const prescription = getSetsReps(ex, params.goal, params.fitnessLevel);
      return { ex, prescription };
    });

    // Calculate cumulative time and trim if needed
    let cumulativeTime = 0;
    const timeBudgetedExercises: typeof mainExercisesWithPrescriptions = [];

    for (const item of mainExercisesWithPrescriptions) {
      const exerciseDuration = estimateExerciseDuration(item.prescription);

      // Check if adding this exercise would exceed budget (with 10% tolerance)
      if (cumulativeTime + exerciseDuration <= mainWorkBudgetSeconds * 1.1) {
        timeBudgetedExercises.push(item);
        cumulativeTime += exerciseDuration;
      } else if (timeBudgetedExercises.length < 3) {
        // Always include at least 3 exercises, even if slightly over time
        timeBudgetedExercises.push(item);
        cumulativeTime += exerciseDuration;
      } else {
        break; // Time budget exhausted
      }
    }

    // Build final plan with time-budgeted exercises
    const mainPlan = timeBudgetedExercises.map<WorkoutPlanItem>(({ ex, prescription }) => {
      usedExerciseIds.add(ex.id);
      const covered = distinctTargetMuscles.filter(
        (m) => (ex.primary_muscles || []).includes(m) || (ex.secondary_muscles || []).includes(m)
      );
      return {
        exercise: ex,
        sets: prescription.sets,
        reps: prescription.reps,
        distance: prescription.distance,
        time: prescription.time,
        rest: prescription.rest,
        reason: buildReason('main', ex, covered),
        section: 'main',
      };
    });

    const warmupPlan = warmups.map<WorkoutPlanItem>((ex) => {
      const prescription = getSetsReps(ex, params.goal, params.fitnessLevel);
      return {
        exercise: ex,
        sets: prescription.sets,
        reps: prescription.reps,
        distance: prescription.distance,
        time: prescription.time ?? '3-5 min',
        rest: prescription.rest ?? 30,
        reason: buildReason('warmup', ex, []),
        section: 'warmup',
      };
    });

    const cooldownPlan = cooldowns.map<WorkoutPlanItem>((ex) => {
      const prescription = getSetsReps(ex, params.goal, params.fitnessLevel);
      return {
        exercise: ex,
        sets: prescription.sets,
        reps: prescription.reps,
        distance: prescription.distance,
        time: prescription.time ?? '3-5 min',
        rest: prescription.rest ?? 30,
        reason: buildReason('cooldown', ex, []),
        section: 'cooldown',
      };
    });

    // Calculate periodization state
    const periodizationState = PeriodizationService.calculatePeriodizationState(
      params.progressionLevel ?? 0,
      params.goal
    );

    // 🎨 WORKOUT STYLE: Apply advanced training formats
    // Auto-select style if not provided, or use user's choice
    const workoutStyle = params.workoutStyle || WorkoutStyleService.selectOptimalStyle(
      params.goal,
      params.fitnessLevel,
      params.sessionMinutes
    );

    // Combine all workout sections
    let plan = [...warmupPlan, ...mainPlan, ...cooldownPlan];

    // Apply workout style to the plan (only affects main exercises)
    plan = WorkoutStyleService.applyStyleToPlan(plan, workoutStyle, params.goal);

    return {
      exercises: filteredExercises,
      plan,
      periodization: periodizationState,
      workoutStyle,
    };
  }, [
    filteredExercises,
    params.sessionMinutes,
    params.goal,
    params.eventType, // 🎯 NEW
    params.age, // 🎯 NEW
    params.fitnessLevel,
    params.frequencyDays,
    params.muscles,
    params.workoutStyle, // 🎨 NEW
    params.progressionLevel, // For periodization
    recentExerciseSet,
    eventConfig, // 🎯 NEW
  ]);
}
