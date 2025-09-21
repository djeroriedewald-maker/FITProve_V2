// Script to import exercises from JSON to Supabase
// Usage: node import_exercises_to_supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');


const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const TABLE_NAME = 'exercises';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Allow file path as argument
const filePath = process.argv[2] || path.join(__dirname, 'Downloads', 'exercises_Outdoor_bodyweight_250.json');

async function importExercises() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error('Failed to read or parse JSON:', err);
    process.exit(1);
  }

  let imported = 0;
  for (const exercise of data) {
    delete exercise.id;
    if (typeof exercise.environment === 'string') {
      exercise.environment = [exercise.environment];
    }
    // Upsert by slug if available, else by name
    const match = exercise.slug ? { slug: exercise.slug } : { name: exercise.name };
    const { error } = await supabase.from(TABLE_NAME).upsert(exercise, { onConflict: Object.keys(match).join(',') });
    if (error) {
      console.error('Error upserting exercise:', exercise.name, error.message);
    } else {
      imported++;
      console.log('Upserted:', exercise.name);
    }
  }
  console.log(`Import complete. Upserted ${imported} exercises.`);
}

importExercises();
