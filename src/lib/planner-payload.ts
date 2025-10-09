import { WorkoutPlanItem } from '../hooks/useGenerateWorkout';

type PlannerWorkoutSection = 'warmup' | 'main' | 'cooldown';

export interface PlannerScheduleExercise {
  name: string;
  section: PlannerWorkoutSection;
  sets?: number;
  reps?: string;
  distance?: string;
  time?: string;
  rest?: number;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
}

export interface PlannerSchedulePayload {
  name: string;
  description: string;
  duration: number;
  workoutType: string;
  tags: string[];
  muscles: string[];
  exercises: PlannerScheduleExercise[];
  meta: {
    generator: {
      goal: string;
      generatedAt: string;
      preferences: Record<string, unknown>;
      frequencyDays: string[];
      equipment: string[];
    };
  };
  suggestedDate?: string;
  suggestedTime?: string;
}

export interface ProgramSchedulingData {
  payload: PlannerSchedulePayload;
  scheduling: {
    type: 'multi-day-program';
    days: string[];
    weeks: number;
    startDate: string;
    recurring: boolean;
    preferredTime?: string;
  };
}

interface BuildPlannerPayloadInput {
  name: string;
  goal: string;
  preferences: Record<string, unknown>;
  frequencyDays: string[];
  equipment: string[];
  durationMinutes: number;
  plan: WorkoutPlanItem[];
  generatedAt: string;
  suggestedDate?: string;
  suggestedTime?: string;
}

const GOAL_TO_WORKOUT_TYPE: Record<string, string> = {
  strength: 'Strength',
  muscle: 'Strength',
  hypertrophy: 'Strength',
  endurance: 'Cardio',
  cardio: 'Cardio',
  conditioning: 'Hybrid',
  hybrid: 'Hybrid',
  mobility: 'Mobility',
  flexibility: 'Stretching',
};

function mapGoalToWorkoutType(goal: string): string {
  const normalized = goal.trim().toLowerCase();
  for (const key of Object.keys(GOAL_TO_WORKOUT_TYPE)) {
    if (normalized.includes(key)) {
      return GOAL_TO_WORKOUT_TYPE[key];
    }
  }
  return 'Hybrid';
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function buildPlannerSchedulePayload(input: BuildPlannerPayloadInput): PlannerSchedulePayload {
  const exercises = input.plan.map<PlannerScheduleExercise>((item) => ({
    name: item.exercise.name,
    section: item.section,
    sets: item.sets,
    reps: item.reps,
    distance: item.distance,
    time: item.time,
    rest: item.rest,
    primaryMuscles: item.exercise.primary_muscles || [],
    secondaryMuscles: item.exercise.secondary_muscles || [],
    equipment: item.exercise.equipment || [],
  }));

  const primaryMuscles = unique(
    exercises.flatMap((ex) => ex.primaryMuscles)
  );
  const secondaryMuscles = unique(
    exercises.flatMap((ex) => ex.secondaryMuscles)
  );
  const tags = unique([
    input.goal,
    ...primaryMuscles,
    ...secondaryMuscles,
    ...input.equipment,
  ]).filter(Boolean) as string[];

  const descriptionParts: string[] = [];
  if (input.goal) {
    descriptionParts.push(`Focus: ${input.goal}`);
  }
  if (primaryMuscles.length) {
    descriptionParts.push(`Targets ${primaryMuscles.join(', ')}`);
  }
  if (input.frequencyDays.length) {
    descriptionParts.push(`Schedule: ${input.frequencyDays.join(', ')}`);
  }
  const description = descriptionParts.join(' · ');

  return {
    name: input.name,
    description,
    duration: input.durationMinutes,
    workoutType: mapGoalToWorkoutType(input.goal),
    tags,
    muscles: primaryMuscles,
    exercises,
    meta: {
      generator: {
        goal: input.goal,
        generatedAt: input.generatedAt,
        preferences: input.preferences,
        frequencyDays: input.frequencyDays,
        equipment: input.equipment,
      },
    },
    suggestedDate: input.suggestedDate,
    suggestedTime: input.suggestedTime,
  };
}
