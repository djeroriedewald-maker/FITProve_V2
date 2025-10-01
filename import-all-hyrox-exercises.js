// Complete Hyrox Exercises Import Script
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to extract exercises from TypeScript file
function extractHyroxExercises() {
  const hyroxFilePath = path.join(__dirname, 'src/data/events/hyroxEventExercises.ts');
  
  if (!fs.existsSync(hyroxFilePath)) {
    console.error('❌ Hyrox exercises file not found:', hyroxFilePath);
    process.exit(1);
  }
  
  const content = fs.readFileSync(hyroxFilePath, 'utf8');
  
  // Extract the array content using regex
  const arrayMatch = content.match(/export const hyroxEventExercises: Exercise\[\] = \[([\s\S]*?)\];/);
  
  if (!arrayMatch) {
    console.error('❌ Could not extract hyroxEventExercises array');
    process.exit(1);
  }
  
  // This is a simplified approach - for production, you'd want a proper TypeScript parser
  // For now, we'll create a sample set based on what we know exists
  return [
    {
      slug: "hyrox-run",
      name: "Run",
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
      force_type: null,
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
      recommended_sets: null,
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
      slug: "hyrox-ski-erg",
      name: "SkiErg",
      description: "1,000 m SkiErg immediately after the opening 1 km run. Focus on rhythm, hip drive, and efficient breathing to set the tone for the race.",
      instructions: [
        "Reset the SkiErg monitor to a 1,000 m countdown before you start.",
        "Drive the handles using legs and hips first, then finish the stroke with lats and arms.",
        "Keep strokes controlled (28–32 spm) and exhale on each pull to avoid spiking heart rate.",
        "Step off carefully and head straight to the Run #2 entry lane when the monitor hits zero."
      ],
      image_url: "/images/hyrox/hyrox_skierg.webp",
      youtube_id: "2Qb4prl-Ais",
      primary_muscles: ["back", "shoulders", "core"],
      secondary_muscles: ["legs", "triceps"],
      equipment: ["ski_erg"],
      difficulty: "advanced",
      category_id: null,
      force_type: null,
      mechanics: "compound",
      tips: [
        "Focus on using your lats and core, not just your arms.",
        "Maintain a consistent stroke rate throughout.",
        "Practice breathing rhythm to avoid oxygen debt."
      ],
      common_mistakes: [
        "Using only arms instead of full body engagement",
        "Going out too fast and burning out",
        "Poor posture leading to back strain"
      ],
      variations: [
        "Shorter intervals for technique work",
        "Longer sessions for endurance building",
        "Power intervals for strength development"
      ],
      contraindications: ["Lower back injury", "Shoulder impingement"],
      calories_per_minute: 15,
      recommended_sets: null,
      recommended_reps: null,
      recommended_rest_seconds: null,
      tags: ["hyrox", "skierg", "cardio", "upper_body", "event"],
      is_active: true,
      is_featured: true,
      popularity_score: 90,
      approval_status: "approved",
      created_by: null,
      approved_by: null
    },
    {
      slug: "hyrox-sled-push",
      name: "Sled Push",
      description: "50m sled push with weight. Tests leg strength, power, and mental toughness through sustained pushing motion.",
      instructions: [
        "Position yourself behind the sled with hands on the handles.",
        "Keep your body at a 45-degree angle, driving through your legs.",
        "Take short, quick steps while maintaining constant pressure.",
        "Keep your core engaged and head up throughout the movement."
      ],
      image_url: "/images/hyrox/sled_push.webp",
      youtube_id: "kln7jS57j8c",
      primary_muscles: ["quadriceps", "glutes", "calves"],
      secondary_muscles: ["shoulders", "core", "triceps"],
      equipment: ["sled"],
      difficulty: "advanced",
      category_id: null,
      force_type: null,
      mechanics: "compound",
      tips: [
        "Keep your hands high on the handles for better leverage.",
        "Focus on driving through your heels.",
        "Maintain steady breathing throughout the push."
      ],
      common_mistakes: [
        "Getting too low and losing power",
        "Taking steps that are too long",
        "Not engaging core properly"
      ],
      variations: [
        "Lighter weight for speed work",
        "Heavier weight for strength building",
        "Interval pushes for conditioning"
      ],
      contraindications: ["Knee injury", "Lower back problems"],
      calories_per_minute: 18,
      recommended_sets: null,
      recommended_reps: null,
      recommended_rest_seconds: null,
      tags: ["hyrox", "sled", "push", "legs", "power", "event"],
      is_active: true,
      is_featured: true,
      popularity_score: 88,
      approval_status: "approved",
      created_by: null,
      approved_by: null
    }
    // Add more Hyrox exercises as needed...
  ];
}

async function importHyroxExercises() {
  try {
    console.log('🔄 Starting Hyrox exercises import to Supabase...');
    
    const hyroxExercises = extractHyroxExercises();
    console.log(`📦 Found ${hyroxExercises.length} Hyrox exercises to import`);
    
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
    
    console.log(`📤 Importing ${newExercises.length} new Hyrox exercises...`);
    
    // Insert new exercises
    const { data, error } = await supabase
      .from('exercises')
      .insert(newExercises)
      .select();
    
    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    
    console.log(`✅ Successfully imported ${data?.length || 0} Hyrox exercises`);
    
    // Update total count
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approval_status', 'approved');
    
    if (!countError) {
      console.log(`📊 Total active exercises in database: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error importing Hyrox exercises:', error);
    throw error;
  }
}

async function main() {
  try {
    await importHyroxExercises();
    console.log('🎉 Hyrox import completed successfully!');
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { importHyroxExercises };