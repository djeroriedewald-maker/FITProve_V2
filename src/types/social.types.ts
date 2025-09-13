import { Database, PostType } from './database.types';

type DbPost = Database['public']['Tables']['posts']['Row'];
type DbComment = Database['public']['Tables']['comments']['Row'];
type DbLike = Database['public']['Tables']['likes']['Row'];

export interface Post extends Omit<DbPost, 'user_id'> {
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  isLiked?: boolean;
}

export interface Comment extends Omit<DbComment, 'user_id'> {
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Like extends DbLike {}

export interface CreatePostData {
  content?: string;
  mediaUrls?: string[];
  type: PostType;
  workoutId?: string;
  achievementId?: string;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentId?: string;
}

export interface ToggleLikeData {
  postId?: string;
  commentId?: string;
}