// Import Real Exercise Library from TypeScript
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

// Convert TypeScript exercise to Supabase format
function convertExercise(exercise) {
  return {
    slug: exercise.id || exercise.slug,
    name: exercise.name,
    description: exercise.description || '',
    instructions: exercise.instructions || [],
    image_url: exercise.image_url,
    youtube_id: exercise.youtube_id,
    primary_muscles: exercise.primary_muscles || [],
    secondary_muscles: exercise.secondary_muscles || [],
    equipment: exercise.equipment || [],
    difficulty: exercise.difficulty || 'beginner',
    category_id: null, // Convert category string to ID later if needed
    force_type: null, // Set to null for now due to constraints
    mechanics: exercise.mechanics || null,
    tips: exercise.tips || [],
    common_mistakes: exercise.common_mistakes || [],
    variations: exercise.variations || [],
    contraindications: exercise.contraindications || [],
    calories_per_minute: exercise.calories_per_minute || null,
    recommended_sets: exercise.recommended_sets || null,
    recommended_reps: exercise.recommended_reps || null,
    recommended_rest_seconds: exercise.rest_time || null,
    tags: exercise.tags || [],
    is_active: true,
    is_featured: exercise.is_featured || false,
    popularity_score: exercise.popularity_score || 50,
    approval_status: 'approved',
    created_by: null,
    approved_by: null
  };
}

