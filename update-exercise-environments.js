// Update exercises without environment to set "Gym" as default
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExerciseEnvironments() {
  try {
    console.log('🔄 Analyzing exercises without environment filters...');
    
    // First, let's see what we have
    const { data: allExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id, slug, name, tags')
      .eq('is_active', true)
      .eq('approval_status', 'approved');
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`📊 Total exercises: ${allExercises?.length || 0}`);
    
    // Categorize exercises based on their tags
    const categories = {
      hyrox: [],
      outdoor: [],
      indoor: [],
      gym: [],
      noEnvironment: []
    };
    
    allExercises?.forEach(exercise => {
      const tags = exercise.tags || [];
      const tagsLower = tags.map(tag => tag.toLowerCase());
      
      if (tagsLower.includes('hyrox')) {
        categories.hyrox.push(exercise);
      } else if (tagsLower.some(tag => ['outdoor', 'running', 'hiking', 'cycling'].includes(tag))) {
        categories.outdoor.push(exercise);
      } else if (tagsLower.some(tag => ['indoor', 'home', 'bodyweight'].includes(tag))) {
        categories.indoor.push(exercise);
      } else if (tagsLower.some(tag => ['gym', 'weights', 'barbell', 'dumbbell', 'machine'].includes(tag))) {
        categories.gym.push(exercise);
      } else {
        categories.noEnvironment.push(exercise);
      }
    });
    
    console.log('📈 Current categorization:');
    console.log(`   🏃 Hyrox: ${categories.hyrox.length}`);
    console.log(`   🌲 Outdoor: ${categories.outdoor.length}`);
    console.log(`   🏠 Indoor: ${categories.indoor.length}`);
    console.log(`   🏋️ Gym: ${categories.gym.length}`);
    console.log(`   ❓ No Environment: ${categories.noEnvironment.length}`);
    
    // Update exercises without environment to "Gym"
    if (categories.noEnvironment.length > 0) {
      console.log(`\n🔄 Updating ${categories.noEnvironment.length} exercises to add "gym" tag...`);
      
      for (const exercise of categories.noEnvironment) {
        const currentTags = exercise.tags || [];
        const updatedTags = [...currentTags, 'gym'];
        
        const { error: updateError } = await supabase
          .from('exercises')
          .update({ tags: updatedTags })
          .eq('id', exercise.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${exercise.name}:`, updateError);
        } else {
          console.log(`✅ Updated: ${exercise.name}`);
        }
      }
    }
    
    // Also update Hyrox exercises to have "hyrox" and "event" tags if missing
    console.log(`\n🔄 Ensuring Hyrox exercises have proper environment tags...`);
    
    for (const exercise of categories.hyrox) {
      const currentTags = exercise.tags || [];
      const tagsLower = currentTags.map(tag => tag.toLowerCase());
      
      let needsUpdate = false;
      let updatedTags = [...currentTags];
      
      if (!tagsLower.includes('event')) {
        updatedTags.push('event');
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('exercises')
          .update({ tags: updatedTags })
          .eq('id', exercise.id);
        
        if (updateError) {
          console.error(`❌ Error updating Hyrox ${exercise.name}:`, updateError);
        } else {
          console.log(`✅ Updated Hyrox: ${exercise.name}`);
        }
      }
    }
    
    // Final verification
    console.log('\n📊 Final verification...');
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('exercises')
      .select('tags')
      .eq('is_active', true)
      .eq('approval_status', 'approved');
    
    if (finalError) {
      throw finalError;
    }
    
    const finalCategories = {
      hyrox: 0,
      gym: 0,
      indoor: 0,
      outdoor: 0,
      event: 0,
      noEnvironment: 0
    };
    
    finalCheck?.forEach(exercise => {
      const tags = exercise.tags || [];
      const tagsLower = tags.map(tag => tag.toLowerCase());
      
      if (tagsLower.includes('hyrox')) finalCategories.hyrox++;
      if (tagsLower.includes('gym')) finalCategories.gym++;
      if (tagsLower.includes('indoor')) finalCategories.indoor++;
      if (tagsLower.includes('outdoor')) finalCategories.outdoor++;
      if (tagsLower.includes('event')) finalCategories.event++;
      
      if (!tagsLower.some(tag => ['hyrox', 'gym', 'indoor', 'outdoor', 'event'].includes(tag))) {
        finalCategories.noEnvironment++;
      }
    });
    
    console.log('✅ Updated categorization:');
    console.log(`   🏃 Hyrox: ${finalCategories.hyrox}`);
    console.log(`   🏋️ Gym: ${finalCategories.gym}`);
    console.log(`   🏠 Indoor: ${finalCategories.indoor}`);
    console.log(`   🌲 Outdoor: ${finalCategories.outdoor}`);
    console.log(`   🎯 Event: ${finalCategories.event}`);
    console.log(`   ❓ Still No Environment: ${finalCategories.noEnvironment}`);
    
  } catch (error) {
    console.error('❌ Error updating exercise environments:', error);
    throw error;
  }
}

async function main() {
  try {
    await updateExerciseEnvironments();
    console.log('\n🎉 Exercise environment update completed!');
    console.log('💡 All exercises now have proper environment categorization');
  } catch (error) {
    console.error('💥 Update failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateExerciseEnvironments };