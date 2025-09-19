import fs from 'fs';
import path from 'path';
// import { ExerciseImportData } from '../../src/types/exercise.types';

/**
 * Combineer ExerciseDB, Everkinetic en open source datasets tot één array ExerciseImportData[]
 * - Zet alle relevante velden om
 * - Filter duplicaten
 * - Sla op als JSON voor bulk import
 */

// TODO: Zet hier de paden naar de gedownloade bronbestanden
const EXERCISEDB_PATH = './exercisedb.json';
const EVERKINETIC_PATH = './everkinetic.json';
const OPENSOURCE_PATH = './open-exercise-db.json';

function normalizeExerciseDB(raw) {
  // Voorbeeld mapping voor ExerciseDB
  return raw.map((ex: any) => ({
    name: ex.name,
    description: ex.instructions?.join(' ') || '',
    instructions: ex.instructions || [],
    muscle_groups: [ex.bodyPart, ...(ex.target ? [ex.target] : [])],
    equipment: [ex.equipment],
    difficulty: 'beginner', // ExerciseDB heeft geen difficulty, default
    category: ex.bodyPart,
    youtube_search: ex.name,
    tips: [],
    variations: [],
    // Media
    gif_url: ex.gifUrl,
    image_url: ex.image || ex.gifUrl,
  }));
}

function normalizeEverkinetic(raw) {
  // Voorbeeld mapping voor Everkinetic
    return raw.map((ex) => {
      // Zet muscle_groups om naar primary_muscles en secondary_muscles
      const allMuscles = [ex.primary, ...(ex.secondary || [])].filter(Boolean);
      const primary_muscles = allMuscles.length > 0 ? [allMuscles[0]] : [];
      const secondary_muscles = allMuscles.length > 1 ? allMuscles.slice(1) : [];
      const equipment = ex.equipment || [];
      const name = ex.title || ex.name;
      return {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        description: ex.primer || ex.description || '',
        instructions: ex.steps || [],
        primary_muscles,
        secondary_muscles,
        equipment,
        difficulty: ex.difficulty || 'beginner',
        image_url: (ex.images && ex.images.length > 0) ? ex.images[0] : undefined,
        tips: ex.tips || [],
        variations: ex.variations || [],
        tags: [name.toLowerCase(), ...primary_muscles, ...secondary_muscles, ...equipment].filter(Boolean),
        // approval_status, created_by worden door backend toegevoegd
      };
    });
}

function normalizeOpenSource(raw) {
  // Mapping voor open source JSON/CSV
  return raw.map((ex: any) => ({
    name: ex.name,
    description: ex.description || '',
    instructions: ex.instructions || [],
    muscle_groups: ex.muscle_groups || [],
    equipment: ex.equipment || [],
    difficulty: ex.difficulty || 'beginner',
    category: ex.category,
    youtube_search: ex.name,
    tips: ex.tips || [],
    variations: ex.variations || [],
    image_url: ex.image_url,
    gif_url: ex.gif_url,
  }));
}

function deduplicate(exercises) {
  const seen = new Set<string>();
  return exercises.filter((ex) => {
    const key = `${ex.name.toLowerCase()}|${(ex.muscle_groups||[]).join(',')}|${(ex.equipment||[]).join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function main() {
  // Laad alleen Everkinetic data
  const everkinetic = fs.existsSync(EVERKINETIC_PATH) ? JSON.parse(fs.readFileSync(EVERKINETIC_PATH, 'utf8')) : [];

  // Normaliseer alleen Everkinetic
  const normalized = normalizeEverkinetic(everkinetic);

  // Sla op als JSON
  fs.writeFileSync('./combined-exercises.json', JSON.stringify(normalized, null, 2));
  console.log('✅ Everkinetic oefeningen opgeslagen als combined-exercises.json');
}

main();
