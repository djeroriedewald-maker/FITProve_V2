/**
 * Follow Button Component
 * Button to follow/unfollow users
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserMinus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutSocialService } from '../../lib/workout-social.service';

interface FollowButtonProps {
  userId: string;
  variant?: 'default' | 'compact';
  onToggle?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  variant = 'default',
  onToggle,
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Don't show button for own profile
  if (user?.id === userId) {
    return null;
  }

  // Load follow status
  useEffect(() => {
    loadFollowStatus();
  }, [userId, user]);

  const loadFollowStatus = async () => {
    setLoading(true);
    try {
      if (user) {
        const stats = await WorkoutSocialService.getFollowStats(userId);
        setIsFollowing(stats.is_following || false);
      }
    } catch (error) {
      console.error('Error loading follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle follow
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    setSubmitting(true);

    // Optimistic update
    const newState = !isFollowing;
    setIsFollowing(newState);

    try {
      const success = await WorkoutSocialService.toggleFollow(userId);

      if (success) {
        toast.success(newState ? 'Following!' : 'Unfollowed');
        if (onToggle) {
          onToggle(newState);
        }
      } else {
        // Revert on failure
        setIsFollowing(!newState);
        toast.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert on error
      setIsFollowing(!newState);
      toast.error('Failed to update follow status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className={`${
          variant === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2'
        } rounded-xl bg-white/10 flex items-center justify-center`}
      >
        <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
      </button>
    );
  }

  // Compact variant (small button)
  if (variant === 'compact') {
    return (
      <motion.button
        onClick={handleToggle}
        disabled={submitting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
          isFollowing
            ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400'
            : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isFollowing ? (
          <>
            <Check className="w-4 h-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Follow
          </>
        )}
      </motion.button>
    );
  }

  // Default variant (full button)
  return (
    <motion.button
      onClick={handleToggle}
      disabled={submitting}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
        isFollowing
          ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 group'
          : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {submitting ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <UserPlus className="w-5 h-5" />
          </motion.div>
          <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
        </>
      ) : isFollowing ? (
        <>
          <Check className="w-5 h-5 group-hover:hidden" />
          <UserMinus className="w-5 h-5 hidden group-hover:block" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:block">Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  );
};