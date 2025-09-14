import { supabase } from './src/lib/supabase';
import { handleWorkoutCompletion, createManualWorkoutPost, getAutoPostSettings } from './src/lib/auto-posts';

async function testAutoPostSystem() {
  console.log('🚀 Testing Auto-Post System...\n');

  try {
    // Test 1: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ User not authenticated. Please sign in first.');
      return;
    }

    console.log('✅ User authenticated:', user.email);

    // Test 2: Check auto-post settings
    console.log('\n1. Testing auto-post settings...');
    const settings = await getAutoPostSettings(user.id);
    console.log('✅ Current auto-post settings:', settings);

    // Test 3: Test manual workout post creation
    console.log('\n2. Creating manual workout post...');
    const testWorkout = {
      workoutName: 'Test HIIT Session',
      workoutType: 'hiit',
      duration: 25,
      caloriesBurned: 300
    };

    const postId = await createManualWorkoutPost(testWorkout);
    
    if (postId) {
      console.log('✅ Manual workout post created successfully! Post ID:', postId);
    } else {
      console.log('⚠️ Manual workout post not created (may be due to settings or cooldown)');
    }

    // Test 4: Test workout completion handler (simulation)
    console.log('\n3. Testing workout completion handler...');
    const mockSession = {
      id: `test-${Date.now()}`,
      user_id: user.id,
      workout_id: `test-workout-${Date.now()}`,
      started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      completed_at: new Date().toISOString(),
      status: 'completed' as const,
      duration: 30,
      calories_burned: 250,
      workout_name: 'Morning Strength Training',
      workout_type: 'strength'
    };

    const autoPostId = await handleWorkoutCompletion(mockSession);
    
    if (autoPostId) {
      console.log('✅ Auto-post created successfully! Post ID:', autoPostId);
    } else {
      console.log('⚠️ Auto-post not created (may be due to settings, cooldown, or minimums)');
    }

    // Test 5: Check if posts exist in database
    console.log('\n4. Checking created posts...');
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, type, created_at')
      .eq('user_id', user.id)
      .eq('type', 'workout')
      .order('created_at', { ascending: false })
      .limit(3);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError.message);
    } else {
      console.log('✅ Recent workout posts:');
      recentPosts?.forEach(post => {
        const contentPreview = post.content ? post.content.substring(0, 50) : 'No content';
        console.log(`   - ${post.id}: "${contentPreview}..." (${post.created_at})`);
      });
    }

    console.log('\n🎉 Auto-post system test completed!');
    console.log('\nNext steps:');
    console.log('1. Execute the auto-posts migration: manual-auto-posts-migration.sql');
    console.log('2. Test the UI components in the profile page');
    console.log('3. Test with real workout completion triggers');
    console.log('4. Adjust cooldown and minimum settings as needed');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAutoPostSystem();