/**
 * Workout Comments Component
 * Displays comments with nested replies, likes, and add comment functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Send, Trash2, Reply } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutSocialService } from '../../lib/workout-social.service';
import { WorkoutComment } from '../../types/workout-social.types';
import { formatDistanceToNow } from 'date-fns';

interface WorkoutCommentsProps {
  workoutId: string;
  compact?: boolean; // Show compact version with limited comments
}

export const WorkoutComments: React.FC<WorkoutCommentsProps> = ({ workoutId, compact = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<WorkoutComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Load comments
  useEffect(() => {
    loadComments();
  }, [workoutId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await WorkoutSocialService.getWorkoutComments(workoutId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Add new comment
  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await WorkoutSocialService.createComment({
        custom_workout_id: workoutId,
        content: newComment.trim(),
      });

      setNewComment('');
      await loadComments();
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Add reply
  const handleAddReply = async (parentCommentId: string) => {
    if (!user) {
      toast.error('Please sign in to reply');
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await WorkoutSocialService.createComment({
        custom_workout_id: workoutId,
        content: replyText.trim(),
        parent_comment_id: parentCommentId,
      });

      setReplyText('');
      setReplyingTo(null);
      await loadComments();
      toast.success('Reply added!');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle like on comment
  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to like');
      return;
    }

    try {
      await WorkoutSocialService.toggleCommentLike(commentId);
      await loadComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await WorkoutSocialService.deleteComment(commentId);
      await loadComments();
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Load replies for a comment
  const handleLoadReplies = async (commentId: string) => {
    try {
      const replies = await WorkoutSocialService.getCommentReplies(commentId);

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, replies } : comment
        )
      );

      setExpandedComments((prev) => new Set([...prev, commentId]));
    } catch (error) {
      console.error('Error loading replies:', error);
      toast.error('Failed to load replies');
    }
  };

  // Render single comment
  const renderComment = (comment: WorkoutComment, isReply: boolean = false) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.reply_count > 0;
    const isOwnComment = user?.id === comment.user_id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${isReply ? 'ml-12' : ''}`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.user?.avatar_url ? (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {comment.user?.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">
                    {comment.user?.display_name || 'Unknown User'}
                  </div>
                  <div className="text-xs text-white/60">
                    @{comment.user?.username || 'unknown'} "{' '}
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </div>
                </div>

                {/* Actions Menu */}
                {isOwnComment && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Comment Text */}
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-2 px-3">
              <button
                onClick={() => handleToggleLike(comment.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.is_liked
                    ? 'text-red-400'
                    : 'text-white/60 hover:text-red-400'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`}
                />
                <span>{comment.like_count > 0 ? comment.like_count : 'Like'}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 text-xs text-white/60 hover:text-cyan-400 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}

              {/* View Replies */}
              {hasReplies && !isReply && (
                <button
                  onClick={() => {
                    if (isExpanded) {
                      setExpandedComments((prev) => {
                        const next = new Set(prev);
                        next.delete(comment.id);
                        return next;
                      });
                    } else {
                      handleLoadReplies(comment.id);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isExpanded ? 'Hide' : 'View'} {comment.reply_count}{' '}
                    {comment.reply_count === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddReply(comment.id);
                      }
                    }}
                    placeholder="Write a reply..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white text-sm placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    disabled={submitting}
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={submitting || !replyText.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="px-4 py-2 bg-white/10 rounded-xl text-white"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Nested Replies */}
            {isExpanded && comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                <AnimatePresence>
                  {comment.replies.map((reply) => renderComment(reply, true))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Compact view (show only first few comments)
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-semibold">
            Comments ({comments.length})
          </h3>
        </div>

        {/* Comments */}
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-2" />
            <p className="text-white/60 text-sm">No comments yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.slice(0, 3).map((comment) => renderComment(comment))}
            {comments.length > 3 && (
              <button className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                View all {comments.length} comments
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      {user && (
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="You"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user.user_metadata?.display_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              disabled={submitting}
            />
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Post
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg mb-2">No comments yet</p>
          <p className="text-white/40 text-sm">
            {user ? 'Be the first to share your thoughts!' : 'Sign in to comment'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment) => renderComment(comment))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};