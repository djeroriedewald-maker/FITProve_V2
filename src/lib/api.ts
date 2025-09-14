import { supabase } from './supabase';
import { UserProfile } from '../types/profile.types';
import { Post, CreatePostData, CreateCommentData, ToggleLikeData } from '../types/social.types';
import type { Database } from '../types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

function updateProfile(client: SupabaseClient<Database>, userId: string, update: Partial<Database['public']['Tables']['profiles']['Update']>) {
  return client
    .from('profiles')
    // @ts-ignore - Supabase types issue with the update method
    .update(update)
    .eq('id', userId)
    .select()
    .single();
}

interface UpdateProfileParams {
  userId: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string;
  fitnessGoals: string[];
  avatarFile?: File | null;
}

export async function updateUserProfile({
  userId,
  displayName,
  username,
  bio,
  avatarUrl,
  fitnessGoals,
  avatarFile,
}: UpdateProfileParams): Promise<{ data: UserProfile | null; error: Error | null }> {
  try {
    // First, check if the username is already taken (excluding current user)
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (checkError) {
      // maybeSingle should not error on zero rows; only propagate real errors (e.g., RLS, network)
      console.error('Username availability check error:', checkError);
      throw new Error('Failed to check username availability');
    }

    if (existingUser) {
      throw new Error('Username is already taken');
    }

    // Handle avatar upload
    let finalAvatarUrl = avatarUrl;
    if (avatarFile || avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
      try {
        // Prefer provided File directly; otherwise fetch blob/data URL and create a File
        let fileToUpload: File;
        let mime: string;
        if (avatarFile) {
          fileToUpload = avatarFile;
          mime = avatarFile.type || 'image/png';
        } else {
          const response = await fetch(avatarUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch avatar blob (${response.status})`);
          }
          const blob = await response.blob();
          mime = blob.type || 'image/png';
          const fallbackExt = (mime.split('/')?.[1] || 'png').toLowerCase();
          const tempName = `avatar_tmp.${fallbackExt}`;
          fileToUpload = new File([blob], tempName, { type: mime });
        }

        // Create a unique filename with timestamp and userId
        const timestamp = Date.now();
        const extension = (mime.split('/')?.[1] || 'png').toLowerCase();
        const filename = `avatar_${timestamp}.${extension}`;
        const filePath = `${userId}/${filename}`;

        // Best-effort: delete old avatar files; ignore permission/bucket errors
        try {
          const { data: oldFiles, error: listErr } = await supabase.storage
            .from('avatars')
            .list(userId);
          if (listErr) {
            console.warn('Avatar list warning:', listErr.message);
          } else if (oldFiles?.length) {
            const paths = oldFiles.map(f => `${userId}/${f.name}`);
            const { error: removeErr } = await supabase.storage
              .from('avatars')
              .remove(paths);
            if (removeErr) {
              console.warn('Avatar remove warning:', removeErr.message);
            }
          }
        } catch (inner) {
          console.warn('Avatar cleanup skipped due to error:', inner);
        }

        // Upload new avatar with correct content type
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            contentType: mime,
            upsert: true,
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          // Provide clearer guidance if the bucket is missing or policies deny access
          if (/resource was not found|bucket/i.test(uploadError.message)) {
            throw new Error("Avatar upload failed: storage bucket 'avatars' not found or not accessible. Please create the bucket and policies.");
          }
          throw new Error(`Avatar upload failed: ${uploadError.message}`);
        }

        // Get the public URL with cache busting
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Add timestamp to prevent browser caching
        finalAvatarUrl = `${publicUrl}?t=${timestamp}`;
      } catch (error) {
        console.error('Avatar upload exception:', error);
        throw error instanceof Error ? error : new Error('Failed to upload avatar image');
      }
    }

          // @ts-ignore - Supabase types issue with the update method
    const { data: profileData, error: updateError } = await updateProfile(supabase, userId, {
      display_name: displayName,
      username,
      bio,
      avatar_url: finalAvatarUrl,
      fitness_goals: fitnessGoals,
    });

    if (updateError) {
      throw updateError;
    }

    const updatedProfile: Database['public']['Tables']['profiles']['Row'] = profileData as Database['public']['Tables']['profiles']['Row'];

    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }

    // Convert database types to frontend types
    return { 
      data: {
        id: updatedProfile.id,
        displayName: updatedProfile.display_name || '',
        username: updatedProfile.username || '',
        bio: updatedProfile.bio || '',
        avatarUrl: updatedProfile.avatar_url || '',
        fitnessGoals: updatedProfile.fitness_goals,
        memberSince: new Date(updatedProfile.created_at),
        level: updatedProfile.level,
        stats: updatedProfile.stats || {
          workoutsCompleted: 0,
          totalMinutes: 0,
          streakDays: 0,
          achievementsCount: 0,
          followersCount: 0,
          followingCount: 0
        },
        achievements: updatedProfile.achievements?.map((achievement: { 
          id: string;
          title: string;
          description: string;
          icon: string;
          unlockedAt: string | null;
          progress?: { current: number; target: number; }
        }) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : null
        })) || [],
        recentWorkouts: updatedProfile.recent_workouts?.map((workout: {
          id: string;
          type: string;
          title: string;
          duration: number;
          caloriesBurned: number;
          completedAt: string;
        }) => ({
          ...workout,
          completedAt: new Date(workout.completedAt)
        })) || [],
      },
      error: null 
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to update profile')
    };
  }
}

// Social API Functions

export async function fetchPosts(): Promise<Post[]> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Get all user profiles for the posts
    const userIds = posts?.map(p => p.user_id) || [];
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
        .in('post_id', posts?.map(p => p.id) || []);
      
      userLikes = likes?.map(l => l.post_id) || [];
    }

    // Create a map of profiles for easy lookup
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return posts?.map(post => {
      const profile = profileMap.get(post.user_id);
      return {
        ...post,
        author: {
          id: profile?.id || post.user_id,
          displayName: profile?.display_name || 'Unknown User',
          username: profile?.username || 'unknown',
          avatarUrl: profile?.avatar_url || null
        },
        isLiked: userLikes.includes(post.id)
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('Failed to fetch posts');
  }
}

export async function createPost(postData: CreatePostData): Promise<Post> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: postData.content,
        media_url: postData.mediaUrls,
        type: postData.type,
        workout_id: postData.workoutId,
        achievement_id: postData.achievementId
      })
      .select('*')
      .single();

    if (error) throw error;

    // Get the user profile for the author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      ...post,
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

export async function toggleLike(data: ToggleLikeData): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (data.postId) {
      // Check if like already exists
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', data.postId)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: data.postId
          });
        if (error) throw error;
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw new Error('Failed to toggle like');
  }
}

export async function createComment(commentData: CreateCommentData): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        post_id: commentData.postId,
        content: commentData.content,
        parent_id: commentData.parentId
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }
}

export async function updatePost(postId: string, content: string): Promise<Post> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: post, error } = await supabase
      .from('posts')
      .update({ 
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .eq('user_id', user.id) // Ensure user can only edit their own posts
      .select('*')
      .single();

    if (error) throw error;

    // Get the user profile for the author
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .eq('id', user.id)
      .single();

    return {
      ...post,
      author: {
        id: profile?.id || user.id,
        displayName: profile?.display_name || 'Unknown User',
        username: profile?.username || 'unknown',
        avatarUrl: profile?.avatar_url || null
      },
      isLiked: false // Will be updated by the component
    };
  } catch (error) {
    console.error('Error updating post:', error);
    throw new Error('Failed to update post');
  }
}

export async function deletePost(postId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id); // Ensure user can only delete their own posts

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw new Error('Failed to delete post');
  }
}