const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function checkWorkoutSchema() {
  try {
    console.log('🔍 Checking workouts table schema...\n');
    
    // Get the first workout to see available columns
    const { data: workouts, error } = await adminClient
      .from('workouts')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }
    
    if (workouts && workouts.length > 0) {
      console.log('📋 Available columns in workouts table:');
      const columns = Object.keys(workouts[0]);
      columns.forEach(column => {
        const value = workouts[0][column];
        const type = typeof value;
        console.log(`   ${column}: ${type} = ${value}`);
      });
      
      console.log('\n🎯 Checking for image and description fields:');
      console.log('   hero_image_url:', columns.includes('hero_image_url') ? '✅ Found' : '❌ Missing');
      console.log('   description:', columns.includes('description') ? '✅ Found' : '❌ Missing');
      console.log('   goal:', columns.includes('goal') ? '✅ Found (maps to description)' : '❌ Missing');
      
    } else {
      console.log('📋 No workouts found in table, checking schema via information_schema...');
      
      // Alternative: Query table structure
      const { data: columns, error: schemaError } = await adminClient.rpc('sql', {
        query: `
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'workouts' 
          ORDER BY ordinal_position;
        `
      });
      
      if (schemaError) {
        console.log('❌ Schema query error:', schemaError.message);
      } else {
        console.log('📋 Workouts table columns:');
        columns?.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
      }
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkWorkoutSchema();