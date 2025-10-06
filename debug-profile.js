const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugProfile() {
  const userId = '89d52d81-6b92-46f5-9fff-d655a8905d3f';
  
  console.log('🔍 Debugging profile for user:', userId);
  
  // Use the exact same query as AuthContext
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, name, username, bio, avatar_url, created_at, fitness_goals, level, stats, is_public, allow_follow, allow_direct_messages, gender')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileError) {
    console.log('❌ Profile query error:', profileError);
    return;
  }
  
  console.log('📋 Raw profile data from database:');
  console.log(JSON.stringify(profileData, null, 2));
  
  console.log('🔍 Specific avatar_url value:');
  console.log('Type:', typeof profileData.avatar_url);
  console.log('Value:', profileData.avatar_url);
  console.log('Length:', profileData.avatar_url ? profileData.avatar_url.length : 'N/A');
  
  // Also check if there are multiple profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .eq('id', userId);
    
  console.log('📋 All profiles with this ID:');
  allProfiles.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`, {
      id: profile.id,
      display_name: profile.display_name,
      username: profile.username,
      avatar_url: profile.avatar_url
    });
  });
}

debugProfile();