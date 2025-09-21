require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const csvPath = path.join(__dirname, '../Downloads/images-upload-map.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const records = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

async function updateImages() {
  for (const row of records) {
    const slug = row.id;
    const imageUrl = row.desired_image_path;
    if (!slug || !imageUrl) {
      console.warn('Skipping row with missing slug or image:', row);
      continue;
    }
    const { error } = await supabase
      .from('exercises')
      .update({ image_url: imageUrl })
      .eq('slug', slug);
    if (error) {
      console.error(`Failed to update image for ${slug}:`, error.message);
    } else {
      console.log(`Updated image for ${slug}`);
    }
  }
}

updateImages();
