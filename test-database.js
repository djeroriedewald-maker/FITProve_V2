const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    // Check profiles table
    console.log('🔍 Checking profiles table...');
    const { data: profiles, error: profileError } = await client
      .from('profiles')
      .select('id, name, email, username')
      .limit(5);
    
    if (profileError) {
      console.log('❌ Profiles error:', profileError.message);
    } else {
      console.log('✅ Profiles found:', profiles?.length || 0);
      profiles?.forEach(p => console.log(`  - ${p.name} (${p.email})`));
    }

    // Check workouts table
    console.log('\n🏋️ Checking workouts table...');
    const { data: workouts, error: workoutError } = await client
      .from('workouts')
      .select('id, name, user_id')
      .limit(5);
    
    if (workoutError) {
      console.log('❌ Workouts error:', workoutError.message);
    } else {
      console.log('✅ Workouts found:', workouts?.length || 0);
      workouts?.forEach(w => console.log(`  - ${w.name} (user: ${w.user_id})`));
    }

    // Check exercises table  
    console.log('\n💪 Checking exercises table...');
    const { data: exercises, error: exerciseError } = await client
      .from('exercises')
      .select('id, name, category')
      .limit(5);
    
    if (exerciseError) {
      console.log('❌ Exercises error:', exerciseError.message);
    } else {
      console.log('✅ Exercises found:', exercises?.length || 0);
      exercises?.forEach(e => console.log(`  - ${e.name} (${e.category})`));
    }

  } catch (err) {
    console.error('❌ Database check error:', err);
  }
}

checkDatabase();