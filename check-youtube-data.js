import { supabase } from './src/lib/supabase.ts';

async function checkYouTubeData() {
  try {
    console.log('Checking database for YouTube IDs...');
    
    // Check total exercises
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Total exercises in database: ${count}`);
    
    // Check if youtube_id column exists and has data
    const { data: sampleExercises, error } = await supabase
      .from('exercises')
      .select('name, youtube_id, image_url, gif_url')
      .limit(10);
    
    if (error) {
      console.error('Error querying exercises:', error);
      return;
    }
    
    console.log('\nSample exercises:');
    sampleExercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name}`);
      console.log(`   YouTube ID: ${exercise.youtube_id || 'None'}`);
      console.log(`   Image URL: ${exercise.image_url || 'None'}`);
      console.log(`   GIF URL: ${exercise.gif_url || 'None'}`);
      console.log('');
    });
    
    // Check exercises with YouTube IDs
    const { data: youtubeExercises, error: ytError } = await supabase
      .from('exercises')
      .select('name, youtube_id')
      .not('youtube_id', 'is', null)
      .limit(5);
    
    if (ytError) {
      console.error('Error querying YouTube exercises:', ytError);
      return;
    }
    
    console.log(`\nExercises with YouTube IDs: ${youtubeExercises.length}`);
    youtubeExercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name} - ${exercise.youtube_id}`);
    });
    
  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkYouTubeData();