const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // Use anon key to check current session
);

async function checkCurrentUser() {
  console.log('🔍 Checking current user session...');
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Session error:', error);
      return;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      return;
    }
    
    console.log('✅ Active session found');
    console.log('User ID:', session.user.id);
    console.log('Email:', session.user.email);
    
    // Get profile data for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.log('❌ Profile error:', profileError);
      return;
    }
    
    console.log('📋 Profile data:');
    console.log('  Display Name:', profile.display_name);
    console.log('  Username:', profile.username);
    console.log('  Avatar URL:', profile.avatar_url);
    
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

checkCurrentUser();