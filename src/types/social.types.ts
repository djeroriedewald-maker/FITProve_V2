import { Database, PostType } from './database.types';

type DbPost = Database['public']['Tables']['posts']['Row'];
type DbComment = Database['public']['Tables']['comments']['Row'];
type DbLike = Database['public']['Tables']['likes']['Row'];

// Reaction types voor likes
export type ReactionType = 'like' | 'love' | 'fire' | 'strong';

export interface ReactionEmoji {
  type: ReactionType;
  emoji: string;
  label: string;
}

export const REACTIONS: Record<ReactionType, ReactionEmoji> = {
  like: { type: 'like', emoji: '👍', label: 'Like' },
  love: { type: 'love', emoji: '❤️', label: 'Love' },
  fire: { type: 'fire', emoji: '🔥', label: 'Fire' },
  strong: { type: 'strong', emoji: '💪', label: 'Strong' }
};

export interface Post extends DbPost {
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  isLiked?: boolean;
  userReaction?: ReactionType | null;
  reactionCounts?: Record<ReactionType, number>;
}

export interface Comment extends Omit<DbComment, 'user_id'> {
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
  isLiked?: boolean;
  userReaction?: ReactionType | null;
  reactionCounts?: Record<ReactionType, number>;
  replies?: Comment[];
}

export interface Like extends DbLike {
  reaction_type: ReactionType;
}

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
  reactionType: ReactionType;
}