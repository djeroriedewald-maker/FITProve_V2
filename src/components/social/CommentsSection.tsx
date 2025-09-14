import React, { useState, useEffect } from 'react';
import { Comment, CreateCommentData } from '../../types/social.types';
import { createComment, getComments } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Reply, Heart, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface CommentsSectionProps {
  postId: string;
  commentsCount: number;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, level = 0 }) => {
  const maxLevel = 3; // Maximum nesting level
  const canReply = level < maxLevel;

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className="flex space-x-3 py-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            src={comment.author.avatarUrl || '/default-avatar.svg'}
            alt={comment.author.displayName || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-1 mb-1">
              <span className="text-sm font-medium text-gray-900">
                {comment.author.displayName || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { 
                  addSuffix: true, 
                  locale: nl 
                })}
              </span>
            </div>
            <p className="text-sm text-gray-800">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-1 ml-3">
            <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <Heart className="w-3 h-3" />
              <span>Like</span>
            </button>
            
            {canReply && (
              <button 
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reageer</span>
              </button>
            )}
          </div>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  postId, 
  commentsCount, 
  className = '' 
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load comments when expanded
  useEffect(() => {
    if (isExpanded && comments.length === 0) {
      loadComments();
    }
  }, [isExpanded]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      const commentData: CreateCommentData = {
        postId,
        content: newComment.trim(),
        parentId: replyingTo || undefined
      };

      await createComment(commentData);
      
      // Reset form
      setNewComment('');
      setReplyingTo(null);
      
      // Reload comments
      await loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setIsExpanded(true);
  };

  return (
    <div className={`border-t border-gray-100 ${className}`}>
      {/* Comments Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span>
            {commentsCount === 0 
              ? 'Voeg een reactie toe...' 
              : `${commentsCount} reactie${commentsCount !== 1 ? 's' : ''}`
            }
          </span>
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* Expanded Comments Section */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {/* New Comment Form */}
          {user && (
            <form onSubmit={handleSubmitComment} className="p-3 border-b border-gray-100">
              <div className="flex space-x-3">
                <img
                  src={user.user_metadata?.avatar_url || '/default-avatar.svg'}
                  alt={user.user_metadata?.full_name || 'You'}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  {replyingTo && (
                    <div className="mb-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      Reageren op een reactie...
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="ml-2 text-blue-500 hover:underline"
                      >
                        Annuleren
                      </button>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyingTo ? "Schrijf een reactie..." : "Voeg een reactie toe..."}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {newComment.length}/500 karakters
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2">Reacties laden...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nog geen reacties. Wees de eerste!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};