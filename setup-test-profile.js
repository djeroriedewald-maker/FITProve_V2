const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestProfile() {
  try {
    console.log('🔍 Setting up test profile...');
    
    // First check if there are any auth users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.users.length} auth users`);
    
    if (users.users.length === 0) {
      console.log('ℹ️ No users found in auth. You need to sign up first through the app.');
      return;
    }
    
    const user = users.users[0]; // Use first user
    console.log(`Using user: ${user.email} (${user.id})`);
    
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (existingProfile) {
      console.log('✅ Profile exists:', existingProfile);
    } else {
      console.log('Creating profile...');
      
      // Create profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: 'Fitness Champion',
          username: 'Coach Djero', 
          display_name: 'Fitness Champion',
          bio: "I'm the owner of FITProve.",
          avatar_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
      } else {
        console.log('✅ Profile created:', newProfile);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupTestProfile();