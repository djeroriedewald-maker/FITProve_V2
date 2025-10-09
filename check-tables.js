// Check if migration tables exist
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTable(tableName) {
  const { error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  return { exists: !error, error: error?.message };
}

async function main() {
  console.log('🔍 Checking tables...\n');

  const tables = ['planner_events', 'goals'];

  for (const table of tables) {
    const result = await checkTable(table);
    const icon = result.exists ? '✅' : '❌';
    console.log(`${icon} ${table}: ${result.exists ? 'EXISTS' : 'MISSING'}`);
    if (result.error && !result.error.includes('does not exist')) {
      console.log(`   Error: ${result.error}`);
    }
  }

  // Check for meta column in planner_events if table exists
  const plannerExists = (await checkTable('planner_events')).exists;
  if (plannerExists) {
    const { error } = await supabase
      .from('planner_events')
      .select('meta')
      .limit(0);

    const metaExists = !error;
    const icon = metaExists ? '✅' : '❌';
    console.log(`${icon} planner_events.meta column: ${metaExists ? 'EXISTS' : 'MISSING'}`);
  }
}

main();
