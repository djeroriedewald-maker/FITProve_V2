const { createClient } = require('@supabase/supabase-js');

// Use the working Supabase instance
const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    console.log('Setting up storage buckets...');

    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;
    
    console.log('Existing buckets:', buckets?.map(b => b.name));

    // Check if avatars bucket exists
    const avatarsBucket = buckets?.find(b => b.name === 'avatars');
    
    if (!avatarsBucket) {
      console.log('Creating avatars bucket...');
      const { data: createResult, error: createError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        throw createError;
      }
      
      console.log('Avatars bucket created successfully:', createResult);
    } else {
      console.log('Avatars bucket already exists');
    }

    // Set bucket policy to public
    console.log('Setting bucket policy...');
    
    // Note: This requires RLS policies to be set up properly in Supabase dashboard
    console.log('✅ Storage setup complete!');
    console.log('📝 Make sure to set up RLS policies in Supabase dashboard for the avatars bucket');
    
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
  }
}

setupStorage();