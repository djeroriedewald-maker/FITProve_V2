import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running planner_events migration...\n');

  const sqlPath = path.join(__dirname, 'add-recurring-columns.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}...`);

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

    if (error) {
      // Try direct query if rpc doesn't work
      const { error: queryError } = await supabase.from('_').select('*').limit(0);

      // Since we can't execute arbitrary SQL via client, we need to use the REST API
      console.log(`\n⚠️  Cannot execute SQL directly via client.`);
      console.log(`\nPlease run this migration manually in the Supabase SQL Editor:`);
      console.log(`\n👉 https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql/new\n`);
      console.log(`\nCopy and paste the contents of: add-recurring-columns.sql\n`);
      process.exit(1);
    }
  }

  console.log('\n✅ Migration completed successfully!');
}

runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
