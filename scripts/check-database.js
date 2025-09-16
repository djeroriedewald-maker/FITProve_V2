// Database Schema Verification Script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  console.log(`🔗 Database: ${supabaseUrl}`);
  
  try {
    // Test 1: Check if exercise_categories table exists
    console.log('\n📋 Test 1: Checking exercise_categories table...');
    const { data: categories, error: catError } = await supabase
      .from('exercise_categories')
      .select('*')
      .limit(1);
    
    if (catError) {
      console.log('❌ exercise_categories table does NOT exist');
      console.log('   Error:', catError.message);
      console.log('   👉 You need to run the SQL schema first!');
      return false;
    } else {
      console.log('✅ exercise_categories table exists');
      console.log(`   Found ${categories?.length || 0} categories`);
    }
    
    // Test 2: Check if exercises table exists
    console.log('\n📋 Test 2: Checking exercises table...');
    const { data: exercises, error: exError } = await supabase
      .from('exercises')
      .select('*')
      .limit(1);
    
    if (exError) {
      console.log('❌ exercises table does NOT exist');
      console.log('   Error:', exError.message);
      console.log('   👉 You need to run the SQL schema first!');
      return false;
    } else {
      console.log('✅ exercises table exists');
      console.log(`   Found ${exercises?.length || 0} exercises`);
    }
    
    // Test 3: Check specific columns exist
    console.log('\n📋 Test 3: Checking critical columns...');
    const { data: testData, error: testError } = await supabase
      .from('exercises')
      .select('id, name, primary_muscles, equipment, difficulty, approval_status')
      .limit(1);
    
    if (testError) {
      console.log('❌ Column structure mismatch');
      console.log('   Error:', testError.message);
      console.log('   👉 Schema may be incomplete or incorrect');
      return false;
    } else {
      console.log('✅ All critical columns exist');
    }
    
    // Test 4: List all tables in the public schema
    console.log('\n📋 Test 4: Listing all tables...');
    const { data: tables, error: tableError } = await supabase.rpc('get_schema_tables', {});
    
    if (!tableError && tables) {
      console.log('📊 Available tables:', tables.map(t => t.table_name).join(', '));
    }
    
    console.log('\n🎉 Database schema verification complete!');
    console.log('✅ Your database is ready for exercise import');
    return true;
    
  } catch (error) {
    console.error('💥 Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Supabase project is active');
    console.log('3. Confirm the URL and API key are correct');
    return false;
  }
}

// Alternative method: Check via direct SQL query
async function checkWithSQL() {
  console.log('\n🔍 Alternative check: Direct SQL query...');
  
  try {
    const { data, error } = await supabase.rpc('check_table_exists', {
      table_name: 'exercises'
    });
    
    if (error) {
      console.log('   Using information_schema query instead...');
      
      // Query information schema
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['exercises', 'exercise_categories']);
      
      if (schemaError) {
        console.log('   ❌ Cannot query schema');
      } else {
        console.log('   📊 Tables found:', schemaData?.map(t => t.table_name) || 'none');
      }
    } else {
      console.log('   ✅ Table check function available');
    }
  } catch (error) {
    console.log('   ❌ SQL check failed:', error.message);
  }
}

async function main() {
  const isReady = await checkDatabaseSchema();
  await checkWithSQL();
  
  if (!isReady) {
    console.log('\n🚨 ACTION REQUIRED:');
    console.log('1. Open Supabase Dashboard: https://app.supabase.com');
    console.log('2. Go to SQL Editor → New Query');
    console.log('3. Copy and run the contents of setup-exercise-database-fixed.sql');
    console.log('4. Run this check script again to verify');
    process.exit(1);
  } else {
    console.log('\n🚀 Ready to import exercises!');
    console.log('Run: node import-exercises.js');
  }
}

main();