/**
 * Workout Social Features Service
 * Handles all social interactions: comments, ratings, favorites, follows, notifications
 */

import { supabase } from './supabase';
import {
  WorkoutComment,
  CreateCommentData,
  UpdateCommentData,
  WorkoutRating,
  CreateRatingData,
  UpdateRatingData,
  RatingStats,
  WorkoutFavorite,
  CreateFavoriteData,
  UpdateFavoriteData,
  FavoriteCollection,
  UserFollow,
  FollowStats,
  Notification,
  NotificationStats,
  CreateViewData,
  CreatorProfile,
  CreatorStats,
  SocialContextData,
} from '../types/workout-social.types';

export class WorkoutSocialService {
  // ============================================
  // COMMENTS
  // ============================================

  /**
   * Get all comments for a workout
   */
  static async getWorkoutComments(workoutId: string): Promise<WorkoutComment[]> {
    try {
      const { data, error } = await supabase
        .from('workout_comments')
        .select(`
          *,
          profiles!workout_comments_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('custom_workout_id', workoutId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((comment: any) => ({
        ...comment,
        user: comment.profiles ? {
          id: comment.profiles.id,
          display_name: comment.profiles.display_name,
          username: comment.profiles.username,
          avatar_url: comment.profiles.avatar_url,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error fetching workout comments:', error);
      return [];
    }
  }

  /**
   * Get replies for a comment
   */
  static async getCommentReplies(commentId: string): Promise<WorkoutComment[]> {
    try {
      const { data, error } = await supabase
        .from('workout_comments')
        .select(`
          *,
          profiles!workout_comments_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('parent_comment_id', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((comment: any) => ({
        ...comment,
        user: comment.profiles ? {
          id: comment.profiles.id,
          display_name: comment.profiles.display_name,
          username: comment.profiles.username,
          avatar_url: comment.profiles.avatar_url,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      return [];
    }
  }

  /**
   * Create a new comment
   */
  static async createComment(commentData: CreateCommentData): Promise<WorkoutComment | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_comments')
        .insert({
          ...commentData,
          user_id: user.id,
        })
        .select(`
          *,
          profiles!workout_comments_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        user: data.profiles ? {
          id: data.profiles.id,
          display_name: data.profiles.display_name,
          username: data.profiles.username,
          avatar_url: data.profiles.avatar_url,
        } : undefined,
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  /**
   * Update a comment
   */
  static async updateComment(commentId: string, updates: UpdateCommentData): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workout_comments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating comment:', error);
      return false;
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workout_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  /**
   * Toggle like on a comment
   */
  static async toggleCommentLike(commentId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;
        return false; // unliked
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });

        if (error) throw error;
        return true; // liked
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      return false;
    }
  }

  // ============================================
  // RATINGS
  // ============================================

  /**
   * Get all ratings for a workout
   */
  static async getWorkoutRatings(workoutId: string, limit: number = 10): Promise<WorkoutRating[]> {
    try {
      const { data, error } = await supabase
        .from('workout_ratings')
        .select(`
          *,
          profiles!workout_ratings_user_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('custom_workout_id', workoutId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((rating: any) => ({
        ...rating,
        user: rating.profiles ? {
          id: rating.profiles.id,
          display_name: rating.profiles.display_name,
          username: rating.profiles.username,
          avatar_url: rating.profiles.avatar_url,
        } : undefined,
      }));
    } catch (error) {
      console.error('Error fetching workout ratings:', error);
      return [];
    }
  }

  /**
   * Get rating statistics for a workout
   */
  static async getWorkoutRatingStats(workoutId: string): Promise<RatingStats> {
    try {
      const { data, error } = await supabase
        .from('workout_ratings')
        .select('rating')
        .eq('custom_workout_id', workoutId);

      if (error) throw error;

      const ratings = data || [];
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      ratings.forEach((r: any) => {
        distribution[r.rating as keyof typeof distribution]++;
      });

      const average = ratings.length > 0
        ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        average_rating: Math.round(average * 100) / 100,
        rating_count: ratings.length,
        distribution,
      };
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      return {
        average_rating: 0,
        rating_count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
  }

  /**
   * Get user's rating for a workout
   */
  static async getUserRating(workoutId: string): Promise<WorkoutRating | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return null;

      const { data, error } = await supabase
        .from('workout_ratings')
        .select('*')
        .eq('custom_workout_id', workoutId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return null;
    }
  }

  /**
   * Create or update a rating
   */
  static async rateWorkout(ratingData: CreateRatingData): Promise<WorkoutRating | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Check if user already rated
      const existingRating = await this.getUserRating(ratingData.custom_workout_id);

      if (existingRating) {
        // Update existing rating
        const { data, error } = await supabase
          .from('workout_ratings')
          .update({
            rating: ratingData.rating,
            review: ratingData.review,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRating.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new rating
        const { data, error } = await supabase
          .from('workout_ratings')
          .insert({
            ...ratingData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error rating workout:', error);
      return null;
    }
  }

  /**
   * Delete a rating
   */
  static async deleteRating(workoutId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workout_ratings')
        .delete()
        .eq('custom_workout_id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting rating:', error);
      return false;
    }
  }

  // ============================================
  // FAVORITES
  // ============================================

  /**
   * Get user's favorites
   */
  static async getUserFavorites(): Promise<WorkoutFavorite[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return [];

      const { data, error } = await supabase
        .from('workout_favorites')
        .select(`
          *,
          custom_workouts!workout_favorites_custom_workout_id_fkey (
            id,
            name,
            description,
            difficulty,
            hero_image_url,
            estimated_duration,
            total_exercises
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((fav: any) => ({
        ...fav,
        workout: fav.custom_workouts,
      }));
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  /**
   * Get favorites grouped by collection
   */
  static async getFavoriteCollections(): Promise<FavoriteCollection[]> {
    try {
      const favorites = await this.getUserFavorites();
      const collections: Record<string, WorkoutFavorite[]> = {};

      favorites.forEach((fav) => {
        const collectionName = fav.collection_name || 'Uncategorized';
        if (!collections[collectionName]) {
          collections[collectionName] = [];
        }
        collections[collectionName].push(fav);
      });

      return Object.entries(collections).map(([name, workouts]) => ({
        name,
        count: workouts.length,
        workouts,
      }));
    } catch (error) {
      console.error('Error fetching favorite collections:', error);
      return [];
    }
  }

  /**
   * Check if workout is favorited by user
   */
  static async isFavorited(workoutId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return false;

      const { data, error } = await supabase
        .from('workout_favorites')
        .select('id')
        .eq('custom_workout_id', workoutId)
        .eq('user_id', user.id)
        .single();

      if (error) return false;
      return !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Add workout to favorites
   */
  static async addToFavorites(favoriteData: CreateFavoriteData): Promise<WorkoutFavorite | null> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_favorites')
        .insert({
          ...favoriteData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return null;
    }
  }

  /**
   * Remove from favorites
   */
  static async removeFromFavorites(workoutId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workout_favorites')
        .delete()
        .eq('custom_workout_id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Update favorite (change collection or notes)
   */
  static async updateFavorite(workoutId: string, updates: UpdateFavoriteData): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('workout_favorites')
        .update(updates)
        .eq('custom_workout_id', workoutId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating favorite:', error);
      return false;
    }
  }

  // ============================================
  // FOLLOWS
  // ============================================

  /**
   * Get followers of a user
   */
  static async getFollowers(userId: string, limit: number = 50): Promise<UserFollow[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          follower:profiles!user_follows_follower_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            follower_count,
            following_count,
            workout_count
          )
        `)
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  }

  /**
   * Get users that a user is following
   */
  static async getFollowing(userId: string, limit: number = 50): Promise<UserFollow[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          following:profiles!user_follows_following_id_fkey (
            id,
            display_name,
            username,
            avatar_url,
            follower_count,
            following_count,
            workout_count
          )
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }

  /**
   * Get follow stats for a user
   */
  static async getFollowStats(userId: string): Promise<FollowStats> {
    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('follower_count, following_count')
        .eq('id', userId)
        .single();

      if (error) throw error;

      let is_following = false;
      let is_followed_by = false;

      if (currentUser && currentUser.id !== userId) {
        // Check if current user follows this user
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .single();

        is_following = !!followData;

        // Check if this user follows current user
        const { data: followedByData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', userId)
          .eq('following_id', currentUser.id)
          .single();

        is_followed_by = !!followedByData;
      }

      return {
        follower_count: profile?.follower_count || 0,
        following_count: profile?.following_count || 0,
        is_following,
        is_followed_by,
      };
    } catch (error) {
      console.error('Error fetching follow stats:', error);
      return {
        follower_count: 0,
        following_count: 0,
        is_following: false,
        is_followed_by: false,
      };
    }
  }

  /**
   * Follow a user
   */
  static async followUser(userId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      if (user.id === userId) throw new Error('Cannot follow yourself');

      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(userId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  /**
   * Toggle follow status
   */
  static async toggleFollow(userId: string): Promise<boolean> {
    try {
      const stats = await this.getFollowStats(userId);
      if (stats.is_following) {
        return await this.unfollowUser(userId);
      } else {
        return await this.followUser(userId);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      return false;
    }
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  /**
   * Get user's notifications
   */
  static async getNotifications(limit: number = 50): Promise<Notification[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (
            id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get notification stats
   */
  static async getNotificationStats(): Promise<NotificationStats> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return { unread_count: 0, total_count: 0 };

      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      const { count: totalCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        unread_count: unreadCount || 0,
        total_count: totalCount || 0,
      };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return { unread_count: 0, total_count: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // ============================================
  // VIEW TRACKING
  // ============================================

  /**
   * Track a workout view
   */
  static async trackWorkoutView(viewData: CreateViewData): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('workout_views')
        .insert({
          custom_workout_id: viewData.custom_workout_id,
          user_id: user?.id || null,
          session_id: viewData.session_id || null,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error tracking view:', error);
      return false;
    }
  }

  // ============================================
  // CREATOR PROFILE
  // ============================================

  /**
   * Get creator profile with stats
   */
  static async getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const stats = await this.getCreatorStats(userId);
      const followStats = await this.getFollowStats(userId);

      return {
        ...profile,
        total_likes: stats.total_likes,
        total_uses: stats.total_uses,
        ...followStats,
      };
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      return null;
    }
  }

  /**
   * Get creator statistics
   */
  static async getCreatorStats(userId: string): Promise<CreatorStats> {
    try {
      const { data: workouts } = await supabase
        .from('custom_workouts')
        .select('like_count, use_count, view_count, favorite_count, average_rating')
        .eq('user_id', userId)
        .eq('is_public', true);

      const { count: workoutCount } = await supabase
        .from('custom_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_public', true);

      const stats = (workouts || []).reduce(
        (acc, workout) => ({
          total_likes: acc.total_likes + (workout.like_count || 0),
          total_uses: acc.total_uses + (workout.use_count || 0),
          total_views: acc.total_views + (workout.view_count || 0),
          total_favorites: acc.total_favorites + (workout.favorite_count || 0),
          rating_sum: acc.rating_sum + (workout.average_rating || 0),
        }),
        { total_likes: 0, total_uses: 0, total_views: 0, total_favorites: 0, rating_sum: 0 }
      );

      const followStats = await this.getFollowStats(userId);

      return {
        total_workouts: workoutCount || 0,
        total_likes: stats.total_likes,
        total_uses: stats.total_uses,
        total_views: stats.total_views,
        total_favorites: stats.total_favorites,
        average_rating: workouts && workouts.length > 0 ? stats.rating_sum / workouts.length : 0,
        follower_count: followStats.follower_count,
        following_count: followStats.following_count,
      };
    } catch (error) {
      console.error('Error fetching creator stats:', error);
      return {
        total_workouts: 0,
        total_likes: 0,
        total_uses: 0,
        total_views: 0,
        total_favorites: 0,
        average_rating: 0,
        follower_count: 0,
        following_count: 0,
      };
    }
  }

  // ============================================
  // SOCIAL CONTEXT (for single workout view)
  // ============================================

  /**
   * Get all social context for a workout (likes, favorites, ratings, etc.)
   */
  static async getSocialContext(workoutId: string): Promise<SocialContextData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      const [isLiked, isFavorited, userRating, workout] = await Promise.all([
        (async () => {
          const { data } = await supabase
            .from('workout_likes')
            .select('id')
            .eq('custom_workout_id', workoutId)
            .eq('user_id', user.id)
            .single();
          return !!data;
        })(),
        this.isFavorited(workoutId),
        this.getUserRating(workoutId),
        (async () => {
          const { data } = await supabase
            .from('custom_workouts')
            .select('user_id')
            .eq('id', workoutId)
            .single();
          return data;
        })(),
      ]);

      let is_following_creator = false;
      if (workout && workout.user_id !== user.id) {
        const followStats = await this.getFollowStats(workout.user_id);
        is_following_creator = followStats.is_following || false;
      }

      return {
        is_liked: isLiked,
        is_favorited: isFavorited,
        is_rated: !!userRating,
        user_rating: userRating?.rating,
        is_following_creator,
      };
    } catch (error) {
      console.error('Error fetching social context:', error);
      return {};
    }
  }
}