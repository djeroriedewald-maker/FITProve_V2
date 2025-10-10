import { Exercise, MuscleGroup } from '../types/exercise.types';

export interface ExerciseHistory {
  exerciseId: string;
  exerciseName: string;
  lastUsed: Date;
  usageCount: number;
}

export class ExerciseVarietyService {
  // 🎯 VARIETY TRACKING: Prevent repeating exercises
  static getRecentExerciseIds(history: ExerciseHistory[], windowSize: number = 3): string[] {
    // Sort by last used (most recent first)
    const sorted = [...history].sort((a, b) =>
      new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    );

    // Get IDs from last N workouts
    return sorted.slice(0, windowSize).map(h => h.exerciseId);
  }

  // 🔄 SUBSTITUTION: Find alternative exercises
  static findAlternativeExercises(
    currentExercise: Exercise,
    exerciseLibrary: Exercise[],
    count: number = 3
  ): Exercise[] {
    const alternatives: Exercise[] = [];

    // Score each exercise based on similarity to current exercise
    const scoredExercises = exerciseLibrary
      .filter(ex => ex.id !== currentExercise.id) // Exclude current exercise
      .map(ex => ({
        exercise: ex,
        score: this.calculateSimilarityScore(currentExercise, ex),
      }))
      .filter(item => item.score > 0) // Only include exercises with some similarity
      .sort((a, b) => b.score - a.score); // Sort by score (highest first)

    // Return top N alternatives
    return scoredExercises.slice(0, count).map(item => item.exercise);
  }

  // 📊 SIMILARITY SCORING: Calculate how similar two exercises are
  private static calculateSimilarityScore(exercise1: Exercise, exercise2: Exercise): number {
    let score = 0;

    // Same primary muscles (+10 points)
    const primaryOverlap = this.countOverlap(
      exercise1.primary_muscles || [],
      exercise2.primary_muscles || []
    );
    score += primaryOverlap * 10;

    // Same secondary muscles (+5 points)
    const secondaryOverlap = this.countOverlap(
      exercise1.secondary_muscles || [],
      exercise2.secondary_muscles || []
    );
    score += secondaryOverlap * 5;

    // Same equipment (+8 points)
    const equipmentOverlap = this.countOverlap(
      exercise1.equipment || [],
      exercise2.equipment || []
    );
    score += equipmentOverlap * 8;

    // Same category (+7 points)
    if (exercise1.category === exercise2.category) {
      score += 7;
    }

    // Same difficulty (+3 points)
    if (exercise1.difficulty === exercise2.difficulty) {
      score += 3;
    }

    // Same tags (+2 points per match)
    const tagOverlap = this.countOverlap(
      exercise1.tags || [],
      exercise2.tags || []
    );
    score += tagOverlap * 2;

    return score;
  }

  // 🔢 HELPER: Count overlapping elements in two arrays
  private static countOverlap<T>(arr1: T[], arr2: T[]): number {
    return arr1.filter(item => arr2.includes(item)).length;
  }

  // 📈 DIFFICULTY SCALING: Find easier/harder variations
  static findDifficultyVariations(
    exercise: Exercise,
    exerciseLibrary: Exercise[],
    direction: 'easier' | 'harder'
  ): Exercise[] {
    const targetDifficulty = this.getNextDifficulty(exercise.difficulty, direction);
    if (!targetDifficulty) return [];

    // Find similar exercises with target difficulty
    const alternatives = this.findAlternativeExercises(exercise, exerciseLibrary, 10);

    return alternatives
      .filter(ex => ex.difficulty === targetDifficulty)
      .slice(0, 3);
  }

  // 🎚️ HELPER: Get next difficulty level
  private static getNextDifficulty(
    current: 'beginner' | 'intermediate' | 'advanced' | undefined,
    direction: 'easier' | 'harder'
  ): 'beginner' | 'intermediate' | 'advanced' | null {
    const levels: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
    const currentIndex = current ? levels.indexOf(current) : 1; // Default to intermediate

    if (direction === 'easier') {
      return currentIndex > 0 ? levels[currentIndex - 1] : null;
    } else {
      return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
    }
  }

