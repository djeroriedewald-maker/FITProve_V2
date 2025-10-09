// Simple migration runner using fetch
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHl2eGh3aHVlam90c3FuYmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTIyNywiZXhwIjoyMDczMzIxMjI3fQ.QAuP8-IBj3vRB6yY3UC2ngUcnvppYyaDLxsX8B3eU9M';

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }

  return response.json();
}

async function tableExists(tableName) {
  try {
    const sql = `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = '${tableName}'
    );`;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      const data = await response.json();
      return data?.[0]?.exists === true;
    }
    return false;
  } catch (err) {
    console.error(`Error checking table ${tableName}:`, err.message);
    return false;
  }
}

async function columnExists(tableName, columnName) {
  try {
    const sql = `SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = '${tableName}'
      AND column_name = '${columnName}'
    );`;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      const data = await response.json();
      return data?.[0]?.exists === true;
    }
    return false;
  } catch (err) {
    console.error(`Error checking column ${tableName}.${columnName}:`, err.message);
    return false;
  }
}

async function runMigration(name, filePath, check) {
  console.log(`\n📋 Migration: ${name}`);

  // Check if already applied
  if (check.table) {
    const exists = await tableExists(check.table);
    if (exists) {
      console.log(`  ⏭️  Already applied (table '${check.table}' exists)`);
      return { success: true, skipped: true };
    }
  }

  if (check.column) {
    const exists = await columnExists(check.column.table, check.column.name);
    if (exists) {
      console.log(`  ⏭️  Already applied (column '${check.column.table}.${check.column.name}' exists)`);
      return { success: true, skipped: true };
    }
  }

  // Read and execute migration
  const fullPath = path.join(__dirname, filePath);
  const sql = fs.readFileSync(fullPath, 'utf8');

  console.log(`  🔄 Executing...`);

  try {
    await executeSQL(sql);
    console.log(`  ✅ Success`);
    return { success: true, skipped: false };
  } catch (error) {
    console.error(`  ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Running pending migrations...\n');

  const migrations = [
    {
      name: '0011_planner_events',
      path: './supabase/migrations/0011_planner_events.sql',
      check: { table: 'planner_events' }
    },
    {
      name: '0012_goals_table',
      path: './supabase/migrations/0012_goals_table.sql',
      check: { table: 'goals' }
    },
    {
      name: '0012_planner_events_meta',
      path: './supabase/migrations/0012_planner_events_meta.sql',
      check: { column: { table: 'planner_events', name: 'meta' } }
    }
  ];

  const results = [];

  for (const migration of migrations) {
    const result = await runMigration(migration.name, migration.path, migration.check);
    results.push({ name: migration.name, ...result });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));

  for (const result of results) {
    const icon = result.success ? (result.skipped ? '⏭️ ' : '✅') : '❌';
    const status = result.success ? (result.skipped ? 'SKIPPED' : 'SUCCESS') : 'FAILED';
    console.log(`${icon} ${result.name}: ${status}`);
  }

  const failed = results.filter(r => !r.success);
  if (failed.length > 0) {
    console.log(`\n❌ ${failed.length} migration(s) failed`);
    process.exit(1);
  }

  console.log('\n✅ All migrations completed!');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
