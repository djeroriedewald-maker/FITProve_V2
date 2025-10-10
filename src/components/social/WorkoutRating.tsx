/**
 * Workout Rating Component
 * Displays rating stars, average rating, and allows users to rate workouts
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { WorkoutSocialService } from '../../lib/workout-social.service';
import { RatingStats } from '../../types/workout-social.types';

interface WorkoutRatingProps {
  workoutId: string;
  compact?: boolean;
  showDistribution?: boolean;
}

export const WorkoutRating: React.FC<WorkoutRatingProps> = ({
  workoutId,
  compact = false,
  showDistribution = false,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load rating stats and user's rating
  useEffect(() => {
    loadRatings();
  }, [workoutId]);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const [ratingStats, userRatingData] = await Promise.all([
        WorkoutSocialService.getWorkoutRatingStats(workoutId),
        user ? WorkoutSocialService.getUserRating(workoutId) : null,
      ]);

      setStats(ratingStats);
      if (userRatingData) {
        setUserRating(userRatingData.rating);
        setReviewText(userRatingData.review || '');
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit rating
  const handleSubmitRating = async () => {
    if (!user) {
      toast.error('Please sign in to rate');
      return;
    }

    if (userRating === 0 && hoverRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await WorkoutSocialService.rateWorkout({
        custom_workout_id: workoutId,
        rating: hoverRating || userRating,
        review: reviewText.trim() || undefined,
      });

      toast.success('Rating submitted!');
      setShowRatingModal(false);
      await loadRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  // Render star
  const renderStar = (index: number, interactive: boolean = false) => {
    const filled = interactive
      ? index <= (hoverRating || userRating)
      : index <= (stats?.average_rating || 0);

    return (
      <motion.button
        key={index}
        onClick={() => interactive && setHoverRating(index)}
        onMouseEnter={() => interactive && setHoverRating(index)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        disabled={!interactive}
        whileHover={interactive ? { scale: 1.2 } : {}}
        whileTap={interactive ? { scale: 0.9 } : {}}
        className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            filled
              ? 'fill-yellow-400 text-yellow-400'
              : interactive
              ? 'text-white/40 hover:text-yellow-400'
              : 'text-white/20'
          }`}
        />
      </motion.button>
    );
  };

  // Compact view - just show average rating
  if (compact) {
    if (loading) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!stats || stats.rating_count === 0) {
      return (
        <div className="flex items-center gap-1 text-white/60 text-sm">
          <Star className="w-4 h-4" />
          <span>No ratings</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i <= Math.round(stats.average_rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-white/20'
              }`}
            />
          ))}
        </div>
        <span className="text-white font-semibold text-sm">
          {stats.average_rating.toFixed(1)}
        </span>
        <span className="text-white/60 text-xs">({stats.rating_count})</span>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Header with average */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Rating</h3>
          </div>
          {loading ? (
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          ) : stats && stats.rating_count > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {stats.average_rating.toFixed(1)}
              </span>
              <span className="text-white/60">out of 5</span>
            </div>
          ) : (
            <p className="text-white/60">No ratings yet</p>
          )}
          {stats && stats.rating_count > 0 && (
            <p className="text-sm text-white/60 mt-1">
              {stats.rating_count} {stats.rating_count === 1 ? 'rating' : 'ratings'}
            </p>
          )}
        </div>

        {/* Rate button */}
        {user && (
          <button
            onClick={() => setShowRatingModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-500/25 transition-all"
          >
            <Star className="w-5 h-5" />
            {userRating > 0 ? 'Update Rating' : 'Rate Workout'}
          </button>
        )}
      </div>

      {/* Star display */}
      {!loading && stats && stats.rating_count > 0 && (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) =>
            renderStar(i, false)
          )}
        </div>
      )}

      {/* Rating distribution */}
      {showDistribution && stats && stats.rating_count > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star as keyof typeof stats.distribution];
            const percentage = stats.rating_count > 0 ? (count / stats.rating_count) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-white/60 w-12">{star} stars</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: (5 - star) * 0.1 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                  />
                </div>
                <span className="text-sm text-white/60 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRatingModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-6 z-50 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-6">
                {userRating > 0 ? 'Update Your Rating' : 'Rate This Workout'}
              </h3>

              {/* Star selector */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((i) => renderStar(i, true))}
              </div>

              {/* Selected rating text */}
              {(hoverRating || userRating) > 0 && (
                <p className="text-center text-white/60 mb-6">
                  {hoverRating || userRating} out of 5 stars
                </p>
              )}

              {/* Review text */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Review (optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this workout..."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 resize-none"
                />
                <p className="text-xs text-white/40 mt-1">
                  {reviewText.length} / 1000 characters
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-3 bg-white/10 rounded-xl text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={submitting || ((hoverRating || userRating) === 0)}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Star className="w-5 h-5" />
                      </motion.div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5" />
                      Submit Rating
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};