import { describe, it, expect } from 'vitest';
import { exerciseLibrary } from '../src/data/exerciseLibrary';

// Test: All exercises are accessible and have required fields

describe('Exercise Library Integrity', () => {
  it('should contain 1385 exercises', () => {
    expect(exerciseLibrary.length).toBe(1385);
  });

  it('should have no duplicate IDs', () => {
    const ids = exerciseLibrary.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have all required fields for each exercise', () => {
    for (const ex of exerciseLibrary) {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.instructions).toBeInstanceOf(Array);
      expect(ex.instructions.length).toBeGreaterThan(0);
      expect(ex.description).toBeTruthy();
    }
  });

  it('should be accessible by id and name', () => {
    for (const ex of exerciseLibrary) {
      const byId = exerciseLibrary.find(e => e.id === ex.id);
      const byName = exerciseLibrary.find(e => e.name === ex.name);
      expect(byId).toBeTruthy();
      expect(byName).toBeTruthy();
    }
  });
});
