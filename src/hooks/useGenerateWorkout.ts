import { useMemo } from 'react';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { Exercise, MuscleGroup } from '../types/exercise.types';

export interface WorkoutGenerationParams {
  gender: string;
  age: number;
  goal: string;
  fitnessLevel: string;
  equipment: string[];
  muscles: string[];
  sessionMinutes?: number;
  limitations?: string[];
  frequencyDays?: string[];
  preferredTime?: string;
  recentExercises?: string[];
  progressionLevel?: number;
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

  function getSetsReps(ex: Exercise, goal: string, level: string): Prescription {
    // Cardio/endurance: prescribe distance or time, not sets/reps
    const isCardio = (ex.category && ['cardio', 'endurance'].includes(ex.category.toLowerCase())) ||
      (ex.tags && (ex.tags.includes('cardio') || ex.tags.includes('endurance')));
    if (isCardio) {
      if (ex.name.toLowerCase().includes('row') || ex.name.toLowerCase().includes('ski') || ex.name.toLowerCase().includes('bike') || ex.name.toLowerCase().includes('run')) {
        return { distance: '400-800m', rest: 60 };
      }
      return { time: '3-5 min', rest: 45 };
    }
    // Strength/bodyweight: prescribe sets/reps
    let sets = ex.recommended_sets || 3;
    let reps = ex.recommended_reps || '8-12';
    let rest = 60;
    if (goal?.toLowerCase().includes('endurance')) {
      sets = 2;
      reps = '15-25';
      rest = 45;
    } else if (goal?.toLowerCase().includes('strength')) {
      sets = 5;
      reps = '4-8';
      rest = 90;
    } else if (goal?.toLowerCase().includes('muscle')) {
      sets = 4;
      reps = '8-15';
      rest = 75;
    } else if (goal?.toLowerCase().includes('weight')) {
      sets = 3;
      reps = '12-20';
      rest = 60;
    }
    const normalizedLevel = level?.toLowerCase();
    if (normalizedLevel === 'beginner') {
      sets = Math.max(2, sets - 1);
      rest = Math.max(45, rest - 15);
    }
    if (normalizedLevel === 'advanced' || normalizedLevel === 'athlete') {
      sets = sets + 1;
      rest = rest + 15;
    }
    return { sets, reps, rest };
  }

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

  const limitationFilters: Record<string, (ex: Exercise) => boolean> = {
    knee: (ex) =>
      !hasSensitiveName(ex, kneeSensitiveNames) &&
      !hasSensitiveTag(ex, ['jump', 'plyometric', 'plyo', 'box', 'deep squat']),
    back: (ex) =>
      !hasSensitiveName(ex, backSensitiveNames) &&
      !hasSensitiveTag(ex, ['heavy hinge', 'hinge', 'barbell hinge']),
    shoulder: (ex) =>
      !hasSensitiveName(ex, shoulderSensitiveNames) &&
      !hasSensitiveTag(ex, ['overhead', 'press']),
  };

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

  // Helper: fill with variety
  function fillWithVariety(
    pool: Exercise[],
    picked: Exercise[],
    count: number,
    disallow?: Set<string>
  ): Exercise[] {
    const usedIds = new Set(picked.map((e) => e.id));
    const result = [...picked];
    for (const ex of pool) {
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

  // Main generator logic
  return useMemo(() => {
    if (!filteredExercises.length) {
      return {
        exercises: [],
        plan: [],
      };
    }

    const sessionMinutes = params.sessionMinutes ?? 30;
    const normalizedGoal = params.goal?.toLowerCase() ?? '';
    const normalizedLevel = params.fitnessLevel?.toLowerCase() ?? '';
    const trainingDays = params.frequencyDays?.length ?? 3;
    let mainCount = Math.round(sessionMinutes / 10) + 1;
    mainCount = Math.max(3, Math.min(8, mainCount));
    if (trainingDays >= 5) mainCount = Math.max(3, mainCount - 1);
    if (trainingDays <= 2) mainCount = Math.min(8, mainCount + 1);
    if (normalizedLevel === 'advanced' || normalizedLevel === 'athlete') {
      mainCount = Math.min(8, mainCount + 1);
    }
    if (normalizedGoal.includes('endurance')) {
      mainCount = Math.max(3, Math.round(sessionMinutes / 12));
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

    if (normalizedGoal.includes('endurance')) {
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

    const fallbackTargets: MuscleGroup[] = ['chest', 'back', 'quadriceps', 'hamstrings', 'shoulders', 'glutes', 'abs'];
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

    const mainPlan = mainExercises.map<WorkoutPlanItem>((ex) => {
      usedExerciseIds.add(ex.id);
      const covered = distinctTargetMuscles.filter(
        (m) => (ex.primary_muscles || []).includes(m) || (ex.secondary_muscles || []).includes(m)
      );
      const prescription = getSetsReps(ex, params.goal, params.fitnessLevel);
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

    const plan = [...warmupPlan, ...mainPlan, ...cooldownPlan];

    return {
      exercises: filteredExercises,
      plan,
    };
  }, [
    filteredExercises,
    params.sessionMinutes,
    params.goal,
    params.fitnessLevel,
    params.frequencyDays,
    params.muscles,
    recentExerciseSet,
  ]);
}
