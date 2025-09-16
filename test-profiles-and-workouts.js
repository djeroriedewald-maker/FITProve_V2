// CHECK AUTH USERS EN SYNC PROFILES
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthAndProfiles() {
  console.log('🔍 CHECKING AUTH USERS AND PROFILES...\n');
  
  try {
    // Check auth.users (need admin access for this)
    console.log('1. CHECKING PROFILES TABLE:');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles?.length || 0} profiles`);
      if (profiles?.length) {
        console.log('Profile IDs:', profiles.map(p => p.id));
      }
    }
    
    // Try creating a test profile manually
    console.log('\n2. CREATING TEST PROFILE:');
    const testProfile = {
      id: '12345678-1234-1234-1234-123456789012', // Valid UUID format
      email: 'test@example.com',
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select();
      
    if (createError) {
      console.log('❌ Profile creation error:', createError.message);
      console.log('❌ Error details:', createError.details);
    } else {
      console.log('✅ Test profile created:', newProfile[0]);
      
      // Now test workout creation with this profile ID
      console.log('\n3. TESTING WORKOUT CREATION:');
      const testWorkout = {
        user_id: testProfile.id,
        name: 'Test Workout',
        description: 'Test description'
      };
      
      const { data: workout, error: workoutError } = await supabase
        .from('custom_workouts')
        .insert([testWorkout])
        .select();
        
      if (workoutError) {
        console.log('❌ Workout creation error:', workoutError.message);
        console.log('❌ Error details:', workoutError.details);
      } else {
        console.log('✅ WORKOUT CREATED SUCCESSFULLY!');
        console.log('✅ Workout:', workout[0]);
        
        // Cleanup
        await supabase.from('custom_workouts').delete().eq('id', workout[0].id);
        console.log('🧹 Workout cleaned up');
      }
      
      // Cleanup profile
      await supabase.from('profiles').delete().eq('id', testProfile.id);
      console.log('🧹 Profile cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkAuthAndProfiles();