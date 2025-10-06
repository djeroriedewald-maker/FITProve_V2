// Link the specific avatar file to your profile
// Run this in your app's browser console (F12 -> Console tab)

async function linkMyAvatar() {
  try {
    console.log('🔗 Linking avatar_f757857962912.jpeg to your profile...');
    
    // Get the Supabase client from the app context
    let supabaseClient;
    
    // Try different ways to get the Supabase client
    if (window.supabase) {
      supabaseClient = window.supabase;
    } else if (window.__SUPABASE_CLIENT__) {
      supabaseClient = window.__SUPABASE_CLIENT__;
    } else {
      // Try to get it from React context
      const app = document.querySelector('#root')?._reactInternalInstance ||
                  document.querySelector('#root')?._reactInternals;
      console.log('Trying to get Supabase from React context...');
      
      // For now, let's try the direct approach
      console.log('Please make sure you are logged into your app and try this approach:');
      console.log('1. Go to your FitProve app tab');
      console.log('2. Open console (F12)');
      console.log('3. Run this code:');
      console.log(`
// Get current user first
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user.email);

// Get public URL for your specific avatar
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl('avatar_f757857962912.jpeg');

console.log('Avatar URL:', publicUrl);

// Update your profile with this avatar
const { error } = await supabase
  .from('profiles')
  .update({ avatar_url: publicUrl })
  .eq('id', user.id);

if (error) {
  console.error('Error:', error);
} else {
  console.log('✅ Avatar linked successfully!');
  window.location.reload();
}
      `);
      return;
    }
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ Not logged in:', userError);
      return;
    }
    
    console.log('👤 Current user:', user.email);
    
    // Get the public URL for your specific avatar
    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl('avatar_f757857962912.jpeg');
    
    console.log('🔗 Avatar URL:', publicUrl);
    
    // Update your profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
    } else {
      console.log('✅ Avatar successfully linked to your profile!');
      console.log('🎉 Refreshing page to show your avatar...');
      window.location.reload();
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Run the function
linkMyAvatar();