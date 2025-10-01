import { describe, it, expect } from 'vitest';
import { ExerciseService } from './src/lib/exercise.service';

// Integration test: fetch all exercises from Supabase (with pagination) and check integrity

async function fetchAllExercises(pageSize = 1000) {
  let allExercises = [];
  let page = 1;
  let total = null;
  while (true) {
    const { exercises, total_count } = await ExerciseService.getExercises({ page, pageSize });
    if (total === null) total = total_count;
    allExercises = allExercises.concat(exercises);
    if (allExercises.length >= total) break;
    page++;
  }
  return { allExercises, total };
}

describe('Supabase Exercise Library Integrity', () => {
  it('should fetch all 1385 exercises and validate required fields', async () => {
    const { allExercises, total } = await fetchAllExercises();
    expect(total).toBeGreaterThanOrEqual(1385);
    expect(allExercises.length).toBeGreaterThanOrEqual(1385);

    // Check for duplicate IDs
    const ids = allExercises.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    // Check required fields, log missing descriptions
    const missingDescriptions = allExercises.filter(ex => !ex.description || ex.description.trim() === '');
    if (missingDescriptions.length > 0) {
      // eslint-disable-next-line no-console
      console.error('Exercises missing description:', missingDescriptions.map(ex => ({ id: ex.id, name: ex.name })));
    }
    for (const ex of allExercises) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(Array.isArray(ex.instructions)).toBe(true);
      expect(ex.instructions.length).toBeGreaterThan(0);
      expect(ex.description).toBeTruthy();
    }
  }, 60000); // 60s timeout for large fetch
});
