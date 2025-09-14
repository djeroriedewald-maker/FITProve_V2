import { useState, useEffect } from 'react';
import { MessageCircle, Share, MoreHorizontal, Calendar, Trophy, Camera, Edit3, Trash2 } from 'lucide-react';
import { Post, CreatePostData, ReactionType } from '../../types/social.types';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPosts, createPost, toggleLike, updatePost, deletePost } from '../../lib/api';
import { EditPostModal, DeleteConfirmation, ReactionButton } from './';
import { CommentsSection } from './CommentsSection';
import { formatDistanceToNow } from 'date-fns';

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    loadPosts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setPostMenuOpen(null);
    if (postMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [postMenuOpen]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;

    try {
      setIsCreatingPost(true);
      const postData: CreatePostData = {
        content: newPostContent.trim(),
        type: 'general'
      };
      
      const newPost = await createPost(postData);
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleToggleReaction = async (postId: string, reactionType: ReactionType) => {
    if (!user) return;

    try {
      await toggleLike({ postId, reactionType });
      
      // Optimistically update the UI
      setPosts(posts.map(post => {
        if (post.id !== postId) return post;
        
        // Ensure reactionCounts exist with default values
        const currentCounts = post.reactionCounts || { like: 0, love: 0, fire: 0, strong: 0 };
        const newReactionCounts = { ...currentCounts };
        const wasUserReaction = post.userReaction === reactionType;
        
        // Remove previous reaction count if user had a different reaction
        if (post.userReaction && post.userReaction !== reactionType) {
          newReactionCounts[post.userReaction] = Math.max(0, (newReactionCounts[post.userReaction] || 0) - 1);
        }
        
        // Toggle the current reaction
        if (wasUserReaction) {
          // Remove reaction
          newReactionCounts[reactionType] = Math.max(0, (newReactionCounts[reactionType] || 0) - 1);
          return {
            ...post,
            userReaction: null,
            isLiked: false,
            reactionCounts: newReactionCounts,
            likes_count: Math.max(0, post.likes_count - 1)
          };
        } else {
          // Add reaction
          newReactionCounts[reactionType] = (newReactionCounts[reactionType] || 0) + 1;
          const wasLiked = post.isLiked;
          return {
            ...post,
            userReaction: reactionType,
            isLiked: true,
            reactionCounts: newReactionCounts,
            likes_count: wasLiked ? post.likes_count : post.likes_count + 1
          };
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle reaction');
    }
  };

  const handleEditPost = async (content: string) => {
    if (!editingPost) return;

    try {
      const updatedPost = await updatePost(editingPost.id, content);
      setPosts(posts.map(post => 
        post.id === editingPost.id 
          ? { ...updatedPost, isLiked: post.isLiked } // Preserve like status
          : post
      ));
      setEditingPost(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (!deletingPostId) return;

    try {
      await deletePost(deletingPostId);
      setPosts(posts.filter(post => post.id !== deletingPostId));
      setDeletingPostId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const isUserPost = (post: Post) => {
    return user && post.user_id === user.id;
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'media':
        return <Camera className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-1" />
                <div className="h-3 bg-gray-300 rounded w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full" />
              <div className="h-4 bg-gray-300 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button 
          onClick={loadPosts}
          className="mt-2 text-red-600 dark:text-red-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {user && profile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-start space-x-3">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-medium">
                  {profile.displayName?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your fitness journey..."
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Camera className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isCreatingPost}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingPost ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No posts yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {post.author.avatarUrl ? (
                      <img
                        src={post.author.avatarUrl}
                        alt={post.author.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {post.author.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {post.author.displayName}
                        </h3>
                        {getPostIcon(post.type)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{post.author.username} • {formatDistanceToNow(new Date(post.created_at))} ago
                        {post.updated_at !== post.created_at && (
                          <span className="ml-1 text-xs">(edited)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Post Menu */}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPostMenuOpen(postMenuOpen === post.id ? null : post.id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {postMenuOpen === post.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                      >
                        {isUserPost(post) ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingPost(post);
                                setPostMenuOpen(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit Post</span>
                            </button>
                            <button
                              onClick={() => {
                                setDeletingPostId(post.id);
                                setPostMenuOpen(null);
                              }}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Post</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setPostMenuOpen(null)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Share className="w-4 h-4" />
                            <span>Share Post</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                {post.content && (
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>
                )}

                {/* Media placeholder for future media posts */}
                {post.media_url && post.media_url.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {post.media_url.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt="Post media"
                        className="rounded-lg object-cover aspect-square"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <ReactionButton
                      onReactionToggle={(reactionType) => handleToggleReaction(post.id, reactionType)}
                      currentReaction={post.userReaction}
                      reactionCounts={post.reactionCounts}
                      totalLikes={post.likes_count}
                    />
                    
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <CommentsSection 
                postId={post.id}
                commentsCount={post.comments_count}
              />
            </div>
          ))
        )}
      </div>

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        onSave={handleEditPost}
        currentContent={editingPost?.content || ''}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={!!deletingPostId}
        onClose={() => setDeletingPostId(null)}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}