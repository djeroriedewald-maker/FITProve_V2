const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCurrentSession() {
  try {
    console.log('🔍 Checking current session...');
    
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session error:', error);
      return;
    }
    
    if (session.session) {
      console.log('✅ User is logged in:');
      console.log(`- User ID: ${session.session.user.id}`);
      console.log(`- Email: ${session.session.user.email}`);
      
      // Get profile for this user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Profile error:', profileError);
      } else {
        console.log('✅ Current user profile:');
        console.log(`- Name: ${profile.name || profile.display_name}`);
        console.log(`- Avatar: ${profile.avatar_url || 'No avatar'}`);
      }
    } else {
      console.log('❌ No active session found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCurrentSession();