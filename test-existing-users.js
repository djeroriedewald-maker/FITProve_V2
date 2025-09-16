const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testExistingUsers() {
  console.log('🔍 Testing existing user authentication...\n');
  
  try {
    // Check what users exist in the profiles table
    console.log('1. Checking existing profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name, created_at')
      .limit(5);
      
    if (profilesError) {
      console.log('❌ Error accessing profiles:', profilesError.message);
      return;
    }
    
    console.log('✅ Found', profiles.length, 'profiles:');
    profiles.forEach(profile => {
      console.log(`   - ${profile.email} (${profile.name}) - Created: ${new Date(profile.created_at).toLocaleDateString()}`);
    });
    
    // Check confirmed users in auth.users
    console.log('\n2. Checking confirmed auth users...');
    const { data: authUsers, error: authError } = await supabase
      .rpc('get_confirmed_users');
      
    if (authError) {
      console.log('❌ Cannot check auth users directly (expected - need custom function)');
      console.log('   Let\'s check if we can authenticate with an existing profile...');
    }
    
    // If we have profiles, let's try to test authentication flow
    if (profiles.length > 0) {
      console.log('\n3. Testing authentication flow...');
      console.log('   You can test sign-in with any of the profiles listed above');
      console.log('   Common development emails to try:');
      console.log('   - admin@fitprove.com');
      console.log('   - test@fitprove.com'); 
      console.log('   - dev@fitprove.com');
      console.log('   - user@fitprove.com');
    }
    
    // Check if workout tables are accessible
    console.log('\n4. Testing workout table access (anonymous)...');
    const { data: workouts, error: workoutsError } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id, is_public')
      .limit(3);
      
    if (workoutsError) {
      console.log('❌ Custom workouts error:', workoutsError.message);
    } else {
      console.log('✅ Can access custom workouts table:', workouts.length, 'workouts found');
      if (workouts.length > 0) {
        console.log('   Sample workouts:');
        workouts.forEach(w => {
          console.log(`   - "${w.name}" by user ${w.user_id} (public: ${w.is_public})`);
        });
      }
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Try signing in with one of the existing profile emails');
    console.log('2. Check the browser console for authentication status');
    console.log('3. The user should appear as "✓ Signed In" in the workout creator');
    console.log('4. If sign-in works, the Save Workout should function properly');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testExistingUsers();