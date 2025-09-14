import { supabase } from './supabase';
import { Post, CreatePostData } from '../types/social.types';

// Fallback API functions that work even if the schema isn't fully migrated
export async function fetchPostsFallback(): Promise<Post[]> {
  try {
    // Try the full query first
    let { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }

    // If no posts, return empty array
    if (!posts || posts.length === 0) {
      return [];
    }

    // Get all user profiles for the posts
    const userIds = posts.map(p => p.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', userIds);

    // Get current user to check if they liked each post
    const { data: { user } } = await supabase.auth.getUser();
    
    let userLikes: string[] = [];
    if (user) {
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', posts.map(p => p.id));
      
      userLikes = likes?.map(l => l.post_id) || [];
    }

    // Create a map of profiles for easy lookup
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return posts.map(post => {
      const profile = profileMap.get(post.user_id);
      
      // Handle missing columns gracefully
      return {
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        media_url: post.media_url || null,
        type: post.type || 'general', // Fallback to 'general' if type is missing
        workout_id: post.workout_id || null,
        achievement_id: post.achievement_id || null,
        created_at: post.created_at,
        updated_at: post.updated_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        author: {
          id: profile?.id || post.user_id,
          displayName: profile?.display_name || 'Unknown User',
          username: profile?.username || 'unknown',
          avatarUrl: profile?.avatar_url || null
        },
        isLiked: userLikes.includes(post.id)
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function createPostFallback(postData: CreatePostData): Promise<Post> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Prepare insert data, handling potential missing columns
    const insertData: any = {
      user_id: user.id,
      content: postData.content
    };

    // Only add fields if they might exist in the schema
    if (postData.mediaUrls) insertData.media_url = postData.mediaUrls;
    if (postData.type) insertData.type = postData.type;
    if (postData.workoutId) insertData.workout_id = postData.workoutId;
    if (postData.achievementId) insertData.achievement_id = postData.achievementId;

    const { data: post, error } = await supabase
      .from('posts')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('Detailed insert error:', error);
      throw error;
    }

    // Get the user profile for the author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      id: post.id,
      user_id: post.user_id,
      content: post.content,
      media_url: post.media_url || null,
      type: post.type || 'general',
      workout_id: post.workout_id || null,
      achievement_id: post.achievement_id || null,
      created_at: post.created_at,
      updated_at: post.updated_at,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      author: {
        id: profile?.id || user.id,
        displayName: profile?.display_name || 'Unknown User',
        username: profile?.username || 'unknown',
        avatarUrl: profile?.avatar_url || null
      },
      isLiked: false
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }
}