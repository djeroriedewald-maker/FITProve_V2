// Script to set default image for exercises with a specific incorrect image_url
// Usage: node fix_specific_image_url.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const TABLE_NAME = 'exercises';
const DEFAULT_IMAGE_URL = '/images/watch_youtube.webp';
const INCORRECT_IMAGE_URL = 'https://fitprove.nl/images/modules/workout.webp';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixSpecificImageUrl() {
  // Find all exercises with the incorrect image_url
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, image_url')
    .eq('image_url', INCORRECT_IMAGE_URL);

  if (error) {
    console.error('Error fetching exercises:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No exercises found with the incorrect image_url.');
    return;
  }

  for (const ex of data) {
    const { error: updateError } = await supabase
      .from(TABLE_NAME)
      .update({ image_url: DEFAULT_IMAGE_URL })
      .eq('id', ex.id);
    if (updateError) {
      console.error('Failed to update exercise id', ex.id, updateError.message);
    } else {
      console.log('Updated exercise id', ex.id, 'with default image');
    }
  }
  console.log('Specific image URL update complete.');
}

fixSpecificImageUrl();
