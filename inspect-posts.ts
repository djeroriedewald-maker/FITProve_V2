import { supabase } from './src/lib/supabase';

async function inspectPostsTable() {
  console.log('Inspecting posts table...\n');

  try {
    // Try to get the first post and see its structure
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error accessing posts table:', error);
      return;
    }

    console.log('Posts table query successful');
    console.log('Number of posts found:', posts?.length || 0);
    
    if (posts && posts.length > 0) {
      console.log('First post structure:');
      console.log(JSON.stringify(posts[0], null, 2));
    } else {
      console.log('No posts found, but table exists');
    }

    // Now try to see what happens when we attempt an insert with minimal data
    console.log('\nTesting minimal insert...');
    
    // First, let's see if we can create a post without the type field
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('Need to authenticate first.');
      console.log('But we can see that the posts table exists and is accessible.');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

inspectPostsTable();