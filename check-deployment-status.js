// Check what deployment steps are complete
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Checking Deployment Status...\n');
console.log('='.repeat(60));

// Step 1: Check SQL function
console.log('\n📝 STEP 1: get_pending_reminders Function');
console.log('-'.repeat(60));

const { data: reminderTest, error: reminderError } = await supabase.rpc('get_pending_reminders', {
  p_check_window_minutes: 15
});

if (reminderError) {
  console.log('❌ NOT DEPLOYED');
  console.log(`   Error: ${reminderError.message}`);
  console.log('\n   ⚡ TO FIX:');
  console.log('   1. Open: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new');
  console.log('   2. Copy SQL from: fix-pending-reminders-function.sql');
  console.log('   3. Click RUN');
} else {
  console.log('✅ DEPLOYED');
  console.log(`   Found ${reminderTest?.length || 0} pending reminders`);
}

// Step 2: Check Edge Function
console.log('\n📝 STEP 2: Edge Function');
console.log('-'.repeat(60));

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
    console.log('❌ NOT DEPLOYED');
    console.log('\n   ⚡ TO FIX:');
    console.log('   1. Open: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/functions');
    console.log('   2. Click "Create a new function"');
    console.log('   3. Name: send-planner-reminders');
    console.log('   4. Copy code from: supabase/functions/send-planner-reminders/index.ts');
    console.log('   5. Click Deploy');
  } else if (response.ok) {
    const result = await response.json();
    console.log('✅ DEPLOYED');
    console.log(`   ${result.message || 'Function is working'}`);
  } else {
    console.log('⚠️ DEPLOYED but has errors (likely needs Step 1 first)');
    console.log(`   HTTP Status: ${response.status}`);
  }
} catch (error) {
  console.log('❌ ERROR checking Edge Function');
  console.log(`   ${error.message}`);
}

// Step 3: CRON job
console.log('\n📝 STEP 3: CRON Job');
console.log('-'.repeat(60));
console.log('⚠️  Cannot check via API');
console.log('\n   ⚡ TO SET UP:');
console.log('   1. Open: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new');
console.log('   2. See CRON SQL in: QUICK-START.md (Step 3)');
console.log('   3. Click RUN');
console.log('\n   ⚡ TO VERIFY:');
console.log('   Run this in SQL Editor: SELECT * FROM cron.job;');

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY');
console.log('='.repeat(60));

const step1Done = !reminderError;
const step2Done = false; // Can't determine without checking

console.log(`Step 1 (SQL Function):  ${step1Done ? '✅ Done' : '❌ TODO'}`);
console.log(`Step 2 (Edge Function): ${step2Done ? '✅ Done' : '⚠️  Check above'}`);
console.log(`Step 3 (CRON Job):      ⚠️  Manual check required`);

if (!step1Done) {
  console.log('\n🚀 QUICK START:');
  console.log('   Follow: QUICK-START.md');
  console.log('   Or run: node deploy-direct.js');
}

console.log('\n');
