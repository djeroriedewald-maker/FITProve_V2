import { supabase } from './src/lib/supabase';

async function checkSupabaseStructure() {
  console.log('Checking Supabase database structure...\n');

  try {
    // Check profiles table
    console.log('Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
    } else {
      console.log('✓ Profiles table exists');
    }

    // Check exercises table
    console.log('\nChecking exercises table...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);
    
    if (exercisesError) {
      console.error('❌ Exercises table error:', exercisesError);
    } else {
      console.log('✓ Exercises table exists');
    }

    // Check workouts table
    console.log('\nChecking workouts table...');
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .limit(1);
    
    if (workoutsError) {
      console.error('❌ Workouts table error:', workoutsError);
    } else {
      console.log('✓ Workouts table exists');
    }

    // Check posts table
    console.log('\nChecking posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ Posts table error:', postsError);
    } else {
      console.log('✓ Posts table exists');
    }

    // Check if RLS is enabled
    console.log('\nChecking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies')
      .select('*');
    
    if (policiesError) {
      console.error('❌ Could not check RLS policies:', policiesError);
    } else {
      console.log('✓ RLS policies are configured');
    }

  } catch (error) {
    console.error('Failed to check database structure:', error);
  }
}

checkSupabaseStructure();