  // 🔄 SWAP EXERCISE: Replace one exercise with best alternative
  static swapExercise(
    currentExercise: Exercise,
    exerciseLibrary: Exercise[],
    recentExerciseIds: string[] = []
  ): Exercise | null {
    // Find alternatives
    const alternatives = this.findAlternativeExercises(currentExercise, exerciseLibrary, 10);

    // Filter out recent exercises
    const freshAlternatives = alternatives.filter(
      ex => !recentExerciseIds.includes(ex.id)
    );

    // Return best fresh alternative (or first alternative if all are recent)
    return freshAlternatives[0] || alternatives[0] || null;
  }

  // 🎲 RANDOM SWAP: Get a random alternative for variety
  static getRandomAlternative(
    currentExercise: Exercise,
    exerciseLibrary: Exercise[],
    recentExerciseIds: string[] = []
  ): Exercise | null {
    const alternatives = this.findAlternativeExercises(currentExercise, exerciseLibrary, 10);

    // Filter out recent exercises
    const freshAlternatives = alternatives.filter(
      ex => !recentExerciseIds.includes(ex.id)
    );

    if (freshAlternatives.length === 0) {
      return alternatives.length > 0 ? alternatives[0] : null;
    }

    // Return random alternative
    const randomIndex = Math.floor(Math.random() * freshAlternatives.length);
    return freshAlternatives[randomIndex];
  }

  // 📋 CATEGORIZE ALTERNATIVES: Group by type for better UX
  static categorizeAlternatives(
    currentExercise: Exercise,
    exerciseLibrary: Exercise[]
  ): {
    sameEquipment: Exercise[];
    differentEquipment: Exercise[];
    easier: Exercise[];
    harder: Exercise[];
  } {
    const all = this.findAlternativeExercises(currentExercise, exerciseLibrary, 20);

    return {
      sameEquipment: all.filter(ex =>
        ex.equipment?.some(eq => currentExercise.equipment?.includes(eq))
      ).slice(0, 5),
      differentEquipment: all.filter(ex =>
        !ex.equipment?.some(eq => currentExercise.equipment?.includes(eq))
      ).slice(0, 5),
      easier: this.findDifficultyVariations(currentExercise, exerciseLibrary, 'easier'),
      harder: this.findDifficultyVariations(currentExercise, exerciseLibrary, 'harder'),
    };
  }

  // 💾 STORAGE: Save exercise history (localStorage)
  static saveExerciseHistory(userId: string, history: ExerciseHistory[]): void {
    try {
      localStorage.setItem(`exercise-history-${userId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save exercise history:', error);
    }
  }

  // 📖 STORAGE: Load exercise history (localStorage)
  static loadExerciseHistory(userId: string): ExerciseHistory[] {
    try {
      const stored = localStorage.getItem(`exercise-history-${userId}`);
      if (!stored) return [];

      const history = JSON.parse(stored) as ExerciseHistory[];
      // Convert date strings back to Date objects
      return history.map(h => ({
        ...h,
        lastUsed: new Date(h.lastUsed),
      }));
    } catch (error) {
      console.error('Failed to load exercise history:', error);
      return [];
    }
  }

  // ➕ STORAGE: Add exercises to history
  static addToHistory(
    userId: string,
    exercises: Exercise[]
  ): void {
    const history = this.loadExerciseHistory(userId);
    const now = new Date();

    exercises.forEach(exercise => {
      const existing = history.find(h => h.exerciseId === exercise.id);

      if (existing) {
        // Update existing entry
        existing.lastUsed = now;
        existing.usageCount += 1;
      } else {
        // Add new entry
        history.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          lastUsed: now,
          usageCount: 1,
        });
      }
    });

    // Keep only last 100 entries (performance optimization)
    const trimmed = history
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 100);

    this.saveExerciseHistory(userId, trimmed);
  }

  // 🧹 STORAGE: Clear old history (older than 90 days)
  static cleanOldHistory(userId: string, daysToKeep: number = 90): void {
    const history = this.loadExerciseHistory(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filtered = history.filter(h => new Date(h.lastUsed) >= cutoffDate);
    this.saveExerciseHistory(userId, filtered);
  }
}
