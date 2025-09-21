// Script to set default image for exercises with invalid image_url
// Usage: node fix_invalid_exercise_images.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const TABLE_NAME = 'exercises';
const DEFAULT_IMAGE_URL = '/images/watch_youtube.webp';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function isInvalidImageUrl(url) {
  if (!url || url.trim() === '') return true;
  // Accept only URLs starting with /images/ or https://fitprove.nl/images/
  return !(
    url.startsWith('/images/') ||
    url.startsWith('https://fitprove.nl/images/')
  );
}

async function fixInvalidImages() {
  // Fetch all exercises
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, image_url');

  if (error) {
    console.error('Error fetching exercises:', error.message);
    process.exit(1);
  }

  let updated = 0;
  for (const ex of data) {
    if (isInvalidImageUrl(ex.image_url)) {
      const { error: updateError } = await supabase
        .from(TABLE_NAME)
        .update({ image_url: DEFAULT_IMAGE_URL })
        .eq('id', ex.id);
      if (updateError) {
        console.error('Failed to update exercise id', ex.id, updateError.message);
      } else {
        console.log('Updated exercise id', ex.id, 'with default image');
        updated++;
      }
    }
  }
  console.log(`Default image update complete. ${updated} exercises updated.`);
}

fixInvalidImages();
