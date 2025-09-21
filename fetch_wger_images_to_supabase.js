


// Script to fetch images from ExerciseDB API and upload to Supabase Storage for each exercise
// Usage: node fetch_wger_images_to_supabase.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const sharp = require('sharp');
const fs = require('fs');
const { distance } = require('fastest-levenshtein');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = 'exercise-images';
const TABLE = 'exercises';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ExerciseDB API info
const EXERCISEDB_API_URL = 'https://exercisedb.p.rapidapi.com/exercises';
const EXERCISEDB_API_KEY = process.env.EXERCISEDB_API_KEY || '';
const EXERCISEDB_API_HOST = 'exercisedb.p.rapidapi.com';

async function getAllExercises() {
  const { data, error } = await supabase.from(TABLE).select('id, name, slug');
  if (error) throw error;
  return data;
}

async function fetchExerciseDbList() {
  const res = await fetch(EXERCISEDB_API_URL, {
    headers: {
      'X-RapidAPI-Key': EXERCISEDB_API_KEY,
      'X-RapidAPI-Host': EXERCISEDB_API_HOST,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch ExerciseDB list');
  return res.json();
}

function findBestMatch(exName, dbList) {
  // Fuzzy match using Levenshtein distance
  const lower = exName.toLowerCase();
  let best = null;
  let bestDist = Infinity;
  for (const e of dbList) {
    const d = distance(lower, e.name.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = e;
    }
  }
  // Only accept if reasonably close (tune threshold as needed)
  if (bestDist <= 6) return best;
  // fallback to partial match if no close fuzzy match
  let match = dbList.find(e => lower.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(lower));
  return match;
}

async function downloadAndConvertToWebp(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download image');
  const buffer = await res.buffer();
  return sharp(buffer).webp().toBuffer();
}

async function uploadToSupabaseStorage(slug, webpBuffer) {
  const filePath = `${slug}.webp`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, webpBuffer, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (error) throw error;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
}

async function updateExerciseImageUrl(id, imageUrl) {
  const { error } = await supabase.from(TABLE).update({ image_url: imageUrl }).eq('id', id);
  if (error) throw error;
}

(async () => {
  const exercises = await getAllExercises();
  const dbList = await fetchExerciseDbList();
  // Output your exercise names and ExerciseDB names for comparison
  const yourNames = exercises.map(e => e.name);
  const dbNames = dbList.map(e => e.name);
  fs.writeFileSync('exercise_name_comparison.txt',
    'Your Exercise Names:\n' + yourNames.join('\n') + '\n\nExerciseDB Names:\n' + dbNames.join('\n')
  );
  console.log('Wrote exercise_name_comparison.txt for manual mapping.');

  for (const ex of exercises) {
    try {
      const match = findBestMatch(ex.name, dbList);
      if (!match || !match.gifUrl) {
        console.log('No ExerciseDB image for', ex.name);
        continue;
      }
      const webpBuffer = await downloadAndConvertToWebp(match.gifUrl);
      const publicUrl = await uploadToSupabaseStorage(ex.slug || ex.id, webpBuffer);
      await updateExerciseImageUrl(ex.id, publicUrl);
      console.log('Updated', ex.name, '->', publicUrl);
    } catch (err) {
      console.error('Error for', ex.name, err.message);
    }
  }
  console.log('Done.');
})();
