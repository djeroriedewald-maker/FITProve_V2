import { supabase } from './src/lib/supabase.ts';

async function findAndLinkAvatar() {
  try {
    console.log('🔍 Looking for your existing avatar...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Not authenticated:', userError);
      return;
    }
    
    console.log('👤 Current user ID:', user.id);
    console.log('📧 Current user email:', user.email);
    
    // Check current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profile error:', profileError);
      return;
    }
    
    console.log('👤 Current profile:', {
      id: profile.id,
      username: profile.username,
      name: profile.name,
      avatar_url: profile.avatar_url
    });
    
    // List all files in avatars bucket
    const { data: files, error: storageError } = await supabase.storage
      .from('avatars')
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
      
    if (storageError) {
      console.error('❌ Storage error:', storageError);
      return;
    }
    
    console.log('📁 Found', files.length, 'avatar files');
    
    // Look for files that might be yours
    const possibleAvatars = files.filter(file => {
      const name = file.name.toLowerCase();
      return (
        name.includes(user.id.substring(0, 8)) || // User ID prefix
        name.includes('djero') ||
        name.includes('coach') ||
        name.startsWith(user.id) // Exact user ID match
      );
    });
    
    console.log('🎯 Possible avatar matches:', possibleAvatars.map(f => ({
      name: f.name,
      created_at: f.created_at,
      size: f.metadata?.size
    })));
    
    // If we found potential avatars, let's check which one to use
    if (possibleAvatars.length > 0) {
      const latestAvatar = possibleAvatars[0]; // Most recent one
      console.log('📸 Using latest avatar:', latestAvatar.name);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(latestAvatar.name);
        
      console.log('🔗 Public URL:', urlData.publicUrl);
      
      // Update profile with correct avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl
        })
        .eq('id', user.id);
        
      if (updateError) {
        console.error('❌ Update error:', updateError);
        return;
      }
      
      console.log('✅ Profile updated with avatar URL!');
      console.log('🎉 Try refreshing the page - your avatar should now appear!');
      
    } else {
      console.log('❓ No matching avatar files found for your user ID or name');
      console.log('📋 All avatar files:', files.map(f => f.name));
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

findAndLinkAvatar();