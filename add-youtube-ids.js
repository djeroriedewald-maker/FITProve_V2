// Quick script to add YouTube IDs to a few exercises for testing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odjqovfjigvhuzkcigps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kanFvdmZqaWd2aHV6a2NpZ3BzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY0MDI5MTIsImV4cCI6MjA0MTk3ODkxMn0.2xyqogLX5sCOkWk6N3B8DGLgcRK0iJcPMx7n2PoYmlY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addYouTubeIds() {
  console.log('Adding YouTube IDs to existing exercises...');
  
  // Sample exercises with YouTube IDs
  const exerciseUpdates = [
    { name: 'Push-up', youtube_id: 'IODxDxX7oi4' },
    { name: 'Bench Press', youtube_id: '4Y2ZdHCOXok' },
    { name: 'Pull-up', youtube_id: 'eGo4IYlbE5g' },
    { name: 'Deadlift', youtube_id: 'ytGaGIn3SjE' },
    { name: 'Squat', youtube_id: 'ultWZbUMPL8' },
  ];
  
  for (const update of exerciseUpdates) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update({ youtube_id: update.youtube_id })
        .ilike('name', `%${update.name}%`)
        .select('name, youtube_id');
      
      if (error) {
        console.error(`❌ Failed to update ${update.name}:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${data.length} exercise(s) matching "${update.name}" with YouTube ID: ${update.youtube_id}`);
        data.forEach(ex => console.log(`   - ${ex.name}`));
      } else {
        console.log(`⚠️ No exercises found matching "${update.name}"`);
      }
    } catch (err) {
      console.error(`❌ Error updating ${update.name}:`, err.message);
    }
  }
}

addYouTubeIds().then(() => {
  console.log('✅ YouTube ID update completed!');
}).catch(err => {
  console.error('❌ Update failed:', err);
});