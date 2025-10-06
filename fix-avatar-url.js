const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAvatar() {
  console.log('🔍 Looking for Coach Djero profiles...');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .or('username.eq.Coach Djero,display_name.ilike.%Djero%');
    
  if (error) {
    console.log('❌ Error:', error);
    return;
  }
  
  console.log('📋 Found profiles:', profiles.length);
  profiles.forEach((profile, index) => {
    console.log(`Profile ${index + 1}:`);
    console.log(`  ID: ${profile.id}`);
    console.log(`  Display Name: ${profile.display_name}`);
    console.log(`  Username: ${profile.username}`);
    console.log(`  Avatar URL: ${profile.avatar_url}`);
    console.log('---');
  });
  
  // The correct avatar URL based on your link
  const correctAvatarUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co/storage/v1/object/public/avatars/89d52d81-6b92-46f5-9fff-d655a8905d3f/avatar_1757857962912.jpeg';
  
  // Update the profile that matches the user ID in the avatar path
  const targetUserId = '89d52d81-6b92-46f5-9fff-d655a8905d3f';
  
  console.log(`🔄 Updating avatar for user ${targetUserId}...`);
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: correctAvatarUrl })
    .eq('id', targetUserId);
    
  if (updateError) {
    console.log('❌ Update error:', updateError);
  } else {
    console.log('✅ Avatar URL updated successfully!');
    
    // Verify the update
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('display_name, username, avatar_url')
      .eq('id', targetUserId)
      .single();
      
    console.log('📋 Updated profile:', updatedProfile);
  }
}

fixAvatar();