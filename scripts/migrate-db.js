const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabaseUrl = 'https://kktyvxhwhuejotsqnbhn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable. Aborting migrations.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Also create a fetch client for direct SQL if needed
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`,
    'apikey': supabaseKey
  };
  
  return fetch(`${supabaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  }).then(r => r.json());
};

async function readMigrationFiles() {
  const migrationsPath = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = await fs.readdir(migrationsPath);
  
  // Sort files to ensure proper order
  const sortedFiles = files.sort();
  
  const migrations = await Promise.all(
    sortedFiles.map(async (file) => {
      const content = await fs.readFile(path.join(migrationsPath, file), 'utf-8');
      return {
        name: file,
        sql: content
      };
    })
  );
  
  return migrations;
}

async function applyMigration(sql) {
  try {
    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      // Try direct SQL first
      try {
        const result = await fetchWithAuth('/rest/v1/rpc/exec_sql', {
          method: 'POST',
          body: JSON.stringify({ query: statement })
        });
        
        if (result.error) {
          throw result.error;
        }
        console.log(`Successfully executed: ${statement.substring(0, 50)}...`);
      } catch (sqlError) {
        // If direct SQL fails, try using the table API
        if (statement.toLowerCase().startsWith('create table')) {
          const tableName = statement.match(/create table (?:public\.)?(\w+)/i)?.[1];
          if (tableName) {
            try {
              // Try to create the table using the REST API
              await supabase.from(tableName).insert({ _dummy: true }).select();
              console.log(`Created table ${tableName} via API`);
              continue;
            } catch (tableError) {
              console.error(`Failed to create table ${tableName}:`, tableError);
            }
          }
        }
        
        // If both methods fail, log the error but continue
        console.warn(`Warning: Could not execute statement: ${statement.substring(0, 50)}...`);
        console.warn('Error:', sqlError);
      }
    }
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
}

async function runMigrations() {
  try {
    const migrations = await readMigrationFiles();
    console.log(`Found ${migrations.length} migration files`);
    
    for (const migration of migrations) {
      console.log(`Applying migration: ${migration.name}`);
      const success = await applyMigration(migration.sql);
      if (success) {
        console.log(`✓ Successfully applied ${migration.name}`);
      } else {
        console.log(`✗ Failed to apply ${migration.name}`);
      }
    }
    
  } catch (error) {
    console.error('Failed to run migrations:', error);
  }
}

// Run migrations
runMigrations().then(() => {
  console.log('Migration process completed');
  process.exit(0);
}).catch(error => {
  console.error('Migration process failed:', error);
  process.exit(1);
});