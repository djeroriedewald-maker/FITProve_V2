/**
 * Favorite Button Component
 * Heart button to save/unsave workouts to favorites
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bookmark } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutSocialService } from '../../lib/workout-social.service';

interface FavoriteButtonProps {
  workoutId: string;
  variant?: 'heart' | 'bookmark';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  onToggle?: (isFavorited: boolean) => void;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  workoutId,
  variant = 'heart',
  size = 'md',
  showCount = false,
  onToggle,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  // Load favorite status
  useEffect(() => {
    loadFavoriteStatus();
  }, [workoutId, user]);

  const loadFavoriteStatus = async () => {
    setLoading(true);
    try {
      if (user) {
        const favorited = await WorkoutSocialService.isFavorited(workoutId);
        setIsFavorited(favorited);
      }
      // TODO: Load favorite count from workout data
      // setFavoriteCount(workout.favorite_count);
    } catch (error) {
      console.error('Error loading favorite status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite
  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    // Optimistic update
    const newState = !isFavorited;
    setIsFavorited(newState);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    try {
      if (newState) {
        await WorkoutSocialService.addToFavorites({
          custom_workout_id: workoutId,
        });
        toast.success('Added to favorites!');
        if (showCount) setFavoriteCount((prev) => prev + 1);
      } else {
        await WorkoutSocialService.removeFromFavorites(workoutId);
        toast.success('Removed from favorites');
        if (showCount) setFavoriteCount((prev) => Math.max(0, prev - 1));
      }

      if (onToggle) {
        onToggle(newState);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setIsFavorited(!newState);
      toast.error('Failed to update favorite');
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Icon component
  const Icon = variant === 'heart' ? Heart : Bookmark;

  if (loading) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-full bg-white/10 flex items-center justify-center`}
      >
        <div className={`${iconSizeClasses[size]} border-2 border-white/40 border-t-transparent rounded-full animate-spin`} />
      </button>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all relative ${
          isFavorited
            ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-lg shadow-red-500/25'
            : 'bg-white/10 hover:bg-white/20'
        }`}
      >
        <Icon
          className={`${iconSizeClasses[size]} transition-all ${
            isFavorited ? 'fill-current text-white' : 'text-white'
          }`}
        />

        {/* Animated particles on favorite */}
        <AnimatePresence>
          {animating && isFavorited && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: 0,
                    scale: 1,
                    x: Math.cos((i * Math.PI * 2) / 8) * 40,
                    y: Math.sin((i * Math.PI * 2) / 8) * 40,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute w-2 h-2 bg-red-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-4px',
                    marginTop: '-4px',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Count display */}
      {showCount && favoriteCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-sm text-white/60 font-medium"
        >
          {favoriteCount}
        </motion.span>
      )}
    </div>
  );
};