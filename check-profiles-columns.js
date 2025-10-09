// Check profiles table columns
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Checking profiles table structure...\n');

// Get a sample profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

if (error) {
  console.log('❌ Error:', error.message);
} else if (data && data.length > 0) {
  console.log('✅ Profiles table columns:');
  console.log(Object.keys(data[0]).join(', '));
  console.log('\n📝 Sample data:');
  console.log(data[0]);
} else {
  console.log('⚠️  No profiles found');
}

// Check specifically for display_name column
console.log('\n🔍 Testing display_name column...');
const { data: testData, error: testError } = await supabase
  .from('profiles')
  .select('id, display_name')
  .limit(1);

if (testError) {
  console.log('❌ display_name column error:', testError.message);
} else {
  console.log('✅ display_name column exists');
}

// Test the actual query from the function
console.log('\n🔍 Testing the actual query from get_pending_reminders...');

const { data: queryData, error: queryError } = await supabase.rpc('get_pending_reminders', {
  p_check_window_minutes: 15
});

if (queryError) {
  console.log('❌ Query error:', queryError.message);
  console.log('   Hint:', queryError.hint || 'No hint available');
  console.log('   Details:', queryError.details || 'No details available');
} else {
  console.log('✅ Query works!');
  console.log(`   Found ${queryData?.length || 0} pending reminders`);
}
