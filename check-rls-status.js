const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status on workout tables...\n');
  
  try {
    // Check if we can query the custom_workouts table
    console.log('1. Testing custom_workouts table access...');
    const { data: workouts, error: workoutsError } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id')
      .limit(1);
      
    if (workoutsError) {
      console.log('❌ custom_workouts error:', workoutsError.message);
      if (workoutsError.message.includes('policy')) {
        console.log('🚨 RLS IS STILL ENABLED - Need to run disable script');
      }
    } else {
      console.log('✅ custom_workouts accessible');
    }
    
    // Try to insert a test record to see if RLS blocks it
    console.log('\n2. Testing insert operation (will fail if RLS enabled)...');
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Random UUID
    
    const { data: testInsert, error: insertError } = await supabase
      .from('custom_workouts')
      .insert({
        name: 'RLS Test Workout',
        description: 'Test to check if RLS is disabled',
        user_id: testUserId,
        is_public: false,
        difficulty: 'beginner',
        tags: [],
        estimated_duration: 30,
        estimated_calories: 200
      })
      .select()
      .single();
      
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      if (insertError.message.includes('policy') || insertError.message.includes('RLS')) {
        console.log('🚨 RLS IS BLOCKING INSERTS - Must disable RLS');
        console.log('\n📋 Run this in Supabase SQL Editor:');
        console.log('ALTER TABLE custom_workouts DISABLE ROW LEVEL SECURITY;');
        console.log('ALTER TABLE custom_workout_exercises DISABLE ROW LEVEL SECURITY;');
      }
    } else {
      console.log('✅ Insert successful - RLS is disabled:', testInsert.id);
      
      // Clean up test record
      await supabase
        .from('custom_workouts')
        .delete()
        .eq('id', testInsert.id);
      console.log('🗑️ Test record cleaned up');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    if (insertError && insertError.message.includes('policy')) {
      console.log('1. ⚠️  RLS is still enabled - run the disable script in Supabase');
      console.log('2. 🔄 After running script, try saving workout again');
    } else {
      console.log('1. ✅ RLS appears to be disabled');
      console.log('2. 🔍 Check for other authentication issues in browser console');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkRLSStatus();