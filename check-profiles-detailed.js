const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure and data...\n');
  
  try {
    // Check if profiles table exists and its structure
    console.log('1. Checking profiles table structure...');
    const { data: profilesCheck, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
      
      // Let's check what tables DO exist
      console.log('\n2. Checking what tables exist...');
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names'); // This might not work, but let's try
        
      if (tablesError) {
        console.log('❌ Cannot list tables directly');
        
        // Let's try some common table names
        const tablesToCheck = ['custom_workouts', 'custom_workout_exercises', 'exercises', 'users', 'user_profiles'];
        
        for (const table of tablesToCheck) {
          try {
            const { data, error } = await supabase
              .from(table)
              .select('*')
              .limit(1);
              
            if (error) {
              console.log(`❌ Table "${table}": ${error.message}`);
            } else {
              console.log(`✅ Table "${table}": accessible, has ${data?.length || 0} sample records`);
            }
          } catch (e) {
            console.log(`❌ Table "${table}": ${e.message}`);
          }
        }
      }
    } else {
      console.log('✅ Profiles table exists');
      
      // Check if there are any users in auth.users that don't have profiles
      console.log('\n2. Let\'s create a test profile to see if the flow works...');
      
      // Try to get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log('✅ Found authenticated user:', user.email);
        
        // Try to get or create profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.log('❌ No profile found, trying to create one...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email.split('@')[0]
            })
            .select()
            .single();
            
          if (createError) {
            console.log('❌ Error creating profile:', createError.message);
          } else {
            console.log('✅ Created new profile:', newProfile);
          }
        } else {
          console.log('✅ Found existing profile:', profile);
        }
      } else {
        console.log('❌ No authenticated user found');
        console.log('   This means we need to sign in first');
      }
    }
    
    console.log('\n🎯 ANALYSIS:');
    console.log('Based on the results above, the issue might be:');
    console.log('1. No users have signed up yet (profiles table empty)');
    console.log('2. Users exist in auth.users but profiles weren\'t created');
    console.log('3. There\'s a naming/structure issue with the profiles table');
    console.log('\nTo fix this, you should:');
    console.log('1. Try signing up a new user through your app');
    console.log('2. Or manually create a test user with SQL');
    console.log('3. Check the browser for sign-in functionality');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabaseStructure();