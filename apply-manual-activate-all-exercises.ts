// Script: apply-manual-activate-all-exercises.ts
// This script applies the migration to activate and approve all exercises in Supabase
// Usage: npx ts-node apply-manual-activate-all-exercises.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials in .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  const sql = fs.readFileSync('manual-activate-all-exercises.sql', 'utf8');
  const { error } = await supabase.rpc('execute_sql', { sql });
  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  console.log('Migration applied: all exercises are now active and approved.');
}

runMigration();
