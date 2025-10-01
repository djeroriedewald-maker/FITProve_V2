// Import Hyrox Event Exercises to Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import the Hyrox exercises from the TypeScript file
// We need to manually copy the data since we can't directly import TS in Node.js
const hyroxExercises = [
  {
    id: "hyrox-run",
    name: "Run",
    slug: "hyrox-run",
    description: "The event features 8 × 1 km runs, each performed between workout stations. Running is the foundation and tests endurance, pacing, and mental toughness.",
    instructions: [
      "Start each run at a controlled pace to avoid burning out early.",
      "Focus on efficient breathing and relaxed stride mechanics.",
      "Use the run segments to recover from the previous station and prepare for the next.",
      "Stay in your assigned lane and follow event signage for transitions."
    ],
    image_url: "/images/hyrox/running_female.webp",
    youtube_id: "6vYGo7QvYw8",
    primary_muscles: ["cardio"],
    secondary_muscles: ["legs", "core"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    category_id: null,
    force_type: "dynamic",
    mechanics: "compound",
    tips: [
      "Don't sprint the first run—save energy for later stations.",
      "Practice running on tired legs to simulate event conditions.",
      "Work on your pacing strategy during training runs."
    ],
    common_mistakes: [
      "Starting too fast and burning out",
      "Not practicing transitions between stations",
      "Ignoring pacing strategy"
    ],
    variations: [
      "Treadmill running for consistent pace",
      "Outdoor running for race simulation",
      "Interval training for speed work"
    ],
    contraindications: [],
    calories_per_minute: 12,
    recommended_sets: "8 × 1km",
    recommended_reps: null,
    recommended_rest_seconds: null,
    tags: ["hyrox", "running", "cardio", "endurance", "event"],
    is_active: true,
    is_featured: true,
    popularity_score: 95,
    approval_status: "approved",
    created_by: null,
    approved_by: null
  },
  {
    id: "hyrox-skierg",
    name: "SkiErg",
    slug: "hyrox-skierg",
    description: "1000m on the SkiErg machine. This station tests upper body power, core stability, and cardiovascular endurance through a full-body pulling motion.",
    instructions: [
      "Set up with feet shoulder-width apart and slight bend in knees.",
      "Grip handles with overhand grip, arms extended overhead.",
      "Pull down explosively using lats, core, and slight hip hinge.",
      "Return handles smoothly to starting position with control.",
      "Maintain consistent rhythm and breathing pattern."
    ],
    image_url: "/images/hyrox/skierg_male.webp",
    youtube_id: "ZoZLwgr5VpU",
    primary_muscles: ["lats", "shoulders", "core"],
    secondary_muscles: ["triceps", "glutes"],
    equipment: ["ski_erg"],
    difficulty: "intermediate",
    category_id: null,
    force_type: "pull",
    mechanics: "compound",
    tips: [
      "Focus on using your lats, not just your arms.",
      "Engage your core throughout the movement.",
      "Find a sustainable pace for the full 1000m."
    ],
    common_mistakes: [
      "Using only arms instead of full body",
      "Going out too fast and burning out",
      "Poor posture leading to back strain"
    ],
    variations: [
      "Shorter intervals for technique work",
      "Longer sessions for endurance building"
    ],
    contraindications: ["Lower back injury", "Shoulder impingement"],
    calories_per_minute: 15,
    recommended_sets: "1 × 1000m",
    recommended_reps: null,
    recommended_rest_seconds: null,
    tags: ["hyrox", "skierg", "cardio", "upper_body", "event"],
    is_active: true,
    is_featured: true,
    popularity_score: 90,
    approval_status: "approved",
    created_by: null,
    approved_by: null
  }
  // Add more Hyrox exercises here as needed...
];

async function importHyroxExercises() {
  try {
    console.log('🔄 Starting Hyrox exercises import...');
    
    // Check if exercises already exist
    const { data: existing, error: checkError } = await supabase
      .from('exercises')
      .select('slug')
      .in('slug', hyroxExercises.map(ex => ex.slug));
    
    if (checkError) {
      throw checkError;
    }
    
    const existingSlugs = existing?.map(ex => ex.slug) || [];
    const newExercises = hyroxExercises.filter(ex => !existingSlugs.includes(ex.slug));
    
    if (newExercises.length === 0) {
      console.log('✅ All Hyrox exercises already exist in database');
      return;
    }
    
    console.log(`📦 Importing ${newExercises.length} new Hyrox exercises...`);
    
    // Insert new exercises
    const { data, error } = await supabase
      .from('exercises')
      .insert(newExercises)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`✅ Successfully imported ${data?.length || 0} Hyrox exercises`);
    
    // Verify total count
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (!countError) {
      console.log(`📊 Total active exercises in database: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error importing Hyrox exercises:', error);
    process.exit(1);
  }
}

async function main() {
  await importHyroxExercises();
  console.log('🎉 Hyrox import completed!');
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { importHyroxExercises };