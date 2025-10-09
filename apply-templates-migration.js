import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📋 Applying workout_templates migration...\n');

  try {
    // Read the migration file
    const sql = readFileSync('./supabase/migrations/0013_workout_templates.sql', 'utf8');

    console.log('✅ Migration file loaded');
    console.log('📝 SQL Preview (first 200 chars):');
    console.log(sql.substring(0, 200) + '...\n');

    console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:\n');
    console.log('1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.log('2. Copy the contents of: supabase/migrations/0013_workout_templates.sql');
    console.log('3. Paste and run the SQL\n');

    console.log('Or use the Supabase CLI:');
    console.log('  supabase db push\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
