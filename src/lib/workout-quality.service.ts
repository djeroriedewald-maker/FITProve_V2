import { Exercise, MuscleGroup } from '../types/exercise.types';
import { WorkoutPlanItem } from '../hooks/useGenerateWorkout';

export interface SupersetPair {
  exercise1: WorkoutPlanItem;
  exercise2: WorkoutPlanItem;
  type: 'antagonist' | 'same-muscle' | 'upper-lower';
  rationale: string;
}

export class WorkoutQualityService {
  // 🎯 EXERCISE ORDERING: Smart ordering for optimal performance
  static orderExercises(exercises: WorkoutPlanItem[]): WorkoutPlanItem[] {
    // Separate by section
    const warmup = exercises.filter(ex => ex.section === 'warmup');
    const main = exercises.filter(ex => ex.section === 'main');
    const cooldown = exercises.filter(ex => ex.section === 'cooldown');

    // Order main exercises by priority
    const orderedMain = this.orderMainExercises(main);

    return [...warmup, ...orderedMain, ...cooldown];
  }

  // 📊 MAIN EXERCISE ORDERING: Compound → Isolation, Large → Small
  private static orderMainExercises(exercises: WorkoutPlanItem[]): WorkoutPlanItem[] {
    return [...exercises].sort((a, b) => {
      // Priority 1: Exercise type (compound > isolation)
      const aCompound = this.isCompoundExercise(a.exercise);
      const bCompound = this.isCompoundExercise(b.exercise);
      if (aCompound && !bCompound) return -1;
      if (!aCompound && bCompound) return 1;

      // Priority 2: Muscle size (large > small)
      const aMuscleSize = this.getMuscleGroupSize(a.exercise.primary_muscles || []);
      const bMuscleSize = this.getMuscleGroupSize(b.exercise.primary_muscles || []);
      if (aMuscleSize > bMuscleSize) return -1;
      if (aMuscleSize < bMuscleSize) return 1;

      // Priority 3: Complexity (complex > simple)
      const aComplexity = this.getExerciseComplexity(a.exercise);
      const bComplexity = this.getExerciseComplexity(b.exercise);
      return bComplexity - aComplexity;
    });
  }

  // 🏋️ COMPOUND CHECK: Determine if exercise is compound or isolation
  private static isCompoundExercise(exercise: Exercise): boolean {
    // Compound exercises involve multiple joints/muscle groups
    const primaryCount = (exercise.primary_muscles || []).length;
    const secondaryCount = (exercise.secondary_muscles || []).length;
    const totalMuscles = primaryCount + secondaryCount;

    // If targets 3+ muscles, it's compound
    if (totalMuscles >= 3) return true;

    // Check for compound movement patterns
    const compoundKeywords = [
      'squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'chin-up',
      'lunge', 'clean', 'snatch', 'thruster', 'dip', 'push-up'
    ];

    const name = exercise.name.toLowerCase();
    return compoundKeywords.some(keyword => name.includes(keyword));
  }

  // 📏 MUSCLE SIZE: Larger muscles trained first
  private static getMuscleGroupSize(muscles: MuscleGroup[]): number {
    const muscleSizes: Record<string, number> = {
      // Large muscles (score 3)
      back: 3,
      quadriceps: 3,
      chest: 3,
      hamstrings: 3,
      glutes: 3,

      // Medium muscles (score 2)
      shoulders: 2,
      abs: 2,
      calves: 2,

      // Small muscles (score 1)
      biceps: 1,
      triceps: 1,
      forearms: 1,
      obliques: 1,
      lower_back: 1,
    };

    if (muscles.length === 0) return 0;

    // Return max muscle size in the group
    return Math.max(...muscles.map(m => muscleSizes[m] || 0));
  }

  // 🧠 COMPLEXITY: More complex exercises first (require more focus)
  private static getExerciseComplexity(exercise: Exercise): number {
    let complexity = 0;

    // Olympic lifts are most complex
    const olympicKeywords = ['clean', 'snatch', 'jerk'];
    if (olympicKeywords.some(k => exercise.name.toLowerCase().includes(k))) {
      complexity += 10;
    }

    // Barbell exercises more complex than dumbbells
    if (exercise.equipment?.includes('barbell')) complexity += 3;
    if (exercise.equipment?.includes('dumbbells')) complexity += 2;

    // Difficulty level
    if (exercise.difficulty === 'advanced') complexity += 3;
    if (exercise.difficulty === 'intermediate') complexity += 2;
    if (exercise.difficulty === 'beginner') complexity += 1;

    // Multiple muscle groups = more complex
    complexity += (exercise.primary_muscles?.length || 0) * 2;
    complexity += (exercise.secondary_muscles?.length || 0);

    return complexity;
  }

