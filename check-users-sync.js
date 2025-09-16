const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function checkUsersAndProfiles() {
  try {
    console.log('🔍 Checking Auth Users vs Profiles...\n');
    
    // First, let's see what we can access about auth users
    console.log('1. Checking current session...');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Current session found!');
      console.log('   User:', sessionData.session.user?.email);
      console.log('   User ID:', sessionData.session.user?.id);
    } else {
      console.log('❌ No current session');
    }

    // Check profiles table
    console.log('\n2. Checking profiles table...');
    const { data: profiles, error: profileError } = await client
      .from('profiles')
      .select('id, name, display_name, email, username, created_at');
    
    if (profileError) {
      console.log('❌ Profiles error:', profileError.message);
    } else {
      console.log('✅ Profiles found:', profiles?.length || 0);
      profiles?.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name || p.display_name || 'No name'} (${p.email || 'no email'}) - ID: ${p.id}`);
      });
    }

    // Test if we can create a profile for an existing auth user
    console.log('\n3. Testing profile creation...');
    
    // Try to get user data if we have a session
    if (sessionData.session?.user) {
      const userId = sessionData.session.user.id;
      const userEmail = sessionData.session.user.email;
      const userName = sessionData.session.user.user_metadata?.full_name || 'User';
      
      console.log('Attempting to create profile for current user...');
      
      const { data: newProfile, error: createError } = await client
        .from('profiles')
        .upsert({
          id: userId,
          email: userEmail,
          name: userName,
          display_name: userName,
          username: userEmail.split('@')[0],
          bio: '',
          avatar_url: '',
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
        }, {
          onConflict: 'id'
        })
        .select();

      if (createError) {
        console.log('❌ Profile creation error:', createError.message);
      } else {
        console.log('✅ Profile created/updated:', newProfile);
      }
    }

    // Test login with one of the auth users
    console.log('\n4. Testing login with known users...');
    
    // These are some common test emails that might exist
    const testEmails = [
      'test@fitprove.app',
      'user@example.com',
      'admin@fitprove.app',
      'demo@fitprove.app'
    ];
    
    const testPassword = 'testpassword123';
    
    for (const email of testEmails) {
      try {
        console.log(`   Trying to login with: ${email}`);
        const { data: loginData, error: loginError } = await client.auth.signInWithPassword({
          email: email,
          password: testPassword
        });
        
        if (loginError) {
          console.log(`   ❌ ${email}: ${loginError.message}`);
        } else {
          console.log(`   ✅ ${email}: Login successful!`);
          console.log(`      User ID: ${loginData.user?.id}`);
          break; // Stop after first successful login
        }
      } catch (err) {
        console.log(`   ❌ ${email}: ${err.message}`);
      }
    }

  } catch (err) {
    console.error('❌ Check error:', err);
  }
}

checkUsersAndProfiles();