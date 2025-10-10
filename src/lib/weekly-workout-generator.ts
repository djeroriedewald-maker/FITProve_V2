import { WorkoutGenerationParams, WorkoutPlanItem } from '../hooks/useGenerateWorkout';
import { MuscleGroup } from '../types/exercise.types';

export interface DailyWorkout {
  dayName: string;
  dayNumber: number; // 1-7 (Mon-Sun)
  focus: string; // "Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Rest"
  targetMuscles: MuscleGroup[];
  description: string;
  estimatedDuration: number; // minutes
}

export interface WeeklyProgram {
  programName: string;
  description: string;
  splitType: 'push-pull-legs' | 'upper-lower' | 'full-body' | 'bro-split' | 'single';
  workouts: DailyWorkout[];
  totalWorkouts: number;
  restDays: number;
  weeklyVolume: number; // estimated total minutes
}

export function generateWeeklyProgram(params: WorkoutGenerationParams): WeeklyProgram {
  const days = params.frequencyDays?.length ?? 3;
  const sessionMinutes = params.sessionMinutes ?? 45;

  // Determine split type based on frequency
  let splitType: WeeklyProgram['splitType'] = 'full-body';
  if (days === 1) splitType = 'single';
  else if (days === 2 || days === 3) splitType = 'full-body';
  else if (days === 4) splitType = 'upper-lower';
  else if (days === 5) splitType = 'bro-split';
  else if (days >= 6) splitType = 'push-pull-legs';

  // Generate workouts based on split type
  switch (splitType) {
    case 'push-pull-legs':
      return generatePushPullLegs(params);
    case 'upper-lower':
      return generateUpperLower(params);
    case 'full-body':
      return generateFullBody(params);
    case 'bro-split':
      return generateBroSplit(params);
    case 'single':
      return generateSingleWorkout(params);
    default:
      return generateFullBody(params);
  }
}

function generatePushPullLegs(params: WorkoutGenerationParams): WeeklyProgram {
  const days = params.frequencyDays ?? [];
  const workoutDays = days.slice(0, 6); // Max 6 workout days
  const sessionMinutes = params.sessionMinutes ?? 45;

  const splits: Array<{ focus: string; muscles: MuscleGroup[]; desc: string }> = [
    { focus: 'Push', muscles: ['chest', 'shoulders', 'triceps'], desc: 'Chest, Shoulders & Triceps' },
    { focus: 'Pull', muscles: ['back', 'biceps', 'forearms'], desc: 'Back & Biceps' },
    { focus: 'Legs', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'], desc: 'Quads, Hamstrings & Glutes' },
    { focus: 'Push', muscles: ['chest', 'shoulders', 'triceps'], desc: 'Chest, Shoulders & Triceps (Volume)' },
    { focus: 'Pull', muscles: ['back', 'biceps', 'forearms'], desc: 'Back & Biceps (Volume)' },
    { focus: 'Legs', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'], desc: 'Quads, Hamstrings & Glutes (Volume)' },
  ];

  const workouts: DailyWorkout[] = workoutDays.map((dayName, idx) => {
    const split = splits[idx];
    const dayNumber = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName) + 1;

    return {
      dayName,
      dayNumber,
      focus: split.focus,
      targetMuscles: split.muscles,
      description: split.desc,
      estimatedDuration: sessionMinutes,
    };
  });

  return {
    programName: 'Push/Pull/Legs Split',
    description: 'Classic 6-day hypertrophy program targeting all muscle groups twice per week with optimal recovery',
    splitType: 'push-pull-legs',
    workouts,
    totalWorkouts: workouts.length,
    restDays: 7 - workouts.length,
    weeklyVolume: workouts.length * sessionMinutes,
  };
}

function generateUpperLower(params: WorkoutGenerationParams): WeeklyProgram {
  const days = params.frequencyDays ?? [];
  const workoutDays = days.slice(0, 4);
  const sessionMinutes = params.sessionMinutes ?? 60;

  const splits: Array<{ focus: string; muscles: MuscleGroup[]; desc: string }> = [
    { focus: 'Upper', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], desc: 'Upper Body Strength' },
    { focus: 'Lower', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'], desc: 'Lower Body Power' },
    { focus: 'Upper', muscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], desc: 'Upper Body Hypertrophy' },
    { focus: 'Lower', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'], desc: 'Lower Body Conditioning' },
  ];

  const workouts: DailyWorkout[] = workoutDays.map((dayName, idx) => {
    const split = splits[idx];
    const dayNumber = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName) + 1;

    return {
      dayName,
      dayNumber,
      focus: split.focus,
      targetMuscles: split.muscles,
      description: split.desc,
      estimatedDuration: sessionMinutes,
    };
  });

  return {
    programName: 'Upper/Lower Split',
    description: '4-day balanced program alternating upper and lower body for maximum strength and hypertrophy',
    splitType: 'upper-lower',
    workouts,
    totalWorkouts: workouts.length,
    restDays: 7 - workouts.length,
    weeklyVolume: workouts.length * sessionMinutes,
  };
}

