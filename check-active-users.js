const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkActiveUsers() {
  try {
    console.log('🔍 Checking active users with service_role access...\n');
    
    // 1. Check auth.users table
    console.log('1. Auth Users Table:');
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth users error:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users:`);
      authUsers.users.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.email}`);
        console.log(`      - ID: ${user.id}`);
        console.log(`      - Created: ${user.created_at}`);
        console.log(`      - Last sign in: ${user.last_sign_in_at || 'Never'}`);
        console.log(`      - Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`      - Confirmed at: ${user.email_confirmed_at || 'Not confirmed'}`);
        console.log('');
      });
    }

    // 2. Check profiles table
    console.log('2. Profiles Table:');
    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('*');
    
    if (profileError) {
      console.log('❌ Profiles error:', profileError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles:`);
      profiles.forEach((profile, i) => {
        console.log(`   ${i+1}. ${profile.name || profile.display_name || 'No name'}`);
        console.log(`      - Email: ${profile.email}`);
        console.log(`      - ID: ${profile.id}`);
        console.log(`      - Created: ${profile.created_at}`);
        console.log('');
      });
    }

    // 3. Check if djeroriedewald@gmail.com specifically exists
    console.log('3. Checking specific user: djeroriedewald@gmail.com');
    
    const targetEmail = 'djeroriedewald@gmail.com';
    const targetUser = authUsers.users?.find(u => u.email === targetEmail);
    
    if (targetUser) {
      console.log('✅ Target user found in auth.users:');
      console.log(`   - ID: ${targetUser.id}`);
      console.log(`   - Email confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
      console.log(`   - Last sign in: ${targetUser.last_sign_in_at}`);
      
      // Check if profile exists
      const { data: targetProfile, error: targetProfileError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('email', targetEmail)
        .single();
      
      if (targetProfileError) {
        console.log('❌ No profile found for target user');
        
        // Create profile for target user
        console.log('🔧 Creating profile for target user...');
        const { data: newProfile, error: createError } = await adminClient
          .from('profiles')
          .insert({
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.user_metadata?.full_name || 'Djero Riedewald',
            display_name: targetUser.user_metadata?.full_name || 'Djero Riedewald',
            username: 'djero',
            bio: '',
            avatar_url: targetUser.user_metadata?.avatar_url || '',
            fitness_goals: [],
            level: 1,
            stats: {
              workoutsCompleted: 0,
              totalMinutes: 0,
              streakDays: 0,
              achievementsCount: 0,
              followersCount: 0,
              followingCount: 0
            }
          })
          .select();
        
        if (createError) {
          console.log('❌ Error creating profile:', createError.message);
        } else {
          console.log('✅ Profile created successfully!');
        }
      } else {
        console.log('✅ Profile exists for target user:', targetProfile.name);
      }
    } else {
      console.log('❌ Target user not found in auth.users');
    }

    // 4. Test anonymous session (what the app sees)
    console.log('\n4. Testing what the app sees (anonymous client):');
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E');
    
    const { data: sessionData, error: sessionError } = await anonClient.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Active session found!');
      console.log(`   - User: ${sessionData.session.user.email}`);
      console.log(`   - Expires: ${new Date(sessionData.session.expires_at * 1000)}`);
    } else {
      console.log('❌ No active session found');
    }

  } catch (err) {
    console.error('❌ Check error:', err);
  }
}

checkActiveUsers();