import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovlxapmtdglgjsatnmjp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bHhhcG10ZGdsZ2pzYXRubWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODE1MjEsImV4cCI6MjA1MTg1NzUyMX0.bJLUaYfNTAFW55vX_k9rEVPKu7yx4Bnqv4lU6c8hPNo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseIssues() {
  console.log('🔍 DIAGNOSING DATABASE ISSUES\n');
  
  const tables = ['profiles', 'posts', 'comments', 'likes', 'notifications', 'sessions', 'workouts'];
  
  for (const tableName of tables) {
    console.log(`\n📋 Checking ${tableName} table...`);
    
    try {
      // Test basic access
      const { data, error: selectError } = await supabase
        .from(tableName as any)
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.log(`❌ ${tableName}: ${selectError.message}`);
        
        // Common error patterns
        if (selectError.message.includes('does not exist')) {
          console.log(`   💡 Table ${tableName} needs to be created`);
        } else if (selectError.message.includes('column') && selectError.message.includes('does not exist')) {
          console.log(`   💡 Table ${tableName} exists but missing columns`);
        }
      } else {
        console.log(`✅ ${tableName}: Accessible (${data?.length || 0} sample records)`);
        
        // For posts table, check specifically for workout_id column
        if (tableName === 'posts' && data && data.length > 0) {
          const sample = data[0];
          const hasWorkoutId = 'workout_id' in sample;
          const hasAchievementId = 'achievement_id' in sample;
          console.log(`   🔍 workout_id column: ${hasWorkoutId ? '✅' : '❌'}`);
          console.log(`   🔍 achievement_id column: ${hasAchievementId ? '✅' : '❌'}`);
        }
      }
      
    } catch (error: any) {
      console.log(`❌ ${tableName}: Network/Auth error - ${error.message}`);
    }
  }
  
  // Test auto-post settings
  console.log('\n📋 Checking auto_post_settings...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('auto_post_settings')
      .limit(1);
    
    if (error) {
      console.log(`❌ auto_post_settings: ${error.message}`);
    } else {
      console.log(`✅ auto_post_settings: Available`);
      if (data && data.length > 0 && data[0].auto_post_settings) {
        console.log(`   📊 Sample settings: ${JSON.stringify(data[0].auto_post_settings)}`);
      }
    }
  } catch (error: any) {
    console.log(`❌ auto_post_settings: ${error.message}`);
  }
  
  // Test post creation with minimal data
  console.log('\n📋 Testing post creation (dry run)...');
  try {
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      console.log('✅ User authenticated');
      
      // Test what happens when we try to insert a minimal post
      const insertData = {
        user_id: user.user.id,
        content: 'Test post',
        type: 'general'
      };
      
      console.log('🧪 Testing insert with:', insertData);
      
      // Just test the validation, don't actually insert
      const { error: insertError } = await supabase
        .from('posts')
        .insert(insertData)
        .select('*')
        .limit(0); // This should validate without inserting
      
      if (insertError) {
        console.log(`❌ Insert validation failed: ${insertError.message}`);
        
        if (insertError.message.includes('workout_id')) {
          console.log('   💡 Need to execute fix-posts-table.sql migration');
        }
      } else {
        console.log('✅ Post structure validation passed');
      }
    } else {
      console.log('❌ No authenticated user for testing');
    }
  } catch (error: any) {
    console.log(`❌ Post creation test failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 RECOMMENDATIONS:');
  console.log('1. Execute fix-posts-table.sql in Supabase SQL Editor');
  console.log('2. Ensure all social migration files are executed');
  console.log('3. Check RLS policies are properly configured');
  console.log('4. Verify network connectivity and auth tokens');
}

checkDatabaseIssues();