import { useMemo } from 'react';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { Exercise } from '../types/exercise.types';

export interface WorkoutGenerationParams {
  gender: string;
  age: number;
  goal: string;
  fitnessLevel: string;
  equipment: string[];
  muscles: string[];
}

export interface GeneratedWorkout {
  exercises: Exercise[];
  plan: Array<{
    exercise: Exercise;
    sets: number;
    reps: string;
  }>;
}

/**
 * useGenerateWorkout
 * Generates a workout plan based on user selections.
 */
export function useGenerateWorkout(params: WorkoutGenerationParams): GeneratedWorkout {
  // Filtering logic can be expanded for more advanced matching
  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter((ex) => {
      // Equipment match (at least one)
      const equipmentMatch =
        params.equipment.length === 0 || ex.equipment.some((eq) => params.equipment.includes(eq));
      // Muscle match (at least one primary or secondary)
      const muscleMatch =
        params.muscles.length === 0 ||
        ex.primary_muscles.some((m) => params.muscles.includes(m)) ||
        ex.secondary_muscles.some((m) => params.muscles.includes(m));
      // Fitness level/difficulty
      const levelMatch =
        !params.fitnessLevel || ex.difficulty === params.fitnessLevel.toLowerCase();
      // Goal (basic: can be expanded)
      let goalMatch = true;
      if (params.goal) {
        if (params.goal === 'Lose weight')
          goalMatch = ex.category === 'cardio' || ex.category === 'strength';
        if (params.goal === 'Gain strength') goalMatch = ex.category === 'strength';
        if (params.goal === 'Gain muscle') goalMatch = ex.category === 'strength';
        if (params.goal === 'Prep for event') goalMatch = true; // fallback
      }
      return equipmentMatch && muscleMatch && levelMatch && goalMatch;
    });
  }, [params]);

  // Generate plan (basic: 5-8 exercises, sets/reps from exercise data)
  const plan = useMemo(() => {
    const selected = filteredExercises.slice(0, 6); // Pick first 6 for now
    return selected.map((ex) => ({
      exercise: ex,
      sets: ex.recommended_sets || 3,
      reps: ex.recommended_reps || '8-12',
    }));
  }, [filteredExercises]);

  return { exercises: filteredExercises, plan };
}
