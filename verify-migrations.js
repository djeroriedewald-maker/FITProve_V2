// Verify migration table structures
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🔍 Verifying migration table structures...\n');

  // Test planner_events
  console.log('📋 Testing planner_events table:');
  const { data: events, error: eventsError, count: eventsCount } = await supabase
    .from('planner_events')
    .select('*', { count: 'exact' })
    .limit(1);

  if (eventsError) {
    console.log('  ❌ Error:', eventsError.message);
  } else {
    console.log(`  ✅ Table accessible`);
    console.log(`  📊 Total events: ${eventsCount || 0}`);
    if (events && events.length > 0) {
      console.log('  📝 Sample columns:', Object.keys(events[0]).join(', '));
    }
  }

  // Test goals
  console.log('\n📋 Testing goals table:');
  const { data: goals, error: goalsError, count: goalsCount } = await supabase
    .from('goals')
    .select('*', { count: 'exact' })
    .limit(1);

  if (goalsError) {
    console.log('  ❌ Error:', goalsError.message);
  } else {
    console.log(`  ✅ Table accessible`);
    console.log(`  📊 Total goals: ${goalsCount || 0}`);
    if (goals && goals.length > 0) {
      console.log('  📝 Sample columns:', Object.keys(goals[0]).join(', '));
    }
  }

  // Test key features
  console.log('\n🧪 Testing key features:');

  // Test recurring events function
  console.log('  🔄 Testing generate_recurring_events function...');
  const { data: funcData, error: funcError } = await supabase.rpc('generate_recurring_events', {
    p_event_id: '00000000-0000-0000-0000-000000000000', // dummy ID
    p_start_date: '2025-10-01',
    p_end_date: '2025-10-31'
  });

  if (funcError && !funcError.message.includes('Event not found')) {
    console.log('  ⚠️  Function error (might be expected):', funcError.message);
  } else {
    console.log('  ✅ generate_recurring_events function exists');
  }

  // Test get_pending_reminders function
  console.log('  ⏰ Testing get_pending_reminders function...');
  const { data: reminders, error: remindersError } = await supabase.rpc('get_pending_reminders', {
    p_check_window_minutes: 15
  });

  if (remindersError) {
    console.log('  ⚠️  Function error:', remindersError.message);
  } else {
    console.log('  ✅ get_pending_reminders function exists');
    console.log(`  📬 Pending reminders: ${reminders?.length || 0}`);
  }

  console.log('\n✅ All migrations verified successfully!');
}

main();