  // 🔗 SUPERSET SUGGESTIONS: Pair compatible exercises
  static suggestSupersets(exercises: WorkoutPlanItem[]): SupersetPair[] {
    const main = exercises.filter(ex => ex.section === 'main');
    const pairs: SupersetPair[] = [];

    // Find antagonist pairs (push/pull)
    for (let i = 0; i < main.length; i++) {
      for (let j = i + 1; j < main.length; j++) {
        const pair = this.createSuperset(main[i], main[j]);
        if (pair) {
          pairs.push(pair);
        }
      }
    }

    return pairs;
  }

  // 🤝 CREATE SUPERSET: Check if two exercises can be paired
  private static createSuperset(
    ex1: WorkoutPlanItem,
    ex2: WorkoutPlanItem
  ): SupersetPair | null {
    const muscles1 = ex1.exercise.primary_muscles || [];
    const muscles2 = ex2.exercise.primary_muscles || [];

    // Antagonist pairing (push + pull, quads + hamstrings)
    if (this.areAntagonists(muscles1, muscles2)) {
      return {
        exercise1: ex1,
        exercise2: ex2,
        type: 'antagonist',
        rationale: 'Antagonist pairing allows one muscle to rest while the other works, improving efficiency and blood flow.'
      };
    }

    // Upper/lower pairing (efficient for full body)
    if (this.isUpperLowerPair(muscles1, muscles2)) {
      return {
        exercise1: ex1,
        exercise2: ex2,
        type: 'upper-lower',
        rationale: 'Upper/lower pairing allows maximum recovery between sets while keeping heart rate elevated.'
      };
    }

    // Same muscle group pairing (for high volume)
    if (this.hasMuscleOverlap(muscles1, muscles2)) {
      return {
        exercise1: ex1,
        exercise2: ex2,
        type: 'same-muscle',
        rationale: 'Same muscle pairing intensifies training stimulus for maximum growth and metabolic stress.'
      };
    }

    return null;
  }

  // ⚖️ ANTAGONIST CHECK: Are muscles opposing?
  private static areAntagonists(muscles1: MuscleGroup[], muscles2: MuscleGroup[]): boolean {
    const antagonistPairs = [
      { a: 'chest', b: 'back' },
      { a: 'biceps', b: 'triceps' },
      { a: 'quadriceps', b: 'hamstrings' },
      { a: 'abs', b: 'lower_back' },
    ];

    return antagonistPairs.some(pair => {
      return (
        (muscles1.includes(pair.a as MuscleGroup) && muscles2.includes(pair.b as MuscleGroup)) ||
        (muscles1.includes(pair.b as MuscleGroup) && muscles2.includes(pair.a as MuscleGroup))
      );
    });
  }

  // 🔝⬇️ UPPER/LOWER CHECK
  private static isUpperLowerPair(muscles1: MuscleGroup[], muscles2: MuscleGroup[]): boolean {
    const upper: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms'];
    const lower: MuscleGroup[] = ['quadriceps', 'hamstrings', 'glutes', 'calves'];

    const isUpper1 = muscles1.some(m => upper.includes(m));
    const isLower1 = muscles1.some(m => lower.includes(m));
    const isUpper2 = muscles2.some(m => upper.includes(m));
    const isLower2 = muscles2.some(m => lower.includes(m));

    return (isUpper1 && isLower2) || (isLower1 && isUpper2);
  }

  // 🎯 MUSCLE OVERLAP CHECK
  private static hasMuscleOverlap(muscles1: MuscleGroup[], muscles2: MuscleGroup[]): boolean {
    return muscles1.some(m => muscles2.includes(m));
  }

  // ⏱️ REST PERIOD OPTIMIZATION: Calculate optimal rest based on exercise
  static getOptimalRest(exercise: Exercise, goal: string, currentRest?: number): number {
    if (currentRest) return currentRest; // Respect existing prescription

    const isCompound = this.isCompoundExercise(exercise);
    const normalizedGoal = goal?.toLowerCase() || '';

    // Compound exercises need more rest
    if (isCompound) {
      if (normalizedGoal.includes('strength')) return 180; // 3 min
      if (normalizedGoal.includes('muscle')) return 90; // 1.5 min
      return 120; // 2 min default
    }

    // Isolation exercises need less rest
    if (normalizedGoal.includes('strength')) return 120; // 2 min
    if (normalizedGoal.includes('endurance') || normalizedGoal.includes('weight')) return 45; // 45s
    return 60; // 1 min default
  }

  // 📝 EXERCISE NOTES: Generate helpful cues
  static generateExerciseNotes(exercise: Exercise): {
    formCues: string[];
    commonMistakes: string[];
    modifications: string[];
  } {
    const name = exercise.name.toLowerCase();

    return {
      formCues: this.getFormCues(name, exercise),
      commonMistakes: this.getCommonMistakes(name),
      modifications: this.getModifications(name, exercise),
    };
  }

