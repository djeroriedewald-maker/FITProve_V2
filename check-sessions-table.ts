import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovlxapmtdglgjsatnmjp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bHhhcG10ZGdsZ2pzYXRubWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODE1MjEsImV4cCI6MjA1MTg1NzUyMX0.bJLUaYfNTAFW55vX_k9rEVPKu7yx4Bnqv4lU6c8hPNo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSessionsTable() {
  console.log('🔍 Checking sessions table structure...\n');
  
  try {
    // Try to get a sample record to see the structure
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing sessions table:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Sessions table structure (sample record):');
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n📋 Available columns:');
      Object.keys(data[0]).forEach(key => {
        console.log(`   • ${key}: ${typeof data[0][key]}`);
      });
    } else {
      console.log('✅ Sessions table exists but is empty');
      console.log('📋 Let me check what columns exist...');
      
      // Try to insert a dummy record to see what columns are required
      const { error: insertError } = await supabase
        .from('sessions')
        .insert({})
        .select();
      
      if (insertError) {
        console.log('Column info from insert error:', insertError.message);
      }
    }
    
  } catch (error: any) {
    console.log('❌ Failed to check sessions table:', error.message);
  }
}

checkSessionsTable();