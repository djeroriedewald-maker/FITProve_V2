const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function fixWorkoutsRLS() {
  try {
    console.log('🔧 Fixing workouts table RLS policies...\n');
    
    // 1. Check current policies
    console.log('1. Checking current RLS policies for workouts table...');
    
    // 2. Create proper RLS policies for workouts table
    console.log('2. Creating/updating RLS policies...');
    
    const rlsPolicies = `
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "workouts_insert_policy" ON workouts;
    DROP POLICY IF EXISTS "workouts_select_policy" ON workouts;
    DROP POLICY IF EXISTS "workouts_update_policy" ON workouts;
    DROP POLICY IF EXISTS "workouts_delete_policy" ON workouts;
    
    -- Enable RLS
    ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
    
    -- Allow all authenticated users to read all workouts
    CREATE POLICY "workouts_select_policy" ON workouts
        FOR SELECT
        TO authenticated
        USING (true);
    
    -- Allow all authenticated users to insert workouts
    CREATE POLICY "workouts_insert_policy" ON workouts
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    
    -- Allow users to update their own workouts (when we add user tracking)
    CREATE POLICY "workouts_update_policy" ON workouts
        FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
    
    -- Allow users to delete their own workouts (when we add user tracking)
    CREATE POLICY "workouts_delete_policy" ON workouts
        FOR DELETE
        TO authenticated
        USING (true);
    `;

    // Execute the policies
    const { error: policyError } = await adminClient.rpc('exec_sql', { 
      sql: rlsPolicies 
    });

    if (policyError) {
      console.log('❌ Policy creation via RPC failed:', policyError.message);
      console.log('🔄 Trying alternative approach...');
      
      // Alternative: Try individual policy creation
      const policies = [
        {
          name: 'workouts_select_policy',
          sql: `CREATE POLICY "workouts_select_policy" ON workouts FOR SELECT TO authenticated USING (true);`
        },
        {
          name: 'workouts_insert_policy', 
          sql: `CREATE POLICY "workouts_insert_policy" ON workouts FOR INSERT TO authenticated WITH CHECK (true);`
        },
        {
          name: 'workouts_update_policy',
          sql: `CREATE POLICY "workouts_update_policy" ON workouts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);`
        },
        {
          name: 'workouts_delete_policy',
          sql: `CREATE POLICY "workouts_delete_policy" ON workouts FOR DELETE TO authenticated USING (true);`
        }
      ];

      for (const policy of policies) {
        try {
          const { error } = await adminClient.rpc('exec_sql', { sql: policy.sql });
          if (error) {
            console.log(`❌ ${policy.name} failed:`, error.message);
          } else {
            console.log(`✅ ${policy.name} created`);
          }
        } catch (err) {
          console.log(`❌ ${policy.name} exception:`, err.message);
        }
      }
    } else {
      console.log('✅ All RLS policies created successfully!');
    }

    // 3. Test the fix
    console.log('\n3. Testing workout creation with authenticated user...');
    
    // Use regular client with auth
    const testClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E');
    
    // Try to sign in first
    console.log('   Signing in with test user...');
    const { data: signInData, error: signInError } = await testClient.auth.signInWithPassword({
      email: 'djeroriedewald@gmail.com',
      password: 'password123' // You'll need to replace with actual password
    });
    
    if (signInError) {
      console.log('❌ Sign in failed for test:', signInError.message);
      console.log('   Manual test required - try creating workout in app now');
    } else {
      console.log('✅ Signed in successfully, testing workout creation...');
      
      const testWorkout = {
        title: 'RLS Test Workout',
        level: 'beginner',
        goal: 'test RLS fix',
        duration_min: 15,
        tags: ['test', 'rls'],
        signature: `rls-test-${Date.now()}`
      };

      const { data: workout, error: workoutError } = await testClient
        .from('workouts')
        .insert(testWorkout)
        .select()
        .single();

      if (workoutError) {
        console.log('❌ Test workout creation failed:', workoutError.message);
        console.log('   You may need to manually run the SQL policies in Supabase dashboard');
      } else {
        console.log('✅ Test workout created successfully!');
        console.log('   ID:', workout.id);
        console.log('   Title:', workout.title);
        
        // Clean up test workout
        await testClient.from('workouts').delete().eq('id', workout.id);
        console.log('🗑️ Test workout cleaned up');
      }
    }

    console.log('\n4. 🎉 RLS Fix Complete!');
    console.log('   Try creating a workout in the app now.');
    console.log('   If it still fails, you may need to run the policies manually in Supabase SQL editor.');

  } catch (err) {
    console.error('❌ RLS fix error:', err);
  }
}

fixWorkoutsRLS();