const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestProfile() {
  console.log('🔧 Creating a test profile for workout testing...\n');
  
  try {
    // Generate a UUID for test user
    const testUserId = 'a0e8400e-29b0-41d4-a716-446655440000'; // Fixed UUID for testing
    
    console.log('1. Creating test profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        email: 'testworkout@fitprove.com',
        name: 'Test Workout User',
        username: 'testworkout',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
    } else {
      console.log('✅ Test profile created:', profile.id);
    }
    
    console.log('\n2. Testing workout creation with test profile...');
    const { data: testWorkout, error: workoutError } = await supabase
      .from('custom_workouts')
      .insert({
        name: 'Test Profile Workout',
        description: 'Testing workout creation with profile ID',
        user_id: testUserId,
        is_public: false,
        difficulty: 'beginner',
        tags: ['test'],
        estimated_duration: 30,
        estimated_calories: 200
      })
      .select()
      .single();
      
    if (workoutError) {
      console.log('❌ Workout creation failed:', workoutError.message);
      console.log('❌ Error details:', workoutError);
    } else {
      console.log('✅ Test workout created successfully:', testWorkout.id);
      
      // Clean up
      await supabase.from('custom_workouts').delete().eq('id', testWorkout.id);
      console.log('🗑️ Test workout cleaned up');
    }
    
    console.log('\n🎯 RESULTS:');
    console.log('Profile ID to use in browser:', testUserId);
    console.log('You can use this profile ID for testing workout creation');
    
    // Check if there are any existing profiles
    console.log('\n3. Checking existing profiles...');
    const { data: existingProfiles, error: listError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(10);
      
    if (listError) {
      console.log('❌ Error listing profiles:', listError.message);
    } else {
      console.log('📋 Existing profiles:');
      existingProfiles.forEach(p => {
        console.log(`   - ${p.email} (${p.name}) - ID: ${p.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestProfile();