import { supabase } from './src/lib/supabase';

async function checkDatabaseStatus() {
  console.log('🔍 Comprehensive Database Status Check...\n');

  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('⚠️ User not authenticated - some tests will be skipped');
    } else {
      console.log('✅ User authenticated:', user.email);
    }

    // 1. Check profiles table structure
    console.log('\n1. Checking profiles table structure...');
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Profiles table error:', profileError.message);
    } else {
      console.log('✅ Profiles table accessible');
      
      // Check if auto_post_settings column exists
      if (profileCheck && profileCheck.length > 0) {
        const profile = profileCheck[0];
        if ('auto_post_settings' in profile) {
          console.log('✅ auto_post_settings column exists');
        } else {
          console.log('❌ auto_post_settings column MISSING - need to run manual-auto-posts-migration.sql');
        }
        
        // List available columns
        console.log('📋 Available columns:', Object.keys(profile));
      }
    }

    // 2. Check notifications table
    console.log('\n2. Checking notifications table...');
    const { data: notifCheck, error: notifError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);
    
    if (notifError) {
      console.error('❌ Notifications table missing:', notifError.message);
      console.log('💡 Need to execute: manual-notifications-migration.sql');
    } else {
      console.log('✅ Notifications table exists');
    }

    // 3. Check posts table structure
    console.log('\n3. Checking posts table...');
    const { data: postsCheck, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.error('❌ Posts table error:', postsError.message);
    } else {
      console.log('✅ Posts table accessible');
      if (postsCheck && postsCheck.length > 0) {
        console.log('📋 Post columns:', Object.keys(postsCheck[0]));
      }
    }

    // 4. Check comments table
    console.log('\n4. Checking comments table...');
    const { data: commentsCheck, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      console.error('❌ Comments table error:', commentsError.message);
    } else {
      console.log('✅ Comments table accessible');
      if (commentsCheck && commentsCheck.length > 0) {
        const comment = commentsCheck[0];
        if ('parent_id' in comment) {
          console.log('✅ parent_id column exists (comment replies supported)');
        } else {
          console.log('❌ parent_id column missing - comments migration may be incomplete');
        }
      }
    }

    // 5. Check likes table
    console.log('\n5. Checking likes table...');
    const { data: likesCheck, error: likesError } = await supabase
      .from('likes')
      .select('*')
      .limit(1);
    
    if (likesError) {
      console.error('❌ Likes table error:', likesError.message);
    } else {
      console.log('✅ Likes table accessible');
      if (likesCheck && likesCheck.length > 0) {
        const like = likesCheck[0];
        if ('reaction_type' in like) {
          console.log('✅ reaction_type column exists (enhanced reactions supported)');
        } else {
          console.log('❌ reaction_type column missing');
        }
      }
    }

    // 6. Check RPC functions
    console.log('\n6. Checking RPC functions...');
    
    // Notifications functions
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count');
      if (error) {
        console.error('❌ get_unread_notification_count function missing:', error.message);
      } else {
        console.log('✅ get_unread_notification_count function works');
      }
    } catch (e) {
      console.error('❌ get_unread_notification_count function error');
    }

    // 7. Check sessions table (for auto-posts)
    console.log('\n7. Checking sessions table...');
    const { data: sessionsCheck, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.error('❌ Sessions table error:', sessionsError.message);
    } else {
      console.log('✅ Sessions table accessible');
    }

    // 8. Check workouts table
    console.log('\n8. Checking workouts table...');
    const { data: workoutsCheck, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .limit(1);
    
    if (workoutsError) {
      console.error('❌ Workouts table error:', workoutsError.message);
    } else {
      console.log('✅ Workouts table accessible');
    }

    // Summary
    console.log('\n📋 MIGRATION STATUS SUMMARY:');
    console.log('=====================================');
    
    const migrationsNeeded = [];
    
    if (notifError) {
      migrationsNeeded.push('manual-notifications-migration.sql');
    }
    
    if (profileCheck && profileCheck.length > 0 && !('auto_post_settings' in profileCheck[0])) {
      migrationsNeeded.push('manual-auto-posts-migration.sql');
    }

    if (migrationsNeeded.length === 0) {
      console.log('✅ All migrations appear to be executed!');
    } else {
      console.log('❌ MIGRATIONS NEEDED:');
      migrationsNeeded.forEach(migration => {
        console.log(`   - Execute: ${migration}`);
      });
    }

    console.log('\n🔧 Next Steps:');
    console.log('1. Execute any missing migrations in Supabase SQL Editor');
    console.log('2. Restart the development server');
    console.log('3. Test the UI components');
    console.log('4. Check browser DevTools for any remaining errors');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkDatabaseStatus();