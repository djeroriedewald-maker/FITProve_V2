// QUICK CHECK VAN HUIDIGE DATABASE STATUS
// Run dit in terminal: node check-current-db-status.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStatus() {
  console.log('🔍 CHECKING DATABASE STATUS...\n');
  
  try {
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('1. AUTH SESSION:');
    console.log(`   Session: ${session ? '✅ Found' : '❌ None'}`);
    console.log(`   User: ${session?.user?.email || 'None'}`);
    console.log(`   Error: ${sessionError?.message || 'None'}\n`);
    
    // Check RLS policies for important tables
    console.log('2. DATABASE TABLE ACCESS:');
    
    // Test custom_workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from('custom_workouts')
      .select('id')
      .limit(1);
    
    console.log(`   custom_workouts: ${workoutsError ? '❌ ' + workoutsError.message : '✅ Accessible'}`);
    
    // Test profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    console.log(`   profiles: ${profilesError ? '❌ ' + profilesError.message : '✅ Accessible'}`);
    
    // Test exercises  
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('id')
      .limit(1);
    
    console.log(`   exercises: ${exercisesError ? '❌ ' + exercisesError.message : '✅ Accessible'}\n`);
    
    console.log('3. CONCLUSION:');
    if (session && !workoutsError && !profilesError && !exercisesError) {
      console.log('   ✅ DATABASE SETUP IS CORRECT - NO SQL SCRIPT NEEDED!');
      console.log('   ✅ Authentication working');
      console.log('   ✅ All tables accessible');
      console.log('\n   👉 Save Workout should work now!');
    } else {
      console.log('   ❌ ISSUES FOUND - RUN THE SQL SCRIPT:');
      console.log('   📝 Open FIX_DATABASE_RLS.sql and run it in Supabase dashboard');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
    console.log('📝 Run the SQL script to fix database setup');
  }
}

checkDatabaseStatus();