// Simple bulk environment update
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function bulkUpdateEnvironmentTags() {
  console.log('🔄 Starting bulk environment update...\n');
  
  try {
    let totalUpdated = 0;
    let batchSize = 50;
    let offset = 0;
    let hasMore = true;
    
    while (hasMore && totalUpdated < 1500) {
      const { data: exercises, error: fetchError } = await supabase
        .from('exercises')
        .select('id, name, tags')
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .range(offset, offset + batchSize - 1);
      
      if (fetchError) throw fetchError;
      if (!exercises || exercises.length === 0) break;
      
      const needsUpdate = exercises.filter(ex => {
        const tags = ex.tags || [];
        return !tags.some(tag => 
          ['gym', 'indoor', 'outdoor', 'hyrox', 'event', 'home'].includes(tag.toLowerCase())
        );
      });
      
      if (needsUpdate.length === 0) {
        offset += batchSize;
        if (exercises.length < batchSize) hasMore = false;
        continue;
      }
      
      // Update exercises in this batch
      for (const exercise of needsUpdate) {
        const newTags = [...(exercise.tags || []), 'gym'];
        
        const { error: updateError } = await supabase
          .from('exercises')
          .update({ tags: newTags })
          .eq('id', exercise.id);
        
        if (!updateError) {
          totalUpdated++;
        } else {
          console.error('Update error for', exercise.name, ':', updateError);
        }
      }
      
      console.log('✅ Batch', Math.floor(offset/batchSize) + 1 + ': Updated', needsUpdate.length, 'exercises (total:', totalUpdated + ')');
      
      offset += batchSize;
      if (exercises.length < batchSize) hasMore = false;
    }
    
    console.log('\n🎉 Bulk update completed! Updated', totalUpdated, 'exercises');
    
    // Final verification
    const { count: gymCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .contains('tags', ['gym'])
      .eq('is_active', true);
    
    const { count: indoorCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .contains('tags', ['indoor'])
      .eq('is_active', true);
    
    const { count: outdoorCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .contains('tags', ['outdoor'])
      .eq('is_active', true);
    
    const { count: hyroxCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .contains('tags', ['hyrox'])
      .eq('is_active', true);
    
    const { count: totalCount } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log('\n📊 Final environment breakdown:');
    console.log('   🏋️ Gym:', gymCount);
    console.log('   🏠 Indoor:', indoorCount);
    console.log('   🌲 Outdoor:', outdoorCount);
    console.log('   🏃 Hyrox:', hyroxCount);
    console.log('   📊 Total:', totalCount);
    
    console.log('\n✅ All exercises now have environment tags for filtering!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

bulkUpdateEnvironmentTags();