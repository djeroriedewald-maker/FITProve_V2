import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/types/database.types';

const supabaseUrl = 'https://ovlxapmtdglgjsatnmjp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bHhhcG10ZGdsZ2pzYXRubWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODE1MjEsImV4cCI6MjA1MTg1NzUyMX0.bJLUaYfNTAFW55vX_k9rEVPKu7yx4Bnqv4lU6c8hPNo';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface MigrationCheck {
  name: string;
  description: string;
  check: () => Promise<{ success: boolean; details: string }>;
}

const migrationChecks: MigrationCheck[] = [
  {
    name: 'Profiles Table',
    description: 'Basic profiles table structure',
    check: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return { success: true, details: '✅ Profiles table exists' };
      } catch (error: any) {
        return { success: false, details: `❌ ${error.message}` };
      }
    }
  },
  {
    name: 'Social Posts Table',
    description: 'Social posts functionality',
    check: async () => {
      try {
        const { data, error } = await supabase
          .from('social_posts')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return { success: true, details: '✅ Social posts table exists' };
      } catch (error: any) {
        return { success: false, details: `❌ ${error.message}` };
      }
    }
  },
  {
    name: 'Comments Table',
    description: 'Comments on social posts',
    check: async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return { success: true, details: '✅ Comments table exists' };
      } catch (error: any) {
        return { success: false, details: `❌ ${error.message}` };
      }
    }
  },
  {
    name: 'Reactions Table',
    description: 'Reactions to posts and comments',
    check: async () => {
      try {
        const { data, error } = await supabase
          .from('reactions')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return { success: true, details: '✅ Reactions table exists' };
      } catch (error: any) {
        return { success: false, details: `❌ ${error.message}` };
      }
    }
  },
  {
    name: 'Notifications Table',
    description: 'User notifications system',
    check: async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        return { success: true, details: '✅ Notifications table exists' };
      } catch (error: any) {
        return { success: false, details: `❌ ${error.message}` };
      }
    }
  },
  {
    name: 'Auto Post Settings',
    description: 'Auto-post settings column in profiles',
    check: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('auto_post_settings')
          .limit(1);
        
        if (error) throw error;
        return { success: true, details: '✅ auto_post_settings column exists' };
      } catch (error: any) {
        return { success: false, details: `❌ auto_post_settings column missing: ${error.message}` };
      }
    }
  },
  {
    name: 'RPC Functions',
    description: 'Required stored procedures',
    check: async () => {
      try {
        // Test get_user_notifications function
        const { data, error } = await supabase.rpc('get_user_notifications', {
          user_id: '00000000-0000-0000-0000-000000000000' // dummy ID for testing
        });
        
        if (error && !error.message.includes('invalid input syntax')) {
          throw error;
        }
        
        return { success: true, details: '✅ RPC functions available' };
      } catch (error: any) {
        return { success: false, details: `❌ RPC functions missing: ${error.message}` };
      }
    }
  }
];

async function checkAllMigrations() {
  console.log('🔍 COMPREHENSIVE MIGRATION STATUS CHECK\n');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const check of migrationChecks) {
    console.log(`\n📋 ${check.name}: ${check.description}`);
    try {
      const result = await check.check();
      console.log(`   ${result.details}`);
      results.push({ name: check.name, ...result });
    } catch (error: any) {
      console.log(`   ❌ Unexpected error: ${error.message}`);
      results.push({ name: check.name, success: false, details: error.message });
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Passed: ${passed.length}/${results.length}`);
  if (passed.length > 0) {
    passed.forEach(r => console.log(`   ✅ ${r.name}`));
  }
  
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  if (failed.length > 0) {
    failed.forEach(r => console.log(`   ❌ ${r.name}: ${r.details}`));
  }
  
  if (failed.length > 0) {
    console.log('\n🚨 REQUIRED ACTIONS:');
    if (failed.some(f => f.name === 'Social Posts Table')) {
      console.log('   📝 Execute: manual-social-migration.sql');
    }
    if (failed.some(f => f.name === 'Comments Table')) {
      console.log('   📝 Execute: manual-comments-migration.sql');
    }
    if (failed.some(f => f.name === 'Reactions Table')) {
      console.log('   📝 Execute: manual-reaction-migration.sql');
    }
    if (failed.some(f => f.name === 'Notifications Table')) {
      console.log('   📝 Execute: manual-notifications-migration.sql');
    }
    if (failed.some(f => f.name === 'Auto Post Settings')) {
      console.log('   📝 Execute: manual-auto-posts-migration.sql');
    }
    console.log('\n💡 These files are in your project root - copy and execute in Supabase SQL Editor');
  } else {
    console.log('\n🎉 ALL MIGRATIONS COMPLETE! Database is ready.');
  }
}

checkAllMigrations().catch(console.error);