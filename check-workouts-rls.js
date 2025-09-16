const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function checkWorkoutsRLS() {
  try {
    console.log('🔍 Checking workouts table RLS status...\n');
    
    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await adminClient
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'workouts');
      
    if (rlsError) {
      console.log('❌ Could not check RLS status:', rlsError.message);
    } else {
      console.log('📋 RLS Status:', rlsStatus);
    }

    // Check existing policies
    const { data: policies, error: policiesError } = await adminClient.rpc('sql', {
      query: `
        SELECT 
          pol.polname as policy_name,
          pol.polcmd as policy_command,
          pol.polroles::regrole[] as policy_roles
        FROM pg_policy pol
        JOIN pg_class pc ON pol.polrelid = pc.oid
        WHERE pc.relname = 'workouts'
        ORDER BY pol.polname;
      `
    });

    if (policiesError) {
      console.log('❌ Could not check policies:', policiesError.message);
    } else {
      console.log('📋 Current RLS Policies for workouts table:');
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`   - ${policy.policy_name} (${policy.policy_command})`);
        });
      } else {
        console.log('   ❌ NO POLICIES FOUND - This is the problem!');
      }
    }

    console.log('\n💡 SOLUTION:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Copy and paste the content from FIX_WORKOUTS_RLS.sql');
    console.log('3. Click "Run" to execute the SQL');
    console.log('4. Try creating a workout again');

  } catch (err) {
    console.error('❌ Check error:', err);
  }
}

checkWorkoutsRLS();