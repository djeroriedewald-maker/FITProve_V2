// COMPREHENSIVE TEST OF CURRENT STATE
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

async function testCurrentState() {
  console.log('🔍 COMPREHENSIVE TEST OF CURRENT STATE...\n');
  
  try {
    // Test 1: Basic client connection
    console.log('1. TESTING BASIC CONNECTION:');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test exercises table (should be public)
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);
      
    if (exercisesError) {
      console.log('❌ Exercises table error:', exercisesError.message);
    } else {
      console.log('✅ Exercises table accessible');
    }
    
    // Test 2: Auth-required tables without session
    console.log('\n2. TESTING AUTH TABLES WITHOUT SESSION:');
    const { data: workouts, error: workoutsError } = await supabase
      .from('custom_workouts')
      .select('id')
      .limit(1);
      
    if (workoutsError) {
      console.log('❌ Custom workouts (expected):', workoutsError.message);
    } else {
      console.log('✅ Custom workouts accessible without auth (unexpected)');
    }
    
    // Test 3: Client with session persistence
    console.log('\n3. TESTING CLIENT WITH SESSION PERSISTENCE:');
    const supabaseWithSession = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'fitprove-auth-token',
        flowType: 'pkce'
      }
    });
    
    const { data: { session }, error: sessionError } = await supabaseWithSession.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session?.user) {
      console.log('✅ Session found!');
      console.log('  User ID:', session.user.id);
      console.log('  Email:', session.user.email);
      
      // Test authenticated database access
      console.log('\n4. TESTING AUTHENTICATED DATABASE ACCESS:');
      const { data: authWorkouts, error: authWorkoutsError } = await supabaseWithSession
        .from('custom_workouts')
        .select('id')
        .limit(1);
        
      if (authWorkoutsError) {
        console.log('❌ Authenticated workouts error:', authWorkoutsError.message);
      } else {
        console.log('✅ Authenticated workouts accessible');
      }
      
      // Test workout creation
      console.log('\n5. TESTING WORKOUT CREATION:');
      const testWorkout = {
        user_id: session.user.id,
        name: 'Test Workout - Current State',
        description: 'Testing current state',
        is_public: false
      };
      
      const { data: newWorkout, error: createError } = await supabaseWithSession
        .from('custom_workouts')
        .insert([testWorkout])
        .select()
        .single();
        
      if (createError) {
        console.log('❌ Workout creation error:', createError.message);
        console.log('❌ Error details:', createError.details);
        console.log('❌ Error hint:', createError.hint);
        console.log('❌ Error code:', createError.code);
      } else {
        console.log('✅ WORKOUT CREATION SUCCESS!');
        console.log('  Created workout:', newWorkout);
        
        // Cleanup
        await supabaseWithSession.from('custom_workouts').delete().eq('id', newWorkout.id);
        console.log('🧹 Test workout cleaned up');
      }
      
    } else {
      console.log('❌ No session found - user not logged in');
    }
    
    console.log('\n6. SUMMARY:');
    console.log('==========================================');
    if (session?.user && !createError) {
      console.log('✅ ALL SYSTEMS WORKING - SAVE WORKOUT SHOULD WORK!');
    } else if (!session?.user) {
      console.log('❌ USER NOT LOGGED IN - NEED TO SIGN IN FIRST');
    } else if (createError) {
      console.log('❌ DATABASE/RLS ISSUE - NEED TO CHECK:');
      console.log('   - RLS policies');
      console.log('   - User profile exists');
      console.log('   - Session token validity');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCurrentState();