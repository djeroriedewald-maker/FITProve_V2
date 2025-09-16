// CHECK ACTUAL DATABASE SCHEMA
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchemas() {
  console.log('🔍 CHECKING DATABASE SCHEMAS...\n');
  
  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_columns', {
      table_schema: 'public'
    });
    
    if (tablesError) {
      console.log('Direct table inspection failed, trying alternative method...\n');
      
      // Try to get a single row from each table to see structure
      console.log('1. CUSTOM_WORKOUTS TABLE STRUCTURE:');
      const { data: workoutSample, error: workoutError } = await supabase
        .from('custom_workouts')
        .select('*')
        .limit(1);
        
      if (workoutError) {
        console.log('❌ custom_workouts error:', workoutError.message);
      } else {
        console.log('✅ custom_workouts columns:', workoutSample?.[0] ? Object.keys(workoutSample[0]) : 'No data');
      }
      
      console.log('\n2. CUSTOM_WORKOUT_EXERCISES TABLE STRUCTURE:');
      const { data: exerciseSample, error: exerciseError } = await supabase
        .from('custom_workout_exercises')
        .select('*')
        .limit(1);
        
      if (exerciseError) {
        console.log('❌ custom_workout_exercises error:', exerciseError.message);
      } else {
        console.log('✅ custom_workout_exercises columns:', exerciseSample?.[0] ? Object.keys(exerciseSample[0]) : 'No data');
      }
      
      console.log('\n3. PROFILES TABLE STRUCTURE:');
      const { data: profileSample, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (profileError) {
        console.log('❌ profiles error:', profileError.message);
      } else {
        console.log('✅ profiles columns:', profileSample?.[0] ? Object.keys(profileSample[0]) : 'No data');
      }
      
      // Test minimal insert
      console.log('\n4. TESTING MINIMAL INSERT INTO custom_workouts:');
      const testInsert = {
        user_id: 'test-user-id-123',
        name: 'Test Workout Schema Check',
        description: 'Test description'
      };
      
      const { data: insertTest, error: insertError } = await supabase
        .from('custom_workouts')
        .insert([testInsert])
        .select();
        
      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message);
        console.log('❌ Error details:', insertError.details);
        console.log('❌ Error hint:', insertError.hint);
      } else {
        console.log('✅ Insert test SUCCESS - would work');
        // Clean up test data
        await supabase.from('custom_workouts').delete().eq('id', insertTest[0].id);
      }
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkSchemas();