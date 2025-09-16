const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function testNewUserLogin() {
  try {
    console.log('🔐 Testing login with new user...');
    
    const testEmail = 'user-1758020492706@fitprove.app';
    const testPassword = 'testpassword123';

    // Try to sign in
    const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      console.log('Error code:', signInError.status);
      return false;
    }

    console.log('✅ Sign in successful!');
    console.log('User:', signInData.user?.email);
    console.log('User ID:', signInData.user?.id);
    console.log('Session exists:', !!signInData.session);
    console.log('Session access token exists:', !!signInData.session?.access_token);

    // Test session persistence
    console.log('\n🔍 Testing session persistence...');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Session persisted successfully!');
      console.log('Session user:', sessionData.session.user?.email);
    } else {
      console.log('❌ No session found after login');
    }

    // Now test if we can save a workout using this session
    console.log('\n💾 Testing workout creation...');
    
    const testWorkout = {
      title: 'Test Workout',
      level: 'beginner',
      goal: 'strength',
      duration_min: 30,
      tags: ['test', 'workout'],
      signature: 'test-signature'
    };

    const { data: workoutData, error: workoutError } = await client
      .from('workouts')
      .insert(testWorkout)
      .select()
      .single();

    if (workoutError) {
      console.log('❌ Workout creation failed:', workoutError.message);
    } else {
      console.log('✅ Workout created successfully!');
      console.log('Workout ID:', workoutData.id);
      console.log('Workout title:', workoutData.title);
    }

    return true;

  } catch (err) {
    console.error('❌ Test error:', err);
    return false;
  }
}

testNewUserLogin();