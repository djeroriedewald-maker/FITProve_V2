// Apply fix for get_pending_reminders function
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  db: {
    schema: 'public'
  }
});

async function main() {
  console.log('🔧 Applying fix for get_pending_reminders function...\n');

  const sql = fs.readFileSync('./fix-pending-reminders-function.sql', 'utf8');

  // Use Supabase's SQL execution
  const { data, error } = await supabase.rpc('exec', {
    sql: sql
  });

  if (error) {
    console.error('❌ Error applying fix:', error.message);
    console.log('\n⚠️  You may need to run this SQL manually in the Supabase SQL Editor:');
    console.log('   Dashboard > SQL Editor > New Query');
    console.log('\nSQL to run:');
    console.log('─'.repeat(60));
    console.log(sql);
    process.exit(1);
  }

  console.log('✅ Fix applied successfully!');

  // Verify it works now
  console.log('\n🧪 Testing fixed function...');
  const { data: reminders, error: testError } = await supabase.rpc('get_pending_reminders', {
    p_check_window_minutes: 15
  });

  if (testError) {
    console.error('❌ Test failed:', testError.message);
  } else {
    console.log('✅ Function working correctly!');
    console.log(`📬 Pending reminders: ${reminders?.length || 0}`);
  }
}

main();
