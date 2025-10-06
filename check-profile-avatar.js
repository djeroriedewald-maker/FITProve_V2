import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qsn2qmt-6b92-46f5-8fff-d655eB9054f3.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzbjJxbXQtNmI5Mi00NmY1LThmZmYtZDY1NWVCOTA1NGYzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgzMjA0MDUsImV4cCI6MjA0Mzg5NjQwNX0.3kMH5Vdpb6_Y4j5ewMHFLj8TZN-sz8IrAWw9SyDUNJk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfileAvatar() {
  try {
    console.log('🔍 Checking profile data for Coach Djero...');
    
    // First, let's see all profiles to find yours
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .or('username.eq.Coach Djero,name.ilike.%Coach%,name.ilike.%Djero%');
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    console.log('📋 Found profiles:', profiles);
    
    // Also check by email
    const { data: profilesByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'djeroedewaldlegmail.com');
      
    if (!emailError && profilesByEmail) {
      console.log('📧 Profile by email:', profilesByEmail);
    }
    
    // Check avatar storage
    console.log('🗂️ Checking avatar storage...');
    const { data: files, error: storageError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 100 });
      
    if (!storageError && files) {
      console.log('📁 Avatar files in storage:', files);
      
      // Look for files that might belong to you
      const userFiles = files.filter(file => 
        file.name.includes('Coach') || 
        file.name.includes('Djero') || 
        file.name.includes('djero')
      );
      console.log('👤 Your avatar files:', userFiles);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkProfileAvatar();