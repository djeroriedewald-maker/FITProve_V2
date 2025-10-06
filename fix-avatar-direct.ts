import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://qsn2qmt-6b92-46f5-8fff-d655eB9054f3.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbjJxbXQtNmI5Mi00NmY1LThmZmYtZDY1NWVCOTA1NGYzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjA0MDUsImV4cCI6MjA0Mzg5NjQwNX0.3kMH5Vdpb6_Y4j5ewMHFLj8TZN-sz8IrAWw9SyDUNJk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAvatarForCoachDjero() {
  try {
    console.log('🔧 Fixing avatar for Coach Djero...');
    
    // Find the profile by username
    const { data: profiles, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', 'Coach Djero');
    
    if (findError) {
      console.error('❌ Error finding profile:', findError);
      return;
    }
    
    if (profiles.length === 0) {
      console.log('❌ No profile found with username "Coach Djero"');
      return;
    }
    
    const profile = profiles[0];
    console.log('👤 Found profile:', {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      current_avatar_url: profile.avatar_url
    });
    
    // Get the public URL for the specific avatar
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl('avatar_f757857962912.jpeg');
    
    console.log('🔗 Avatar public URL:', publicUrl);
    
    // Update the profile with the correct avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);
    
    if (updateError) {
      console.error('❌ Failed to update profile:', updateError);
    } else {
      console.log('✅ Successfully updated avatar URL!');
      console.log('🎉 Avatar should now appear in your app');
      
      // Verify the update
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', profile.id)
        .single();
      
      console.log('🔍 Verification - Avatar URL now:', updatedProfile?.avatar_url);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixAvatarForCoachDjero();