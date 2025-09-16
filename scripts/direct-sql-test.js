// Direct SQL Test for Schema Verification
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function directSQLTest() {
  console.log('🔍 Testing direct SQL queries...');
  
  try {
    // Test 1: Simple table existence check via SQL
    console.log('\n📋 Test 1: Checking tables via raw SQL...');
    const { data: tableData, error: tableError } = await supabase
      .rpc('check_tables', {}, { count: 'exact' });
    
    if (tableError) {
      console.log('   RPC function not available, trying direct query...');
      
      // Test 2: Direct SELECT to see if table exists
      console.log('\n📋 Test 2: Direct SELECT test...');
      const { data: selectData, error: selectError } = await supabase
        .from('exercise_categories')
        .select('count(*)')
        .single();
      
      if (selectError) {
        console.log('   ❌ exercise_categories not accessible:', selectError.message);
      } else {
        console.log('   ✅ exercise_categories table exists and accessible!');
        console.log('   📊 Data:', selectData);
      }
      
      // Test 3: Try exercises table
      console.log('\n📋 Test 3: Testing exercises table...');
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('count(*)')
        .single();
      
      if (exerciseError) {
        console.log('   ❌ exercises table not accessible:', exerciseError.message);
      } else {
        console.log('   ✅ exercises table exists and accessible!');
        console.log('   📊 Data:', exerciseData);
      }
    }
    
    // Test 4: Try to insert a simple exercise
    console.log('\n📋 Test 4: Attempting test insert...');
    const testExercise = {
      name: 'Schema Test Exercise',
      slug: 'schema-test-exercise',
      description: 'Testing if schema works',
      instructions: ['Test instruction'],
      primary_muscles: ['chest'],
      secondary_muscles: [],
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      category_id: 'strength',
      tags: ['test'],
      approval_status: 'approved',
      is_active: true,
      is_featured: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('exercises')
      .insert([testExercise])
      .select()
      .single();
    
    if (insertError) {
      console.log('   ❌ Insert failed:', insertError.message);
      console.log('   💡 This tells us what column/constraint is missing');
    } else {
      console.log('   ✅ Insert successful! Schema is working!');
      console.log('   📋 Inserted exercise:', insertData.name);
      
      // Clean up test exercise
      await supabase.from('exercises').delete().eq('id', insertData.id);
      console.log('   🧹 Test exercise cleaned up');
    }
    
  } catch (error) {
    console.error('💥 Direct SQL test failed:', error);
  }
}

async function checkPermissions() {
  console.log('\n🔐 Checking permissions...');
  
  try {
    // Check what we can access
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('   👤 No authenticated user (using anon access)');
    } else {
      console.log('   👤 Authenticated user:', userData.user?.email || 'Unknown');
    }
    
    // Test basic auth functions
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('   🔑 Session status:', sessionData.session ? 'Active' : 'None');
    
  } catch (error) {
    console.log('   ❌ Permission check failed:', error.message);
  }
}

async function main() {
  await directSQLTest();
  await checkPermissions();
  
  console.log('\n🎯 Summary:');
  console.log('If the schema is working, we should see successful operations above.');
  console.log('If not, we need to troubleshoot the specific error messages.');
}

main();