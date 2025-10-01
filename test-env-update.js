// Test environment tag update
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testEnvironmentUpdate() {
  console.log('🧪 Testing environment tag update...\n');
  
  try {
    // Get one exercise to test with
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, tags')
      .eq('is_active', true)
      .ilike('name', '%push%')
      .limit(1);
    
    if (error) throw error;
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found with "push" in name');
      return;
    }
    
    const testExercise = exercises[0];
    console.log('Testing with:', testExercise.name);
    console.log('Current tags:', testExercise.tags);
    
    // Add gym tag
    const newTags = [...(testExercise.tags || []), 'gym'];
    console.log('Adding gym tag. New tags:', newTags);
    
    const { data: updated, error: updateError } = await supabase
      .from('exercises')
      .update({ tags: newTags })
      .eq('id', testExercise.id)
      .select();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
    
    console.log('✅ Update successful!');
    console.log('Updated data:', updated);
    if (updated && updated.length > 0) {
      console.log('Updated tags:', updated[0].tags);
      console.log('Has gym tag:', updated[0].tags?.includes('gym'));
    }
    
    // Test querying exercises with gym tag
    const { count, error: countError } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .contains('tags', ['gym'])
      .eq('is_active', true);
    
    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log('\n📊 Exercises with gym tag:', count);
    }
    
    // Also try with overlaps
    const { count: count2, error: count2Error } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true })
      .overlaps('tags', ['gym'])
      .eq('is_active', true);
    
    if (!count2Error) {
      console.log('📊 Exercises with gym tag (overlaps):', count2);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testEnvironmentUpdate();