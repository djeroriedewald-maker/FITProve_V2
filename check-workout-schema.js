const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkWorkoutTables() {
  try {
    console.log('🔍 Checking workout table schemas...\n');
    
    // 1. Check if custom_workouts table exists and its structure
    console.log('1. Checking custom_workouts table:');
    try {
      const { data: customWorkouts, error: customError } = await adminClient
        .from('custom_workouts')
        .select('*')
        .limit(1);
      
      if (customError) {
        console.log('❌ custom_workouts error:', customError.message);
      } else {
        console.log('✅ custom_workouts table exists');
        if (customWorkouts && customWorkouts.length > 0) {
          console.log('   Columns:', Object.keys(customWorkouts[0]));
        } else {
          console.log('   Table is empty - cannot determine columns');
        }
      }
    } catch (err) {
      console.log('❌ custom_workouts table does not exist or is inaccessible');
    }

    // 2. Check the regular workouts table
    console.log('\n2. Checking workouts table:');
    try {
      const { data: workouts, error: workoutError } = await adminClient
        .from('workouts')
        .select('*')
        .limit(1);
      
      if (workoutError) {
        console.log('❌ workouts error:', workoutError.message);
      } else {
        console.log('✅ workouts table exists');
        if (workouts && workouts.length > 0) {
          console.log('   Columns:', Object.keys(workouts[0]));
        } else {
          console.log('   Table is empty - cannot determine columns');
          
          // Try to insert a test record to see the schema
          console.log('   Attempting schema discovery...');
          const { error: insertError } = await adminClient
            .from('workouts')
            .insert({
              title: 'Schema Test',
              level: 'beginner',
              goal: 'test',
              duration_min: 1,
              tags: [],
              signature: 'test'
            })
            .select();
          
          if (insertError) {
            console.log('   Insert error reveals schema:', insertError.message);
          } else {
            console.log('   ✅ Successfully inserted test record');
          }
        }
      }
    } catch (err) {
      console.log('❌ workouts table error:', err.message);
    }

    // 3. Check for alternative workout tables
    console.log('\n3. Checking for other workout-related tables:');
    const tablesToCheck = [
      'workout_templates',
      'user_workouts', 
      'created_workouts',
      'my_workouts'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await adminClient.from(tableName).select('*').limit(1);
        if (!error) {
          console.log(`✅ ${tableName} table exists`);
          if (data && data.length > 0) {
            console.log(`   Columns:`, Object.keys(data[0]));
          }
        }
      } catch (err) {
        // Table doesn't exist, skip
      }
    }

    // 4. Show solution
    console.log('\n4. 🔧 SOLUTION:');
    console.log('Based on our earlier analysis, we know the workouts table has these columns:');
    console.log('- id, title, level, goal, duration_min, tags, signature, created_at');
    console.log('\nThe WorkoutCreatorService should use the "workouts" table, not "custom_workouts"');
    console.log('OR we need to create the custom_workouts table with the right schema.');

  } catch (err) {
    console.error('❌ Check error:', err);
  }
}

checkWorkoutTables();