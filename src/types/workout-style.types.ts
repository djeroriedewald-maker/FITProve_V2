/**
 * Advanced Workout Styles
 * Defines workout formats beyond traditional straight sets
 */

export type WorkoutStyle =
  | 'traditional'     // Standard sets × reps
  | 'emom'            // Every Minute On the Minute
  | 'amrap'           // As Many Rounds/Reps As Possible
  | 'tabata'          // 20s work / 10s rest × 8 rounds
  | 'circuit'         // Move through exercises with minimal rest
  | 'superset'        // Paired exercises (agonist/antagonist or same muscle)
  | 'drop-set'        // Reduce weight and continue to failure
  | 'pyramid'         // Ascending/descending reps or weight
  | 'cluster'         // Mini-sets with short intra-set rest
  | 'ladder'          // Progressive rep increases/decreases
  | 'complex'         // Multiple exercises with same equipment (barbell complex)
  | 'for-time';       // Complete prescribed work as fast as possible

export interface WorkoutStyleConfig {
  style: WorkoutStyle;
  name: string;
  emoji: string;
  description: string;

  // Goals this style is ideal for
  idealForGoals: string[];

  // Difficulty level (beginner, intermediate, advanced)
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Time efficiency (1-5, higher = more work in less time)
  timeEfficiency: number;

  // Intensity level (1-5, higher = more intense)
  intensityLevel: number;

  // Style-specific parameters
  parameters?: {
    // EMOM
    minutesTotal?: number;          // Total duration
    workSecondsPerMinute?: number;  // Work time in each minute (rest = remaining)

    // AMRAP
    durationMinutes?: number;       // Time cap
    targetRounds?: number;          // Optional round target

    // Tabata
    workSeconds?: number;           // Work interval (default 20)
    restSeconds?: number;           // Rest interval (default 10)
    rounds?: number;                // Total rounds (default 8)

    // Circuit
    exerciseCount?: number;         // Exercises in circuit
    roundsTotal?: number;           // Total circuits
    restBetweenExercises?: number;  // Transition time
    restBetweenRounds?: number;     // Rest between full circuits

    // Superset
    pairType?: 'push-pull' | 'upper-lower' | 'agonist-antagonist' | 'same-muscle';
    restBetweenPairs?: number;

    // Drop Set
    dropPercentage?: number;        // Weight reduction % (typically 20-30%)
    dropsPerSet?: number;           // Number of drops (1-3)

    // Pyramid
    pyramidType?: 'ascending' | 'descending' | 'full';
    repScheme?: number[];           // [6, 8, 10, 12, 10, 8, 6]

    // Ladder
    startReps?: number;
    endReps?: number;
    increment?: number;

    // Complex
    exercisesInComplex?: number;    // Exercises without putting equipment down
    complexRounds?: number;
  };
}

// Exercise prescription with style-specific info
export interface StyledExercisePrescription {
  sets?: number;
  reps?: string;
  distance?: string;
  time?: string;
  rest?: number;

  // Style-specific overrides
  styleInstructions?: string;      // "10 reps EMOM", "Max reps in 20s", etc.
  position?: number;               // Position in circuit/complex/superset
  pairedWith?: string;             // Exercise ID for supersets
  dropWeights?: number[];          // Weight progression for drop sets
  tempo?: string;                  // "3-0-1-0" notation
}

// Goal-to-style recommendations
export const GOAL_STYLE_RECOMMENDATIONS: Record<string, WorkoutStyle[]> = {
  strength: ['traditional', 'cluster', 'pyramid', 'ladder'],
  muscle: ['traditional', 'superset', 'drop-set', 'pyramid'],
  endurance: ['circuit', 'amrap', 'emom', 'tabata'],
  'weight-loss': ['circuit', 'tabata', 'amrap', 'emom'],
  event: ['circuit', 'emom', 'for-time', 'amrap'],
  wellness: ['traditional', 'circuit', 'ladder'],
};

