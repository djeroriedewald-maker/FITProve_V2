// Fix environment tags for all exercises - batch update approach
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllExerciseEnvironments() {
  try {
    console.log('🔄 Starting comprehensive environment tag fix...');
    
    // Get ALL exercises with their current tags
    const { data: allExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id, slug, name, tags, equipment, primary_muscles')
      .eq('is_active', true)
      .eq('approval_status', 'approved');
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`📊 Processing ${allExercises?.length || 0} exercises...`);
    
    let updates = [];
    let categories = {
      hyrox: 0,
      gym: 0,
      indoor: 0,
      outdoor: 0,
      event: 0,
      alreadyHasEnvironment: 0
    };
    
    allExercises?.forEach(exercise => {
      const tags = exercise.tags || [];
      const tagsLower = tags.map(tag => tag.toLowerCase());
      const equipment = exercise.equipment || [];
      const equipmentLower = equipment.map(eq => eq.toLowerCase());
      
      // Check if already has environment tag
      const hasEnvironment = tagsLower.some(tag => 
        ['hyrox', 'gym', 'indoor', 'outdoor', 'event', 'home'].includes(tag)
      );
      
      if (hasEnvironment) {
        categories.alreadyHasEnvironment++;
        return; // Skip, already has environment
      }
      
      let newEnvironment = null;
      let updatedTags = [...tags];
      
      // Categorize based on name, tags, and equipment
      if (tagsLower.includes('hyrox') || exercise.name.toLowerCase().includes('hyrox')) {
        newEnvironment = 'hyrox';
        updatedTags.push('hyrox', 'event');
        categories.hyrox++;
      } else if (
        tagsLower.some(tag => ['outdoor', 'running', 'hiking', 'cycling', 'trail'].includes(tag)) ||
        exercise.name.toLowerCase().includes('outdoor') ||
        exercise.name.toLowerCase().includes('running')
      ) {
        newEnvironment = 'outdoor';
        updatedTags.push('outdoor');
        categories.outdoor++;
      } else if (
        tagsLower.some(tag => ['home', 'bodyweight'].includes(tag)) ||
        equipmentLower.includes('bodyweight') ||
        (equipmentLower.length === 1 && equipmentLower[0] === 'bodyweight')
      ) {
        newEnvironment = 'indoor';
        updatedTags.push('indoor', 'home');
        categories.indoor++;
      } else {
        // Everything else goes to gym (equipment-based exercises)
        newEnvironment = 'gym';
        updatedTags.push('gym');
        categories.gym++;
      }
      
      if (newEnvironment) {
        updates.push({
          id: exercise.id,
          tags: updatedTags
        });
      }
    });
    
    console.log('📈 Categorization plan:');
    console.log(`   🏃 Hyrox: ${categories.hyrox}`);
    console.log(`   🏋️ Gym: ${categories.gym}`);
    console.log(`   🏠 Indoor/Home: ${categories.indoor}`);
    console.log(`   🌲 Outdoor: ${categories.outdoor}`);
    console.log(`   ✅ Already has environment: ${categories.alreadyHasEnvironment}`);
    console.log(`   📝 Total updates needed: ${updates.length}`);
    
    if (updates.length === 0) {
      console.log('✅ All exercises already have environment tags!');
      return;
    }
    
    console.log(`\n🔄 Applying ${updates.length} updates...`);
    
    // Batch update in chunks of 100
    const batchSize = 100;
    let completed = 0;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Update each exercise in the batch
      const updatePromises = batch.map(update => 
        supabase
          .from('exercises')
          .update({ tags: update.tags })
          .eq('id', update.id)
      );
      
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error(`❌ Errors in batch ${Math.floor(i / batchSize) + 1}:`, errors);
      } else {
        completed += batch.length;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)} completed (${completed}/${updates.length})`);
      }
    }
    
    console.log(`\n🎉 Updates completed! Updated ${completed} exercises.`);
    
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
      home: 0,
      noEnvironment: 0
    };
    
    finalCheck?.forEach(exercise => {
      const tags = exercise.tags || [];
      const tagsLower = tags.map(tag => tag.toLowerCase());
      
      let hasEnvironment = false;
      
      if (tagsLower.includes('hyrox')) { finalCategories.hyrox++; hasEnvironment = true; }
      if (tagsLower.includes('gym')) { finalCategories.gym++; hasEnvironment = true; }
      if (tagsLower.includes('indoor')) { finalCategories.indoor++; hasEnvironment = true; }
      if (tagsLower.includes('outdoor')) { finalCategories.outdoor++; hasEnvironment = true; }
      if (tagsLower.includes('event')) { finalCategories.event++; hasEnvironment = true; }
      if (tagsLower.includes('home')) { finalCategories.home++; hasEnvironment = true; }
      
      if (!hasEnvironment) {
        finalCategories.noEnvironment++;
      }
    });
    
    console.log('✅ Final categorization:');
    console.log(`   🏃 Hyrox: ${finalCategories.hyrox}`);
    console.log(`   🏋️ Gym: ${finalCategories.gym}`);
    console.log(`   🏠 Indoor: ${finalCategories.indoor}`);
    console.log(`   🌲 Outdoor: ${finalCategories.outdoor}`);
    console.log(`   🎯 Event: ${finalCategories.event}`);
    console.log(`   🏠 Home: ${finalCategories.home}`);
    console.log(`   ❓ Still No Environment: ${finalCategories.noEnvironment}`);
    
  } catch (error) {
    console.error('❌ Error fixing exercise environments:', error);
    throw error;
  }
}

async function main() {
  try {
    await fixAllExerciseEnvironments();
    console.log('\n🎉 Environment tag fix completed!');
    console.log('💡 All exercises now have proper environment categorization for filters');
  } catch (error) {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixAllExerciseEnvironments };