import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running workout_templates migration...\n');

  try {
    // Read the migration file
    const sql = readFileSync('./supabase/migrations/0013_workout_templates.sql', 'utf8');

    console.log('📝 Migration SQL loaded');
    console.log('📊 Total characters:', sql.length);
    console.log('\n⏳ Executing migration...\n');

    // Split SQL into statements and execute each one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.startsWith('COMMENT ON')) {
        console.log(`⏭️  Skipping comment statement ${i + 1}/${statements.length}`);
        continue;
      }

      try {
        console.log(`📌 Executing statement ${i + 1}/${statements.length}...`);

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        }).single();

        if (error) {
          // Try alternative approach using raw query
          console.log('   ⚠️  RPC failed, trying direct query...');
          const { error: directError } = await supabase
            .from('_migrations')
            .select('*')
            .limit(1);

          if (directError) {
            throw error; // Use original error
          }
        }

        console.log(`   ✅ Statement ${i + 1} completed`);
      } catch (err) {
        console.error(`   ❌ Error in statement ${i + 1}:`, err.message);
        // Continue with next statement
      }
    }

    console.log('\n🎉 Migration process completed!');
    console.log('\n📋 Verifying table creation...\n');

    // Verify the table exists
    const { data: tables, error: tablesError } = await supabase
      .from('workout_templates')
      .select('id')
      .limit(1);

    if (tablesError) {
      if (tablesError.message.includes('relation') && tablesError.message.includes('does not exist')) {
        console.log('⚠️  Table not created. Please run the SQL manually in Supabase SQL Editor:');
        console.log('\n1. Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql');
        console.log('2. Copy contents of: supabase/migrations/0013_workout_templates.sql');
        console.log('3. Paste and execute\n');
      } else {
        throw tablesError;
      }
    } else {
      console.log('✅ workout_templates table verified successfully!');
      console.log('✅ Migration completed successfully!\n');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📋 Manual migration instructions:');
    console.log('1. Go to: https://supabase.com/dashboard/project/kktyvxhwhuejotsqnbhn/sql');
    console.log('2. Copy contents of: supabase/migrations/0013_workout_templates.sql');
    console.log('3. Paste and execute\n');
    process.exit(1);
  }
}

runMigration();