// Workout style configurations
export const WORKOUT_STYLE_CONFIGS: Record<WorkoutStyle, WorkoutStyleConfig> = {
  traditional: {
    style: 'traditional',
    name: 'Traditional Sets',
    emoji: '💪',
    description: 'Classic sets × reps with rest between sets',
    idealForGoals: ['strength', 'muscle', 'wellness'],
    difficulty: 'beginner',
    timeEfficiency: 3,
    intensityLevel: 3,
  },

  emom: {
    style: 'emom',
    name: 'EMOM',
    emoji: '⏱️',
    description: 'Every Minute On the Minute - start each minute with prescribed work',
    idealForGoals: ['endurance', 'event', 'weight-loss'],
    difficulty: 'intermediate',
    timeEfficiency: 5,
    intensityLevel: 4,
    parameters: {
      minutesTotal: 12,
      workSecondsPerMinute: 40,
    },
  },

  amrap: {
    style: 'amrap',
    name: 'AMRAP',
    emoji: '🔥',
    description: 'As Many Rounds/Reps As Possible within time cap',
    idealForGoals: ['endurance', 'weight-loss', 'event'],
    difficulty: 'intermediate',
    timeEfficiency: 5,
    intensityLevel: 5,
    parameters: {
      durationMinutes: 12,
      targetRounds: 5,
    },
  },

  tabata: {
    style: 'tabata',
    name: 'Tabata',
    emoji: '⚡',
    description: '20 seconds work / 10 seconds rest × 8 rounds = 4 minutes',
    idealForGoals: ['weight-loss', 'endurance', 'event'],
    difficulty: 'advanced',
    timeEfficiency: 5,
    intensityLevel: 5,
    parameters: {
      workSeconds: 20,
      restSeconds: 10,
      rounds: 8,
    },
  },

  circuit: {
    style: 'circuit',
    name: 'Circuit Training',
    emoji: '🔄',
    description: 'Move through exercises with minimal rest between',
    idealForGoals: ['weight-loss', 'endurance', 'event', 'wellness'],
    difficulty: 'beginner',
    timeEfficiency: 4,
    intensityLevel: 4,
    parameters: {
      exerciseCount: 6,
      roundsTotal: 3,
      restBetweenExercises: 10,
      restBetweenRounds: 90,
    },
  },

  superset: {
    style: 'superset',
    name: 'Supersets',
    emoji: '⚡',
    description: 'Paired exercises performed back-to-back with no rest',
    idealForGoals: ['muscle', 'weight-loss', 'endurance'],
    difficulty: 'intermediate',
    timeEfficiency: 4,
    intensityLevel: 4,
    parameters: {
      pairType: 'push-pull',
      restBetweenPairs: 60,
    },
  },

  'drop-set': {
    style: 'drop-set',
    name: 'Drop Sets',
    emoji: '📉',
    description: 'Work to failure, reduce weight, continue immediately',
    idealForGoals: ['muscle', 'strength'],
    difficulty: 'advanced',
    timeEfficiency: 4,
    intensityLevel: 5,
    parameters: {
      dropPercentage: 25,
      dropsPerSet: 2,
    },
  },

  pyramid: {
    style: 'pyramid',
    name: 'Pyramid Sets',
    emoji: '🔺',
    description: 'Ascending/descending reps or weight',
    idealForGoals: ['strength', 'muscle'],
    difficulty: 'intermediate',
    timeEfficiency: 3,
    intensityLevel: 4,
    parameters: {
      pyramidType: 'ascending',
      repScheme: [6, 8, 10, 12],
    },
  },

  cluster: {
    style: 'cluster',
    name: 'Cluster Sets',
    emoji: '🎯',
    description: 'Mini-sets with short intra-set rest for strength',
    idealForGoals: ['strength'],
    difficulty: 'advanced',
    timeEfficiency: 2,
    intensityLevel: 5,
    parameters: {
      // Example: 5 sets of (3 reps + 20s rest + 3 reps)
    },
  },

  ladder: {
    style: 'ladder',
    name: 'Ladder',
    emoji: '🪜',
    description: 'Progressive rep increases/decreases',
    idealForGoals: ['endurance', 'strength', 'wellness'],
    difficulty: 'beginner',
    timeEfficiency: 3,
    intensityLevel: 3,
    parameters: {
      startReps: 1,
      endReps: 10,
      increment: 1,
    },
  },

  complex: {
    style: 'complex',
    name: 'Complexes',
    emoji: '🏋️',
    description: 'Multiple exercises without putting equipment down',
    idealForGoals: ['event', 'endurance', 'weight-loss'],
    difficulty: 'advanced',
    timeEfficiency: 5,
    intensityLevel: 4,
    parameters: {
      exercisesInComplex: 5,
      complexRounds: 4,
    },
  },

  'for-time': {
    style: 'for-time',
    name: 'For Time',
    emoji: '⏳',
    description: 'Complete prescribed work as fast as possible',
    idealForGoals: ['event', 'endurance', 'weight-loss'],
    difficulty: 'intermediate',
    timeEfficiency: 4,
    intensityLevel: 5,
    parameters: {
      // Example: 21-15-9 reps of thrusters and pull-ups
    },
  },
};

// Helper to get recommended styles for a goal
export function getRecommendedStyles(goal: string): WorkoutStyle[] {
  return GOAL_STYLE_RECOMMENDATIONS[goal] || GOAL_STYLE_RECOMMENDATIONS.wellness;
}

// Helper to get style config
export function getStyleConfig(style: WorkoutStyle): WorkoutStyleConfig {
  return WORKOUT_STYLE_CONFIGS[style];
}

// Helper to determine if style requires special exercise pairing
export function requiresPairing(style: WorkoutStyle): boolean {
  return ['superset', 'circuit', 'complex'].includes(style);
}

// Helper to get style instructions for display
export function getStyleInstructions(style: WorkoutStyle, params?: any): string {
  const config = WORKOUT_STYLE_CONFIGS[style];

  switch (style) {
    case 'emom':
      return `Every Minute for ${params?.minutesTotal || 12} minutes: Complete prescribed reps, rest remaining time`;

    case 'amrap':
      return `${params?.durationMinutes || 12} minutes: As Many Rounds As Possible`;

    case 'tabata':
      return `${params?.rounds || 8} rounds: ${params?.workSeconds || 20}s work / ${params?.restSeconds || 10}s rest`;

    case 'circuit':
      return `${params?.roundsTotal || 3} rounds: Move through exercises with ${params?.restBetweenExercises || 10}s transitions`;

    case 'superset':
      return `Perform paired exercises back-to-back, then rest ${params?.restBetweenPairs || 60}s`;

    case 'drop-set':
      return `Work to failure, drop ${params?.dropPercentage || 25}% weight, continue ${params?.dropsPerSet || 2} times`;

    case 'pyramid':
      return `${params?.pyramidType || 'Ascending'} pyramid: ${params?.repScheme?.join('-') || '6-8-10-12'}`;

    case 'ladder':
      return `Ladder from ${params?.startReps || 1} to ${params?.endReps || 10} reps`;

    case 'complex':
      return `${params?.exercisesInComplex || 5} exercises without putting equipment down, ${params?.complexRounds || 4} rounds`;

    case 'for-time':
      return `Complete all prescribed work as fast as possible`;

    default:
      return config.description;
  }
}
