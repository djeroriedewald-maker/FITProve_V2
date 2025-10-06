import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations (this should be run by admin)
const supabaseUrl = 'https://qsn2qmt-6b92-46f5-8fff-d655eB9054f3.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for bucket creation

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('💡 You need to set the service role key to create storage buckets');
  console.log('💡 Alternative: Create the avatars bucket manually in Supabase dashboard');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAvatarStorage() {
  try {
    console.log('🚀 Setting up avatar storage...');

    // Create avatars bucket
    const { data: bucket, error: bucketError } = await supabaseAdmin.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    console.log('✅ Avatars bucket created/exists');

    // The RLS policies should be applied via SQL (see setup-avatars-storage.sql)
    console.log('📝 Make sure to apply the RLS policies from setup-avatars-storage.sql');
    
  } catch (error) {
    console.error('💥 Error setting up avatar storage:', error);
  }
}

setupAvatarStorage();