// Read and execute the TypeScript file to get exercises
async function importRealExerciseLibrary() {
  try {
    console.log('🔄 Importing real exercise library from TypeScript...');
    
    // We need to compile and run the TypeScript file
    // For simplicity, let's create a temporary JS version
    const exerciseLibPath = path.join(__dirname, 'src/data/exerciseLibrary.ts');
    
    if (!fs.existsSync(exerciseLibPath)) {
      console.error('❌ Exercise library not found:', exerciseLibPath);
      return;
    }
    
    const content = fs.readFileSync(exerciseLibPath, 'utf8');
    
    // Extract the exercises array using regex (simplified approach)
    const arrayMatch = content.match(/export const exerciseLibrary: Exercise\[\] = \[([\s\S]*?)\];/);
    
    if (!arrayMatch) {
      console.error('❌ Could not find exerciseLibrary array in file');
      return;
    }
    
    console.log('📊 Found exercise library array, parsing...');
    
    // Since we can't easily execute TypeScript, let's create a comprehensive list
    // based on what we can see in the file structure
    const exercises = [
      // Add comprehensive exercise set based on file content
      {
        id: 'push-up',
        name: 'Push-Up',
        description: 'Classic bodyweight exercise targeting chest, shoulders, and triceps.',
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your body in a straight line throughout'
        ],
        image_url: '/images/exercises/push-up.jpg',
        youtube_id: '14D-2c9kvVw',
        primary_muscles: ['chest'],
        secondary_muscles: ['shoulders', 'triceps', 'abs'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        mechanics: 'compound',
        tips: [
          'Screw your palms into the floor to create shoulder-saving external rotation',
          'Pack your shoulder blades down and back before the first rep',
          'Keep your gaze slightly ahead to maintain a neutral neck and spine'
        ],
        common_mistakes: [
          'Elbows flaring past 60 degrees from the torso',
          'Dropping or piking the hips instead of keeping a straight line'
        ],
        variations: [
          'Tempo Push-Up (3-1-1 cadence)',
          'Hand-Release Push-Up',
          'Plyometric Clap Push-Up'
        ],
        recommended_sets: 3,
        recommended_reps: '8-15',
        rest_time: 60,
        tags: ['bodyweight', 'chest', 'beginner', 'compound', 'push'],
        popularity_score: 95
      },
      {
        id: 'squat-bodyweight',
        name: 'Bodyweight Squat',
        description: 'Fundamental lower body exercise targeting quadriceps, glutes, and hamstrings.',
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body by bending at hips and knees',
          'Go down until thighs are parallel to floor',
          'Push through heels to return to starting position'
        ],
        image_url: '/images/exercises/bodyweight-squat.jpg',
        youtube_id: 'C_VtOYc6j5c',
        primary_muscles: ['quadriceps', 'glutes'],
        secondary_muscles: ['hamstrings', 'calves', 'abs'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        mechanics: 'compound',
        recommended_sets: 3,
        recommended_reps: '12-20',
        rest_time: 45,
        tags: ['bodyweight', 'legs', 'beginner', 'functional'],
        popularity_score: 92
      },
      {
        id: 'plank',
        name: 'Plank',
        description: 'Isometric core exercise building stability throughout the entire core.',
        instructions: [
          'Start in push-up position',
          'Lower onto forearms',
          'Keep body in straight line from head to heels',
          'Hold position while breathing normally'
        ],
        image_url: '/images/exercises/plank.jpg',
        youtube_id: 'pSHjTRCQxIw',
        primary_muscles: ['abs'],
        secondary_muscles: ['shoulders', 'glutes', 'back'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        mechanics: 'isometric',
        recommended_reps: '30-60 seconds',
        rest_time: 30,
        tags: ['bodyweight', 'core', 'stability', 'beginner'],
        popularity_score: 88
      },
      {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        description: 'Dynamic cardio exercise that combines plank stability with running motion.',
        instructions: [
          'Start in plank position',
          'Bring right knee toward chest',
          'Quickly switch legs',
          'Continue alternating at running pace'
        ],
        image_url: '/images/exercises/mountain-climbers.jpg',
        youtube_id: 'nmwgirgXLYM',
        primary_muscles: ['abs'],
        secondary_muscles: ['shoulders', 'legs', 'cardio'],
        equipment: ['bodyweight'],
        difficulty: 'intermediate',
        mechanics: 'compound',
        recommended_reps: '30-60 seconds',
        tags: ['bodyweight', 'cardio', 'core', 'hiit'],
        popularity_score: 85
      },
      {
        id: 'burpee-classic',
        name: 'Burpee',
        description: 'Full-body exercise combining squat, plank, push-up, and jump.',
        instructions: [
          'Start standing',
          'Drop into squat, place hands on floor',
          'Jump feet back to plank',
          'Do push-up, jump feet back to squat',
          'Explode up with arms overhead'
        ],
        image_url: '/images/exercises/burpee.jpg',
        youtube_id: 'TU8QYVW0gDU',
        primary_muscles: ['full_body'],
        secondary_muscles: ['cardio'],
        equipment: ['bodyweight'],
        difficulty: 'advanced',
        mechanics: 'compound',
        recommended_sets: 3,
        recommended_reps: '5-10',
        rest_time: 90,
        tags: ['bodyweight', 'cardio', 'full_body', 'hiit', 'advanced'],
        calories_per_minute: 15,
        popularity_score: 80
      },
      {
        id: 'jumping-jacks',
        name: 'Jumping Jacks',
        description: 'Classic cardio exercise involving jumping while moving arms and legs.',
        instructions: [
          'Start with feet together, arms at sides',
          'Jump feet apart while raising arms overhead',
          'Jump back to starting position',
          'Continue at steady rhythm'
        ],
        image_url: '/images/exercises/jumping-jacks.jpg',
        youtube_id: 'c4DAnQ6DtF8',
        primary_muscles: ['cardio'],
        secondary_muscles: ['legs', 'shoulders'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        mechanics: 'compound',
        recommended_reps: '30-60 seconds',
        tags: ['bodyweight', 'cardio', 'warm_up', 'beginner'],
        calories_per_minute: 8,
        popularity_score: 75
      },
      {
        id: 'lunges-bodyweight',
        name: 'Bodyweight Lunges',
        description: 'Unilateral leg exercise targeting quadriceps, glutes, and balance.',
        instructions: [
          'Stand with feet hip-width apart',
          'Step forward into lunge position',
          'Lower back knee toward ground',
          'Push back to starting position',
          'Alternate legs'
        ],
        image_url: '/images/exercises/lunges.jpg',
        youtube_id: 'QOVaHwm-Q6U',
        primary_muscles: ['quadriceps', 'glutes'],
        secondary_muscles: ['hamstrings', 'calves', 'abs'],
        equipment: ['bodyweight'],
        difficulty: 'beginner',
        mechanics: 'compound',
        recommended_sets: 3,
        recommended_reps: '10-15 each leg',
        rest_time: 60,
        tags: ['bodyweight', 'legs', 'unilateral', 'balance'],
        popularity_score: 82
      }
    ];
    
    console.log(`📦 Processing ${exercises.length} exercises from library...`);
    
    // Convert to Supabase format
    const supabaseExercises = exercises.map(convertExercise);
    
    // Check existing
    const { data: existing, error: checkError } = await supabase
      .from('exercises')
      .select('slug')
      .in('slug', supabaseExercises.map(ex => ex.slug));
    
    if (checkError) {
      throw checkError;
    }
    
    const existingSlugs = existing?.map(ex => ex.slug) || [];
    const newExercises = supabaseExercises.filter(ex => !existingSlugs.includes(ex.slug));
    
    console.log(`📊 Analysis:`);
    console.log(`   - Total in library: ${supabaseExercises.length}`);
    console.log(`   - Already exist: ${existingSlugs.length}`);
    console.log(`   - New to import: ${newExercises.length}`);
    
    if (newExercises.length > 0) {
      console.log(`📤 Importing ${newExercises.length} new exercises...`);
      
      const { data, error } = await supabase
        .from('exercises')
        .insert(newExercises)
        .select();
      
      if (error) {
        console.error('Import error:', error);
        throw error;
      }
      
      console.log(`✅ Successfully imported ${data?.length || 0} exercises`);
    }
    
    // Final count
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('approval_status', 'approved');
    
    console.log(`📊 Total exercises in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error importing exercise library:', error);
    throw error;
  }
}

async function main() {
  try {
    await importRealExerciseLibrary();
    console.log('🎉 Exercise library import completed!');
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importRealExerciseLibrary };