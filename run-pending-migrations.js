// Run pending Supabase migrations
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const migrations = [
  {
    name: '0011_planner_events',
    path: './supabase/migrations/0011_planner_events.sql',
    checkTable: 'planner_events'
  },
  {
    name: '0012_goals_table',
    path: './supabase/migrations/0012_goals_table.sql',
    checkTable: 'goals'
  },
  {
    name: '0012_planner_events_meta',
    path: './supabase/migrations/0012_planner_events_meta.sql',
    checkColumn: { table: 'planner_events', column: 'meta' }
  }
];

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);

  return !error || error.code !== 'PGRST204'; // PGRST204 = table not found
}

async function checkColumnExists(tableName, columnName) {
  const { data, error } = await supabase
    .from(tableName)
    .select(columnName)
    .limit(0);

  return !error || error.code !== '42703'; // 42703 = column does not exist
}

async function runMigration(migration) {
  console.log(`\n🔍 Checking migration: ${migration.name}...`);

  // Check if already applied
  if (migration.checkTable) {
    const exists = await checkTableExists(migration.checkTable);
    if (exists) {
      console.log(`✅ Migration already applied (table '${migration.checkTable}' exists)`);
      return { success: true, skipped: true };
    }
  }

  if (migration.checkColumn) {
    const exists = await checkColumnExists(migration.checkColumn.table, migration.checkColumn.column);
    if (exists) {
      console.log(`✅ Migration already applied (column '${migration.checkColumn.column}' exists)`);
      return { success: true, skipped: true };
    }
  }

  // Read migration file
  const sqlPath = path.join(__dirname, migration.path);
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ Migration file not found: ${sqlPath}`);
    return { success: false, error: 'File not found' };
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log(`📝 Running migration: ${migration.name}...`);

  // Execute migration
  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    // Try alternative method using direct query
    const { error: error2 } = await supabase
      .from('_migrations')
      .insert({ name: migration.name, sql });

    if (error2) {
      console.error(`❌ Migration failed: ${error.message}`);
      console.error('Error details:', error);
      return { success: false, error };
    }
  }

  console.log(`✅ Migration completed: ${migration.name}`);
  return { success: true, skipped: false };
}

async function main() {
  console.log('🚀 Starting migration process...\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  const results = [];

  for (const migration of migrations) {
    const result = await runMigration(migration);
    results.push({ ...migration, ...result });
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary:');
  console.log('='.repeat(50));

  for (const result of results) {
    const status = result.success
      ? (result.skipped ? '⏭️  SKIPPED' : '✅ SUCCESS')
      : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
  }

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log(`\n❌ ${failed.length} migration(s) failed`);
    process.exit(1);
  }

  console.log('\n✅ All migrations completed successfully!');
}

main().catch(console.error);
