// SIMPLE AUTH TEST - Run this after executing the RLS setup script
const { createClient } = require('@supabase/supabase-js');

// You'll need to add your real Supabase credentials here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.log('⚠️  PLEASE UPDATE SUPABASE CREDENTIALS IN THIS FILE FIRST');
  console.log('⚠️  Find them in your .env file or Supabase dashboard');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testing Supabase connection and auth...');
  
  try {
    // Test 1: Check auth users
    console.log('\n1️⃣ Checking auth users...');
    const { data: session } = await supabase.auth.getSession();
    console.log('Current session:', !!session.session);
    
    // Test 2: Check profiles table
    console.log('\n2️⃣ Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Profiles error:', profilesError);
    } else {
      console.log('✅ Profiles found:', profiles?.length || 0);
      profiles?.forEach(p => console.log(`  - ${p.email} (${p.name})`));
    }
    
    // Test 3: Check custom_workouts table access
    console.log('\n3️⃣ Checking workout table access...');
    const { data: workouts, error: workoutsError } = await supabase
      .from('custom_workouts')
      .select('id, name, user_id')
      .limit(3);
    
    if (workoutsError) {
      console.log('❌ Workouts error:', workoutsError);
    } else {
      console.log('✅ Workouts accessible:', workouts?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();