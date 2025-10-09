// Direct deployment using Supabase client with proper SQL execution
import fs from 'fs';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

console.log('🚀 Direct Deployment Script\n');
console.log('⚠️  Note: SQL functions cannot be created via REST API.');
console.log('They must be run directly in the Supabase SQL Editor.\n');

console.log('=' .repeat(70));
console.log('REQUIRED MANUAL STEPS:');
console.log('=' .repeat(70));

console.log('\n📝 STEP 1: Fix get_pending_reminders Function');
console.log('─'.repeat(70));
console.log('Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new');
console.log('\nCopy and run this SQL:\n');

const reminderSQL = fs.readFileSync('./fix-pending-reminders-function.sql', 'utf8');
console.log('```sql');
console.log(reminderSQL);
console.log('```\n');

console.log('─'.repeat(70));
console.log('📝 STEP 2: Deploy Edge Function');
console.log('─'.repeat(70));
console.log('Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions');
console.log('Click "Create a new function"');
console.log('Function name: send-planner-reminders\n');
console.log('Copy this code:\n');

const edgeFunctionCode = fs.readFileSync('./supabase/functions/send-planner-reminders/index.ts', 'utf8');
console.log('```typescript');
console.log(edgeFunctionCode);
console.log('```\n');

console.log('─'.repeat(70));
console.log('📝 STEP 3: Setup CRON Job');
console.log('─'.repeat(70));
console.log('Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new');
console.log('\nCopy and run this SQL:\n');

console.log('```sql');
console.log(`-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule old job if exists
SELECT cron.unschedule('send-planner-reminders');

-- Create CRON job (runs every 15 minutes)
SELECT cron.schedule(
    'send-planner-reminders',
    '*/15 * * * *',
    $$
    SELECT
      net.http_post(
          url:='https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${SUPABASE_SERVICE_KEY}"}'::jsonb
      ) as request_id;
    $$
);

-- Verify CRON job is created
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'send-planner-reminders';
`);
console.log('```\n');

console.log('=' .repeat(70));
console.log('📋 VERIFICATION CHECKLIST:');
console.log('=' .repeat(70));
console.log('After completing the manual steps, run: node test-deployment.js\n');

console.log('Or manually verify:');
console.log('  □ Test function: SELECT * FROM get_pending_reminders(15);');
console.log('  □ Test Edge Function:');
console.log('    curl -X POST "https://kktyvxhwhuejotsqnbhn.supabase.co/functions/v1/send-planner-reminders" \\');
console.log('      -H "Authorization: Bearer ' + SUPABASE_SERVICE_KEY + '"');
console.log('  □ Check CRON: SELECT * FROM cron.job;\n');

console.log('=' .repeat(70));
console.log('\n💡 TIP: Copy each SQL block above and paste into Supabase SQL Editor');
console.log('📄 Full guide available in: DEPLOY-NOW.md\n');
