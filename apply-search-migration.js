// Apply Search Functions Migration to Supabase
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySearchMigration() {
  console.log('🔍 Applying search functions migration...');
  
  try {
    // Read the migration file
    const migrationSQL = readFileSync('./supabase/migrations/0006_search_functions.sql', 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach - execute statements individually
      console.log('🔄 Trying to execute statements individually...');
      
      // Split into statements and execute one by one
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const [index, statement] of statements.entries()) {
        if (statement.trim()) {
          console.log(`📝 Executing statement ${index + 1}/${statements.length}...`);
          
          const { error: stmtError } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (stmtError) {
            console.error(`❌ Statement ${index + 1} failed:`, stmtError);
            console.log('Statement:', statement.substring(0, 100) + '...');
          } else {
            console.log(`✅ Statement ${index + 1} executed successfully`);
          }
        }
      }
    } else {
      console.log('✅ Migration applied successfully');
    }
    
    // Test the search function
    console.log('\n🧪 Testing search function...');
    const { data: searchData, error: searchError } = await supabase
      .rpc('search_exercises', { 
        search_query: 'push', 
        limit_count: 5 
      });
    
    if (searchError) {
      console.error('❌ Search test failed:', searchError);
    } else {
      console.log(`✅ Search function working! Found ${searchData?.length || 0} exercises`);
      if (searchData && searchData.length > 0) {
        console.log(`📋 Sample result: "${searchData[0].name}" (rank: ${searchData[0].search_rank})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  }
}

applySearchMigration();