function generateFullBody(params: WorkoutGenerationParams): WeeklyProgram {
  const days = params.frequencyDays ?? [];
  const workoutDays = days.slice(0, 3);
  const sessionMinutes = params.sessionMinutes ?? 45;

  const fullBodyMuscles: MuscleGroup[] = ['chest', 'back', 'quadriceps', 'hamstrings', 'shoulders', 'abs'];

  const focuses = ['Strength Focus', 'Hypertrophy Focus', 'Conditioning Focus'];

  const workouts: DailyWorkout[] = workoutDays.map((dayName, idx) => {
    const dayNumber = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName) + 1;

    return {
      dayName,
      dayNumber,
      focus: 'Full Body',
      targetMuscles: fullBodyMuscles,
      description: focuses[idx] ?? 'Full Body Training',
      estimatedDuration: sessionMinutes,
    };
  });

  return {
    programName: 'Full Body Routine',
    description: '2-3x per week full body training for balanced development, perfect for beginners and time-efficient training',
    splitType: 'full-body',
    workouts,
    totalWorkouts: workouts.length,
    restDays: 7 - workouts.length,
    weeklyVolume: workouts.length * sessionMinutes,
  };
}

function generateBroSplit(params: WorkoutGenerationParams): WeeklyProgram {
  const days = params.frequencyDays ?? [];
  const workoutDays = days.slice(0, 5);
  const sessionMinutes = params.sessionMinutes ?? 60;

  const splits: Array<{ focus: string; muscles: MuscleGroup[]; desc: string }> = [
    { focus: 'Chest', muscles: ['chest', 'triceps'], desc: 'Chest & Triceps Day' },
    { focus: 'Back', muscles: ['back', 'biceps'], desc: 'Back & Biceps Day' },
    { focus: 'Legs', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves'], desc: 'Leg Day' },
    { focus: 'Shoulders', muscles: ['shoulders', 'abs'], desc: 'Shoulders & Abs' },
    { focus: 'Arms', muscles: ['biceps', 'triceps', 'forearms'], desc: 'Arms & Forearms' },
  ];

  const workouts: DailyWorkout[] = workoutDays.map((dayName, idx) => {
    const split = splits[idx];
    const dayNumber = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName) + 1;

    return {
      dayName,
      dayNumber,
      focus: split.focus,
      targetMuscles: split.muscles,
      description: split.desc,
      estimatedDuration: sessionMinutes,
    };
  });

  return {
    programName: 'Bro Split',
    description: '5-day muscle group isolation for maximum volume per body part, ideal for bodybuilding',
    splitType: 'bro-split',
    workouts,
    totalWorkouts: workouts.length,
    restDays: 7 - workouts.length,
    weeklyVolume: workouts.length * sessionMinutes,
  };
}

function generateSingleWorkout(params: WorkoutGenerationParams): WeeklyProgram {
  const dayName = params.frequencyDays?.[0] ?? 'Single Workout';
  const dayNumber = dayName ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName) + 1 : 1;
  const sessionMinutes = params.sessionMinutes ?? 30;

  return {
    programName: 'Single Workout',
    description: 'One-time workout based on your preferences, perfect for on-demand training',
    splitType: 'single',
    workouts: [{
      dayName,
      dayNumber: dayNumber || 1,
      focus: 'Full Body',
      targetMuscles: (params.muscles as MuscleGroup[]) ?? ['chest', 'back', 'quadriceps', 'shoulders'],
      description: 'Complete workout session',
      estimatedDuration: sessionMinutes,
    }],
    totalWorkouts: 1,
    restDays: 6,
    weeklyVolume: sessionMinutes,
  };
}
