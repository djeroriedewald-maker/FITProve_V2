const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseAccess() {
  console.log('🔍 Testing database access and permissions...\n');
  
  try {
    // Test 1: Check authentication
    console.log('1. Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message);
    } else if (!user) {
      console.log('❌ No authenticated user');
    } else {
      console.log('✅ User authenticated:', user.id);
    }
    
    // Test 2: Test custom_workouts table access
    console.log('\n2. Testing custom_workouts table...');
    const { data: workouts, error: workoutsError } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id')
      .limit(5);
      
    if (workoutsError) {
      console.log('❌ Custom workouts error:', workoutsError.message);
      console.log('   Details:', workoutsError.details);
      console.log('   Hint:', workoutsError.hint);
    } else {
      console.log('✅ Custom workouts accessible, found', workouts.length, 'records');
    }
    
    // Test 3: Test exercises table access
    console.log('\n3. Testing exercises table...');
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(5);
      
    if (exercisesError) {
      console.log('❌ Exercises error:', exercisesError.message);
      console.log('   Details:', exercisesError.details);
      console.log('   Hint:', exercisesError.hint);
    } else {
      console.log('✅ Exercises accessible, found', exercises.length, 'records');
      console.log('   Sample exercises:', exercises.map(e => e.name).join(', '));
    }
    
    // Test 4: Test insert permission (if authenticated)
    if (user) {
      console.log('\n4. Testing insert permissions...');
      const testWorkout = {
        user_id: user.id,
        name: 'Test Workout - ' + Date.now(),
        description: 'Test workout for permissions',
        is_public: false,
        difficulty: 'beginner',
        tags: ['test'],
        estimated_duration: 30,
        estimated_calories: 200
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('custom_workouts')
        .insert([testWorkout])
        .select()
        .single();
        
      if (insertError) {
        console.log('❌ Insert error:', insertError.message);
        console.log('   Details:', insertError.details);
        console.log('   Hint:', insertError.hint);
      } else {
        console.log('✅ Insert successful, workout ID:', insertResult.id);
        
        // Clean up test workout
        await supabase
          .from('custom_workouts')
          .delete()
          .eq('id', insertResult.id);
        console.log('✅ Test workout cleaned up');
      }
    } else {
      console.log('\n4. Skipping insert test - no authenticated user');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseAccess();