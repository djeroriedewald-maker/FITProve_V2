// Run this in the browser console (F12) while logged into your app
// This will find your avatar and link it to your profile

async function findMyAvatar() {
  console.log('🔍 Finding your existing avatar...');
  
  // Get current user from the auth context
  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) {
    console.error('❌ Not logged in');
    return;
  }
  
  console.log('👤 User ID:', user.id);
  console.log('📧 Email:', user.email);
  
  // List all avatars
  const { data: files, error } = await window.supabase.storage
    .from('avatars')
    .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    
  if (error) {
    console.error('❌ Error listing files:', error);
    return;
  }
  
  console.log('📁 Found avatars:', files.map(f => ({ 
    name: f.name, 
    created: f.created_at,
    size: f.metadata?.size 
  })));
  
  // Look for your avatar (you can modify this search)
  const myAvatars = files.filter(f => 
    f.name.toLowerCase().includes('djero') ||
    f.name.toLowerCase().includes('coach') ||
    f.name.startsWith(user.id) ||
    f.name.includes(user.id.substring(0, 8))
  );
  
  console.log('🎯 Possible matches:', myAvatars);
  
  if (myAvatars.length > 0) {
    const avatarFile = myAvatars[0]; // Use the first match
    const { data: { publicUrl } } = window.supabase.storage
      .from('avatars')
      .getPublicUrl(avatarFile.name);
      
    console.log('🔗 Avatar URL:', publicUrl);
    
    // Update your profile
    const { error: updateError } = await window.supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('❌ Update failed:', updateError);
    } else {
      console.log('✅ Avatar linked! Refresh the page.');
      // Refresh the page to see changes
      window.location.reload();
    }
  } else {
    console.log('❓ No matching avatars found. Manual selection needed.');
    console.log('📋 All files:', files.map(f => f.name));
    console.log('💡 You can manually link any file by running:');
    console.log(`
// Replace 'FILENAME.jpg' with your actual avatar filename
const { data: { publicUrl } } = await window.supabase.storage
  .from('avatars')
  .getPublicUrl('FILENAME.jpg');
  
await window.supabase
  .from('profiles')
  .update({ avatar_url: publicUrl })
  .eq('id', '${user.id}');
  
window.location.reload();
    `);
  }
}

// Also expose supabase globally if not already available
if (!window.supabase) {
  console.log('💡 Supabase not found globally. Import it in console first or run this in your app context.');
}

console.log('🚀 Run findMyAvatar() in the browser console to find and link your avatar!');