  // 💡 FORM CUES: Movement-specific tips
  private static getFormCues(name: string, exercise: Exercise): string[] {
    const cues: string[] = [];

    // General cues for all exercises
    cues.push('Maintain tension throughout the entire range of motion');
    cues.push('Control the eccentric (lowering) phase');

    // Movement-specific cues
    if (name.includes('squat')) {
      cues.push('Keep chest up and core braced');
      cues.push('Push through heels, knees track over toes');
      cues.push('Reach depth before driving up');
    }

    if (name.includes('deadlift')) {
      cues.push('Hinge at hips, keep back neutral');
      cues.push('Bar stays close to shins/thighs');
      cues.push('Drive through floor with legs');
    }

    if (name.includes('bench') || name.includes('press')) {
      cues.push('Retract shoulder blades, create stable base');
      cues.push('Lower with control to chest/shoulders');
      cues.push('Press in a slight arc, not straight up');
    }

    if (name.includes('row')) {
      cues.push('Pull with elbows, not hands');
      cues.push('Squeeze shoulder blades together at top');
      cues.push('Avoid momentum, control the weight');
    }

    if (name.includes('curl')) {
      cues.push('Keep elbows stationary at sides');
      cues.push('Squeeze at the top, resist on the way down');
    }

    return cues.slice(0, 4); // Max 4 cues
  }

  // ⚠️ COMMON MISTAKES
  private static getCommonMistakes(name: string): string[] {
    const mistakes: string[] = [];

    if (name.includes('squat')) {
      mistakes.push('Letting knees cave inward');
      mistakes.push('Rising hips faster than chest');
      mistakes.push('Not reaching adequate depth');
    }

    if (name.includes('deadlift')) {
      mistakes.push('Rounding the back');
      mistakes.push('Starting with bar too far from shins');
      mistakes.push('Using arms to lift instead of legs');
    }

    if (name.includes('bench')) {
      mistakes.push('Bouncing bar off chest');
      mistakes.push('Flaring elbows too wide');
      mistakes.push('Arching back excessively');
    }

    if (name.includes('row')) {
      mistakes.push('Using momentum to swing weight');
      mistakes.push('Rounding the back');
      mistakes.push('Not fully contracting at top');
    }

    return mistakes.slice(0, 3); // Max 3 mistakes
  }

  // 🔧 MODIFICATIONS
  private static getModifications(name: string, exercise: Exercise): string[] {
    const mods: string[] = [];

    // Easier modifications
    if (exercise.difficulty === 'advanced' || exercise.difficulty === 'intermediate') {
      if (name.includes('push-up')) {
        mods.push('Easier: Knee push-ups or incline push-ups');
      }
      if (name.includes('pull-up') || name.includes('chin-up')) {
        mods.push('Easier: Band-assisted pull-ups or lat pulldowns');
      }
      if (name.includes('squat')) {
        mods.push('Easier: Box squats or goblet squats');
      }
      if (name.includes('plank')) {
        mods.push('Easier: Knee plank or hands on bench');
      }
    }

    // Harder modifications
    if (exercise.difficulty === 'beginner' || exercise.difficulty === 'intermediate') {
      if (name.includes('push-up')) {
        mods.push('Harder: Decline push-ups or diamond push-ups');
      }
      if (name.includes('plank')) {
        mods.push('Harder: Weighted plank or single-arm plank');
      }
      if (name.includes('lunge')) {
        mods.push('Harder: Jumping lunges or Bulgarian split squats');
      }
    }

    // Equipment alternatives
    if (exercise.equipment?.includes('barbell')) {
      mods.push('Alternative: Use dumbbells for more stability challenge');
    }
    if (exercise.equipment?.includes('dumbbells')) {
      mods.push('Alternative: Use kettlebells or resistance bands');
    }

    return mods.slice(0, 3); // Max 3 modifications
  }

  // 🎨 WORKOUT STRUCTURE: Circuit vs Straight Sets
  static determineWorkoutStructure(
    exercises: WorkoutPlanItem[],
    goal: string,
    duration: number
  ): 'straight-sets' | 'circuit' | 'superset' {
    const normalizedGoal = goal?.toLowerCase() || '';

    // Endurance/weight loss goals benefit from circuits
    if (normalizedGoal.includes('endurance') || normalizedGoal.includes('weight')) {
      return 'circuit';
    }

    // Strength goals need straight sets with long rest
    if (normalizedGoal.includes('strength')) {
      return 'straight-sets';
    }

    // Short workouts benefit from supersets
    if (duration <= 30) {
      return 'superset';
    }

    // Default to straight sets
    return 'straight-sets';
  }
}
