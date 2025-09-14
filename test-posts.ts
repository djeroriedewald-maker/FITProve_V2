import { supabase } from './src/lib/supabase';

async function checkPostsTable() {
  console.log('Checking posts table structure...\n');

  try {
    // First check if we can select from posts
    console.log('1. Testing posts table select...');
    const { data: posts, error: selectError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Posts select error:', selectError);
      return;
    } else {
      console.log('✓ Posts table select works');
      console.log('Sample post structure:', posts?.[0] || 'No posts found');
    }

    // Check current user
    console.log('\n2. Checking current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ No authenticated user. Please sign in first.');
      return;
    }
    console.log('✓ User authenticated:', user.email);

    // Test creating a post
    console.log('\n3. Testing post creation...');
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: 'Test post from diagnostic script',
        type: 'general'
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Post creation error:', insertError);
    } else {
      console.log('✓ Post created successfully:', newPost);
      
      // Clean up - delete the test post
      await supabase.from('posts').delete().eq('id', newPost.id);
      console.log('✓ Test post cleaned up');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkPostsTable();