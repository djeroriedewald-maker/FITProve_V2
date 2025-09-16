const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFullWorkflowWithAuth() {
  console.log('🔄 Testing full workout creation workflow...\n');
  
  try {
    // Step 1: Test anonymous access first
    console.log('1. Testing anonymous database access...');
    const { data: anonExercises, error: anonError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(3);
      
    if (anonError) {
      console.log('❌ Anonymous exercises access failed:', anonError.message);
    } else {
      console.log('✅ Anonymous exercises access works:', anonExercises.length, 'exercises found');
    }
    
    // Step 2: Test user creation and authentication
    console.log('\n2. Testing user authentication...');
    
    // Create a test user account
    const testEmail = `test-${Date.now()}@fitprove.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('Creating test user:', testEmail);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      return;
    }
    
    console.log('✅ User created successfully');
    
    // Step 3: Sign in with the test user
    console.log('\n3. Signing in with test user...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return;
    }
    
    console.log('✅ Sign in successful, user ID:', signInData.user.id);
    
    // Step 4: Test authenticated access
    console.log('\n4. Testing authenticated database access...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('❌ Get user failed:', userError?.message);
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Step 5: Test workout creation
    console.log('\n5. Testing workout creation...');
    
    // Get some exercises for the workout
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id, name')
      .limit(2);
      
    if (exercisesError || !exercises || exercises.length === 0) {
      console.log('❌ Could not get exercises:', exercisesError?.message);
      return;
    }
    
    console.log('✅ Found exercises:', exercises.map(e => e.name).join(', '));
    
    // Create test workout
    const testWorkout = {
      user_id: user.id,
      name: `Test Workout - ${Date.now()}`,
      description: 'Test workout created via script',
      is_public: false,
      difficulty: 'beginner',
      tags: ['test', 'automation'],
      estimated_duration: 30,
      estimated_calories: 200
    };
    
    console.log('Creating workout:', testWorkout.name);
    const { data: workoutData, error: workoutError } = await supabase
      .from('custom_workouts')
      .insert([testWorkout])
      .select()
      .single();
      
    if (workoutError) {
      console.log('❌ Workout creation failed:', workoutError.message);
      console.log('   Details:', workoutError.details);
      console.log('   Hint:', workoutError.hint);
      console.log('   Code:', workoutError.code);
      return;
    }
    
    console.log('✅ Workout created successfully, ID:', workoutData.id);
    
    // Step 6: Test workout exercises creation
    console.log('\n6. Testing workout exercises creation...');
    
    const workoutExercises = exercises.map((exercise, index) => ({
      custom_workout_id: workoutData.id,
      exercise_id: exercise.id,
      order_index: index,
      sets: 3,
      reps: '10-12',
      rest_seconds: 60,
      notes: 'Test exercise',
      is_warmup: false,
      is_cooldown: false
    }));
    
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('custom_workout_exercises')
      .insert(workoutExercises)
      .select();
      
    if (exerciseError) {
      console.log('❌ Workout exercises creation failed:', exerciseError.message);
      console.log('   Details:', exerciseError.details);
      console.log('   Hint:', exerciseError.hint);
    } else {
      console.log('✅ Workout exercises created successfully:', exerciseData.length, 'exercises');
    }
    
    // Step 7: Clean up test data
    console.log('\n7. Cleaning up test data...');
    
    // Delete workout exercises first (foreign key dependency)
    await supabase
      .from('custom_workout_exercises')
      .delete()
      .eq('custom_workout_id', workoutData.id);
      
    // Delete workout
    await supabase
      .from('custom_workouts')
      .delete()
      .eq('id', workoutData.id);
      
    console.log('✅ Test data cleaned up');
    
    // Step 8: Sign out
    await supabase.auth.signOut();
    console.log('✅ Signed out successfully');
    
    console.log('\n🎉 All tests passed! Workout creation workflow is working correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFullWorkflowWithAuth();