// Test deployment of planner backend features
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDUyMjcsImV4cCI6MjA3MzMyMTIyN30.yyrVRMUFC4owgaAZi6ifLCPYDPzdBVC2XzOsG5hR39E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testReminderFunction() {
  console.log('\n🧪 Testing get_pending_reminders function...');

  const { data, error } = await supabase.rpc('get_pending_reminders', {
    p_check_window_minutes: 15
  });

  if (error) {
    console.log('❌ Function test FAILED:', error.message);
    return false;
  }

  console.log('✅ Function working correctly');
  console.log(`   Found ${data?.length || 0} pending reminders`);
  return true;
}

async function testEdgeFunction() {
  console.log('\n🧪 Testing Edge Function...');

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/send-planner-reminders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.log(`❌ Edge Function test FAILED: HTTP ${response.status}`);
      const text = await response.text();
      console.log('   Response:', text);
      return false;
    }

    const result = await response.json();
    console.log('✅ Edge Function working correctly');
    console.log('   Response:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Edge Function test FAILED:', error.message);
    return false;
  }
}

async function checkCronJob() {
  console.log('\n🧪 Checking CRON job...');
  console.log('⚠️  Cannot check CRON from client - use SQL Editor:');
  console.log('   SELECT * FROM cron.job WHERE jobname = \'send-planner-reminders\';');
}

async function viewPlannerEvents() {
  console.log('\n📋 Current planner events with reminders:');

  const { data, error } = await supabase
    .from('planner_events')
    .select('id, title, date, time, reminder_minutes, reminder_sent, completed')
    .not('reminder_minutes', 'is', null)
    .order('date', { ascending: true })
    .limit(5);

  if (error) {
    console.log('❌ Error fetching events:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('   No events with reminders found');
    return;
  }

  console.log(`   Found ${data.length} event(s):`);
  data.forEach(event => {
    const status = event.reminder_sent ? '📬 SENT' : '⏳ PENDING';
    console.log(`   ${status} - ${event.title} (${event.date} ${event.time || ''}) - ${event.reminder_minutes}min`);
  });
}

async function main() {
  console.log('🚀 Testing Planner Backend Deployment\n');
  console.log('=' .repeat(60));

  const results = {
    reminderFunction: await testReminderFunction(),
    edgeFunction: await testEdgeFunction(),
  };

  await checkCronJob();
  await viewPlannerEvents();

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log('='.repeat(60));
  console.log(`get_pending_reminders: ${results.reminderFunction ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Edge Function:         ${results.edgeFunction ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRON Job:              ⚠️  Manual check required`);

  const allPassed = results.reminderFunction && results.edgeFunction;

  console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'));

  if (!allPassed) {
    console.log('\n📖 See DEPLOY-NOW.md for deployment instructions');
    process.exit(1);
  }
}

main();
