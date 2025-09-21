// Script to update exercises with everkinetic images to use watch_youtube.webp
// Usage: Run with `node fix_everkinetic_images.js` (after placing in project root)
//
// This script assumes you have a JSON or JS file with all exercises, or you fetch them from Supabase.
// If you use Supabase, fill in your credentials and table name below.


require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// === CONFIGURATION ===
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '<YOUR_SUPABASE_URL>';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '<YOUR_SUPABASE_SERVICE_ROLE_KEY>';
const TABLE = 'exercises'; // Change if your table is named differently

// If you want to run this on a local file, set FILE_PATH to your JSON file
const FILE_PATH = null; // e.g. './data/exercises.json'
const REPLACEMENT_IMAGE = '/images/watch_youtube.webp';

function isEverkineticImage(url) {
  return typeof url === 'string' && url.startsWith('http://img.everkinetic.com/');
}

async function updateSupabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) throw error;
  let updated = 0;
  for (const ex of data) {
    if (isEverkineticImage(ex.image_url)) {
      const { error: updateError } = await supabase
        .from(TABLE)
        .update({ image_url: REPLACEMENT_IMAGE })
        .eq('id', ex.id);
      if (updateError) {
        console.error('Failed to update', ex.id, updateError);
      } else {
        updated++;
        console.log('Updated', ex.id);
      }
    }
  }
  console.log(`Done. Updated ${updated} exercises.`);
}

async function updateLocalFile() {
  const fs = require('fs');
  const exercises = JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
  let updated = 0;
  for (const ex of exercises) {
    if (isEverkineticImage(ex.image_url)) {
      ex.image_url = REPLACEMENT_IMAGE;
      updated++;
    }
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(exercises, null, 2));
  console.log(`Done. Updated ${updated} exercises in file.`);
}

(async () => {
  if (FILE_PATH) {
    await updateLocalFile();
  } else {
    await updateSupabase();
  }
})();
