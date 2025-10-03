const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  try {
    console.log('🔍 Checking all profiles in database...');
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, name, username, avatar_url')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching profiles:', error);
    } else {
      console.log('✅ Found profiles:');
      profiles.forEach(profile => {
        console.log(`- ID: ${profile.id}`);
        console.log(`  Name: ${profile.name || profile.display_name}`);
        console.log(`  Username: ${profile.username}`);
        console.log(`  Avatar URL: ${profile.avatar_url || 'NULL'}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

checkProfiles();