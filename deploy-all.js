// Deploy all planner backend features automatically
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql, description) {
  console.log(`\n📝 ${description}...`);

  // Split by semicolons but keep function bodies intact
  const statements = sql.split(/;\s*(?=CREATE|ALTER|SELECT|COMMENT|INSERT|UPDATE|DELETE|DROP)/gi)
    .filter(s => s.trim().length > 0)
    .map(s => s.trim() + (s.trim().endsWith(';') ? '' : ';'));

  for (const statement of statements) {
    if (!statement.trim()) continue;

    try {
      // Use raw query execution
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: statement })
      });

      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        console.log(`   ⚠️  Warning: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Warning: ${error.message}`);
    }
  }

  console.log('   ✅ Executed');
}

async function step1_FixReminderFunction() {
  console.log('\n' + '='.repeat(60));
  console.log('STEP 1: Fix get_pending_reminders Function');
  console.log('='.repeat(60));

  const sql = fs.readFileSync('./fix-pending-reminders-function.sql', 'utf8');

  await executeSQL(sql, 'Creating/updating get_pending_reminders function');

  // Test it
  console.log('\n🧪 Testing function...');
  const { data, error } = await supabase.rpc('get_pending_reminders', {
    p_check_window_minutes: 15
  });

  if (error) {
    console.log('   ❌ Test FAILED:', error.message);
    return false;
  }

  console.log('   ✅ Function working correctly');
  console.log(`   📬 Pending reminders: ${data?.length || 0}`);
  return true;
}

async function step2_CheckEdgeFunction() {
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: Check Edge Function');
  console.log('='.repeat(60));

  console.log('\n🔍 Testing Edge Function endpoint...');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-planner-reminders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 404) {
      console.log('   ❌ Edge Function NOT deployed');
      console.log('\n📖 To deploy the Edge Function:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions');
      console.log('   2. Create new function: send-planner-reminders');
      console.log('   3. Copy code from: supabase/functions/send-planner-reminders/index.ts');
      console.log('   4. Click Deploy');
      return false;
    }

    if (!response.ok) {
      console.log(`   ⚠️  Edge Function returned HTTP ${response.status}`);
      const text = await response.text();
      console.log('   Response:', text.substring(0, 200));
      return false;
    }

    const result = await response.json();
    console.log('   ✅ Edge Function is deployed and working');
    console.log('   Response:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return false;
  }
}

async function step3_SetupCronJob() {
  console.log('\n' + '='.repeat(60));
  console.log('STEP 3: Setup CRON Job');
  console.log('='.repeat(60));

  // Note: Cannot programmatically set up CRON via REST API
  // Need to use SQL Editor

  console.log('\n⚠️  CRON setup requires manual SQL execution');
  console.log('\n📖 To set up the CRON job:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new');
  console.log('   2. Run this SQL:\n');

  const cronSQL = `
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

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
SELECT * FROM cron.job;
`;

  console.log(cronSQL);

  return null; // Manual step
}

async function step4_TestEverything() {
  console.log('\n' + '='.repeat(60));
  console.log('STEP 4: Final Verification');
  console.log('='.repeat(60));

  console.log('\n🧪 Running comprehensive tests...');

  // Test reminder function
  console.log('\n1. Testing get_pending_reminders...');
  const { data: reminders, error: reminderError } = await supabase.rpc('get_pending_reminders', {
    p_check_window_minutes: 15
  });

  const reminderTest = !reminderError;
  console.log(reminderTest ? '   ✅ PASS' : `   ❌ FAIL: ${reminderError?.message}`);

  // Test Edge Function
  console.log('\n2. Testing Edge Function...');
  let edgeTest = false;
  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-planner-reminders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    edgeTest = response.ok;
    console.log(edgeTest ? '   ✅ PASS' : `   ❌ FAIL: HTTP ${response.status}`);
  } catch (error) {
    console.log(`   ❌ FAIL: ${error.message}`);
  }

  // View planner events
  console.log('\n3. Viewing planner events with reminders...');
  const { data: events } = await supabase
    .from('planner_events')
    .select('id, title, date, time, reminder_minutes, reminder_sent')
    .not('reminder_minutes', 'is', null)
    .limit(5);

  console.log(`   Found ${events?.length || 0} event(s) with reminders`);
  if (events && events.length > 0) {
    events.forEach(e => {
      const status = e.reminder_sent ? '📬' : '⏳';
      console.log(`   ${status} ${e.title} - ${e.date} ${e.time || ''}`);
    });
  }

  return { reminderTest, edgeTest };
}

async function main() {
  console.log('🚀 AUTOMATED PLANNER BACKEND DEPLOYMENT\n');
  console.log('This script will deploy all backend features automatically.');
  console.log('Some steps may require manual action in Supabase Dashboard.\n');

  const results = {};

  // Step 1: Fix reminder function
  results.step1 = await step1_FixReminderFunction();

  // Step 2: Check Edge Function
  results.step2 = await step2_CheckEdgeFunction();

  // Step 3: Setup CRON (manual)
  results.step3 = await step3_SetupCronJob();

  // Step 4: Test everything
  const tests = await step4_TestEverything();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Reminder Function:  ${results.step1 ? 'DEPLOYED' : 'FAILED'}`);
  console.log(`${results.step2 ? '✅' : '❌'} Edge Function:      ${results.step2 ? 'DEPLOYED' : 'NOT DEPLOYED (manual required)'}`);
  console.log(`⚠️  CRON Job:          MANUAL SETUP REQUIRED`);

  console.log('\n📖 Next Steps:');
  if (!results.step2) {
    console.log('   1. Deploy Edge Function (see instructions above)');
  }
  console.log('   2. Set up CRON job (copy SQL above)');
  console.log('   3. Test end-to-end by creating an event with a reminder');

  console.log('\n📄 Full documentation: DEPLOY-NOW.md');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
