const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuthenticationState() {
  console.log('🔍 DEBUGGING AUTHENTICATION STATE\n');
  
  try {
    // 1. Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found:');
      console.log('   User ID:', session.user.id);
      console.log('   Email:', session.user.email);
      console.log('   Email confirmed:', session.user.email_confirmed_at ? '✅ Yes' : '❌ No');
      console.log('   Role:', session.user.role);
      
      // Test RLS with this user
      const userId = session.user.id;
      
      console.log('\n2. Testing RLS access with current user...');
      
      // Try to insert a test workout
      const { data: testWorkout, error: workoutError } = await supabase
        .from('custom_workouts')
        .insert({
          name: 'Test Workout Debug',
          description: 'Test workout for debugging authentication',
          user_id: userId,
          is_public: false,
          exercises: []
        })
        .select()
        .single();
        
      if (workoutError) {
        console.log('❌ Workout insert failed:', workoutError.message);
        console.log('   Error code:', workoutError.code);
        console.log('   Error details:', workoutError.details);
        
        // Check if it's an RLS policy issue
        if (workoutError.message.includes('policy')) {
          console.log('🚨 RLS POLICY ISSUE DETECTED');
          console.log('   This means auth.uid() is not matching the user_id');
        }
      } else {
        console.log('✅ Workout insert successful:', testWorkout.id);
        
        // Clean up - delete the test workout
        await supabase
          .from('custom_workouts')
          .delete()
          .eq('id', testWorkout.id);
        console.log('🗑️ Test workout cleaned up');
      }
      
    } else {
      console.log('❌ No active session');
    }
    
    // 3. Check profiles
    console.log('\n3. Checking profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(5);
      
    if (profilesError) {
      console.log('❌ Profiles error:', profilesError.message);
    } else {
      console.log('✅ Profiles found:', profiles.length);
      profiles.forEach(p => {
        console.log(`   - ${p.email} (${p.name}) - ID: ${p.id}`);
      });
    }
    
    // 4. Test auth.uid() function
    console.log('\n4. Testing auth.uid() function...');
    const { data: authUidTest, error: authUidError } = await supabase
      .rpc('auth_uid_test');
      
    if (authUidError && !authUidError.message.includes('function auth_uid_test() does not exist')) {
      console.log('❌ auth.uid() test error:', authUidError.message);
    } else if (authUidError) {
      console.log('ℹ️ Need to create auth.uid() test function (expected)');
    } else {
      console.log('✅ auth.uid() result:', authUidTest);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    if (session && profiles.length > 0) {
      const userProfile = profiles.find(p => p.id === session.user.id);
      if (userProfile) {
        console.log('✅ User has both auth session AND profile');
        console.log('✅ Authentication should work - likely an RLS policy issue');
      } else {
        console.log('❌ User has auth session but NO matching profile');
        console.log('🔧 SOLUTION: Create profile for authenticated user');
      }
    } else if (session) {
      console.log('❌ User has auth session but no profiles table access');
    } else {
      console.log('❌ No authenticated user found');
      console.log('🔧 SOLUTION: User needs to sign in through the app');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugAuthenticationState();