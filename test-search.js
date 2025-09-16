// Test search functionality after manual SQL execution
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testSearch() {
  console.log('🔍 Testing search functionality...\n');
  
  try {
    // Test 1: Basic search
    console.log('Test 1: Searching for "push" exercises...');
    const { data: pushData, error: pushError } = await supabase
      .rpc('search_exercises', { 
        search_query: 'push',
        limit_count: 5
      });
    
    if (pushError) {
      console.log('❌ Search function not yet available:', pushError.message);
      console.log('💡 Please run the SQL in manual-search-function.sql in Supabase dashboard first');
    } else {
      console.log(`✅ Found ${pushData.length} push exercises`);
      if (pushData.length > 0) {
        console.log(`   Sample: "${pushData[0].name}" (rank: ${pushData[0].search_rank})`);
      }
    }
    
    // Test 2: Filter by muscle group  
    console.log('\nTest 2: Searching chest exercises...');
    const { data: chestData, error: chestError } = await supabase
      .rpc('search_exercises', { 
        muscle_groups: ['chest'],
        limit_count: 5
      });
    
    if (!chestError && chestData) {
      console.log(`✅ Found ${chestData.length} chest exercises`);
    }
    
    // Test 3: Combined search
    console.log('\nTest 3: Searching "press" in chest exercises...');
    const { data: combinedData, error: combinedError } = await supabase
      .rpc('search_exercises', { 
        search_query: 'press',
        muscle_groups: ['chest'],
        limit_count: 3
      });
    
    if (!combinedError && combinedData) {
      console.log(`✅ Found ${combinedData.length} chest press exercises`);
      combinedData.forEach((ex, i) => {
        console.log(`   ${i+1}. "${ex.name}" (rank: ${ex.search_rank})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSearch();