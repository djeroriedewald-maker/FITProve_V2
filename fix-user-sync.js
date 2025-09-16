const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const client = createClient(supabaseUrl, supabaseKey);

async function fixUserSync() {
  try {
    console.log('🔧 Fixing user profile sync...\n');
    
    // First, manually create profiles for existing auth users
    console.log('1. Creating profiles for existing users...');
    
    // Since we can't directly access auth.users with anon key, 
    // let's try a different approach - manually create some test profiles
    
    const testProfiles = [
      {
        id: '45d9ef9b-5f5a-4daf-965f-f6874941e037', // test@fitprove.app user ID from earlier
        email: 'test@fitprove.app',
        name: 'Test User',
        display_name: 'Test User',
        username: 'test',
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
      }
    ];

    for (const profile of testProfiles) {
      try {
        const { data, error } = await client
          .from('profiles')
          .upsert(profile, { onConflict: 'id' })
          .select();

        if (error) {
          console.log(`❌ Error creating profile for ${profile.email}:`, error.message);
        } else {
          console.log(`✅ Profile created for ${profile.email}`);
        }
      } catch (err) {
        console.log(`❌ Exception creating profile for ${profile.email}:`, err.message);
      }
    }

    // Now test if we can login and access the profile
    console.log('\n2. Testing login with created profile...');
    
    // We still can't login because email needs confirmation, but let's check the profile exists
    const { data: profiles, error: profileError } = await client
      .from('profiles')
      .select('*');

    if (profileError) {
      console.log('❌ Error fetching profiles:', profileError.message);
    } else {
      console.log('✅ Profiles in database:', profiles.length);
      profiles.forEach(p => {
        console.log(`   - ${p.name} (${p.email}) - ID: ${p.id.substring(0, 8)}...`);
      });
    }

    console.log('\n3. Next steps:');
    console.log('   - You need to confirm user emails in Supabase dashboard');
    console.log('   - Or disable email confirmation in Auth settings');
    console.log('   - Then users can login and the WorkoutCreator will work');

  } catch (err) {
    console.error('❌ Sync error:', err);
  }
}

fixUserSync();