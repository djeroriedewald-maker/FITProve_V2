import { supabase } from './src/lib/supabase';

async function testAutoPostColumn() {
  console.log('🔍 Checking auto_post_settings column...\n');

  try {
    // Test if we can query the auto_post_settings column
    const { data, error } = await supabase
      .from('profiles')
      .select('id, auto_post_settings')
      .limit(1);

    if (error) {
      if (error.message.includes('column "auto_post_settings" does not exist')) {
        console.log('❌ auto_post_settings column MISSING');
        console.log('💡 REQUIRED: Execute manual-auto-posts-migration.sql in Supabase SQL Editor');
        console.log('\nMigration file location: manual-auto-posts-migration.sql');
        return false;
      } else {
        console.error('❌ Other error:', error.message);
        return false;
      }
    }

    console.log('✅ auto_post_settings column exists!');
    console.log('✅ Auto-posts migration appears to be executed');
    
    // Test the default settings
    if (data && data.length > 0 && data[0].auto_post_settings) {
      console.log('📋 Sample auto_post_settings:', data[0].auto_post_settings);
    }

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test
testAutoPostColumn();