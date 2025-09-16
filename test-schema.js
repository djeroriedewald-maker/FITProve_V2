const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Check what columns exist in workouts table
    console.log('🔍 Checking workouts table structure...');
    const { data: workouts, error: workoutError } = await client
      .from('workouts')
      .select('*')
      .limit(1);
    
    if (workoutError) {
      console.log('❌ Workouts error:', workoutError.message);
    } else {
      console.log('✅ Workouts table exists');
      if (workouts && workouts.length > 0) {
        console.log('  Columns:', Object.keys(workouts[0]));
      } else {
        console.log('  No data to show columns');
      }
    }

    // Check what columns exist in exercises table
    console.log('\n💪 Checking exercises table structure...');
    const { data: exercises, error: exerciseError } = await client
      .from('exercises')
      .select('*')
      .limit(1);
    
    if (exerciseError) {
      console.log('❌ Exercises error:', exerciseError.message);
    } else {
      console.log('✅ Exercises table exists');
      if (exercises && exercises.length > 0) {
        console.log('  Columns:', Object.keys(exercises[0]));
      } else {
        console.log('  No data to show columns');
      }
    }

    // Check profiles table structure
    console.log('\n👤 Checking profiles table structure...');
    const { data: profiles, error: profileError } = await client
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log('❌ Profiles error:', profileError.message);
    } else {
      console.log('✅ Profiles table exists');
      if (profiles && profiles.length > 0) {
        console.log('  Columns:', Object.keys(profiles[0]));
      } else {
        console.log('  No data to show columns');
      }
    }

  } catch (err) {
    console.error('❌ Schema check error:', err);
  }
}

checkSchema();