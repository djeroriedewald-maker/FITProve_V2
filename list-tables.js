const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  console.log('🔍 Listing all tables...');
  
  // Try some common table names that might contain workout data
  const possibleTables = ['sessions', 'workout_sessions', 'workouts', 'user_workouts', 'exercises', 'profiles', 'posts'];
  
  for (const tableName of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ ${tableName}: Found (${data.length} sample records)`);
        if (data[0]) {
          console.log(`   Sample columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`);
    }
  }
}

listTables();