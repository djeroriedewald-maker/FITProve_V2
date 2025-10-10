/**
 * Workout-Specific Social Features Type Definitions
 * Includes: Comments, Ratings, Favorites, Follows, Notifications
 */

// ============================================
// COMMENT TYPES
// ============================================

export interface WorkoutComment {
  id: string;
  custom_workout_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  content: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;

  // Relations (loaded separately)
  user?: CommentUser;
  replies?: WorkoutComment[];
  is_liked?: boolean; // Whether current user has liked
}

export interface CommentUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

export interface CreateCommentData {
  custom_workout_id: string;
  content: string;
  parent_comment_id?: string | null;
}

export interface UpdateCommentData {
  content: string;
}

// ============================================
// RATING TYPES
// ============================================

export interface WorkoutRating {
  id: string;
  custom_workout_id: string;
  user_id: string;
  rating: number; // 1-5
  review?: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  user?: CommentUser;
}

export interface CreateRatingData {
  custom_workout_id: string;
  rating: number;
  review?: string;
}

export interface UpdateRatingData {
  rating: number;
  review?: string;
}

export interface RatingStats {
  average_rating: number;
  rating_count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// ============================================
// FAVORITE TYPES
// ============================================

export interface WorkoutFavorite {
  id: string;
  custom_workout_id: string;
  user_id: string;
  collection_name?: string | null;
  notes?: string | null;
  created_at: string;

  // Relations (loaded separately)
  workout?: FavoriteWorkout;
}

export interface FavoriteWorkout {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  hero_image_url?: string;
  estimated_duration?: number;
  total_exercises: number;
}

export interface CreateFavoriteData {
  custom_workout_id: string;
  collection_name?: string;
  notes?: string;
}

export interface UpdateFavoriteData {
  collection_name?: string;
  notes?: string;
}

export interface FavoriteCollection {
  name: string;
  count: number;
  workouts: WorkoutFavorite[];
}

// ============================================
// FOLLOW TYPES
// ============================================

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;

  // Relations
  follower?: FollowUser;
  following?: FollowUser;
}

export interface FollowUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  follower_count?: number;
  following_count?: number;
  workout_count?: number;
}

export interface FollowStats {
  follower_count: number;
  following_count: number;
  is_following?: boolean; // Whether current user follows this user
  is_followed_by?: boolean; // Whether this user follows current user
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'rating'
  | 'featured'
  | 'milestone';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string | null;
  actor_id?: string | null;
  related_workout_id?: string | null;
  related_comment_id?: string | null;
  is_read: boolean;
  created_at: string;

  // Relations
  actor?: NotificationActor;
}

export interface NotificationActor {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  actor_id?: string;
  related_workout_id?: string;
  related_comment_id?: string;
}

export interface NotificationStats {
  unread_count: number;
  total_count: number;
}

// ============================================
// VIEW TRACKING TYPES
// ============================================

export interface WorkoutView {
  id: string;
  custom_workout_id: string;
  user_id?: string | null;
  session_id?: string | null;
  created_at: string;
}

export interface CreateViewData {
  custom_workout_id: string;
  session_id?: string;
}

// ============================================
// ACTIVITY FEED TYPES
// ============================================

export type ActivityType =
  | 'workout_created'
  | 'comment_added'
  | 'workout_liked'
  | 'user_followed';

export interface ActivityItem {
  activity_type: ActivityType;
  activity_id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;

  // User info
  user_name: string;
  username: string;
  user_avatar?: string;

  // Related data
  workout_id?: string;
  workout_name?: string;
}

// ============================================
// CREATOR PROFILE TYPES
// ============================================

export interface CreatorProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;

  // Stats
  follower_count: number;
  following_count: number;
  workout_count: number;
  total_likes: number;
  total_uses: number;

  // Verification/badges
  is_verified?: boolean;
  badges?: string[];

  // Social
  is_following?: boolean;
  is_followed_by?: boolean;

  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface CreatorStats {
  total_workouts: number;
  total_likes: number;
  total_uses: number;
  total_views: number;
  total_favorites: number;
  average_rating: number;
  follower_count: number;
  following_count: number;
}

// ============================================
// SOCIAL CONTEXT TYPES (for components)
// ============================================

export interface SocialContextData {
  is_liked?: boolean;
  is_favorited?: boolean;
  is_rated?: boolean;
  user_rating?: number;
  is_following_creator?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface SocialActionResponse {
  success: boolean;
  message?: string;
  data?: any;
}
