const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSessions() {
  console.log('🔍 Checking sessions table...');
  
  // Try to get the table structure from information_schema
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'sessions')
    .eq('table_schema', 'public');
    
  if (error) {
    console.log('❌ Error getting columns from information_schema:', error);
  } else {
    console.log('📋 Sessions table columns:');
    data.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  }
  
  // Also check if we have any workout_sessions table instead
  const { data: workoutData, error: workoutError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'workout_sessions')
    .eq('table_schema', 'public');
    
  if (!workoutError && workoutData.length > 0) {
    console.log('📋 Found workout_sessions table columns:');
    workoutData.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
  } else {
    console.log('❌ No workout_sessions table found');
  }
  
  // Check for any tables that might contain workout data
  const { data: tablesData, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .like('table_name', '%workout%');
    
  if (!tablesError && tablesData.length > 0) {
    console.log('📋 Found workout-related tables:');
    tablesData.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
  }
}

checkSessions();