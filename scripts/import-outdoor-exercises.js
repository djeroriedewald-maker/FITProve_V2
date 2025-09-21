require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load Supabase credentials from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Load all chunks
const chunkFiles = [
  path.join(__dirname, '../Downloads/chunk-001.json'),
  path.join(__dirname, '../Downloads/chunk-002.json'),
  path.join(__dirname, '../Downloads/chunk-003.json'),
];

const allExercises = chunkFiles.flatMap((file) => require(file));

async function importExercises() {
  for (const ex of allExercises) {
    const exercise = {
      slug: ex.id, // keep original string id as slug
      name: ex.name,
      description: ex.description,
      instructions: [],
      image_url: ex.imagePath || ex.image,
      youtube_id: null,
      primary_muscles: ex.muscles || [],
      secondary_muscles: [],
      equipment: [ex.equipment],
      difficulty: ex.level ? ex.level.toLowerCase() : 'beginner',
      category_id: null,
      force_type: null,
      mechanics: null,
      tips: [],
      common_mistakes: [],
      variations: [],
      contraindications: [],
      calories_per_minute: null,
      recommended_sets: null,
      recommended_reps: ex.schemeHint || null,
      recommended_rest_seconds: null,
      tags: ex.tags || [],
      is_active: true,
      is_featured: false,
      popularity_score: 0,
      created_by: null,
      approved_by: null,
      approval_status: 'approved',
      environment: [ex.environment || 'Outdoor'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('exercises').insert([exercise]);
    if (error) {
      console.error('Failed to insert:', ex.name, error.message);
    } else {
      console.log('Inserted:', ex.name);
    }
  }
}

importExercises();
