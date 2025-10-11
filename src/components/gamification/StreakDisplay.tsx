import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Calendar, Award } from 'lucide-react';
import { GamificationService } from '../../services/gamification.service';
import { useAuth } from '../../contexts/AuthContext';
import type { UserStreak } from '../../types/gamification.types';

interface StreakDisplayProps {
  variant?: 'compact' | 'full';
  showLongest?: boolean;
}

export function StreakDisplay({ variant = 'compact', showLongest = true }: StreakDisplayProps) {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const fetchStreak = async () => {
    if (!user) return;

    try {
      const data = await GamificationService.getUserStreak(user.id);
      setStreak(data);
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streak) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-white/10 rounded-xl" />
      </div>
    );
  }

  const getStreakColor = (days: number) => {
    if (days >= 100) return 'from-purple-500 to-pink-500';
    if (days >= 30) return 'from-orange-500 to-red-500';
    if (days >= 7) return 'from-yellow-500 to-orange-500';
    return 'from-cyan-500 to-blue-500';
  };

  const getStreakMessage = (days: number) => {
    if (days === 0) return "Let's start a streak!";
    if (days === 1) return 'Great start!';
    if (days < 7) return 'Keep it up!';
    if (days < 30) return "You're on fire!";
    if (days < 100) return 'Unstoppable!';
    return 'Legendary streak!';
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`relative bg-gradient-to-r ${getStreakColor(
          streak.current_streak
        )}/20 backdrop-blur-xl rounded-xl p-4 border ${getStreakColor(
          streak.current_streak
        ).replace('from-', 'border-').split(' ')[0]}/30`}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-4">
          {/* Flame Icon */}
          <motion.div
            className="relative"
            animate={streak.current_streak > 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${getStreakColor(
                streak.current_streak
              )} flex items-center justify-center shadow-lg`}
            >
              <Flame className="w-7 h-7 text-white" />
            </div>

            {/* Animated glow */}
            {streak.current_streak > 0 && (
              <motion.div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${getStreakColor(
                  streak.current_streak
                )}`}
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Streak Info */}
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-white">{streak.current_streak}</span>
              <span className="text-sm text-white/60">day streak</span>
            </div>
            <div className="text-sm text-white/70">{getStreakMessage(streak.current_streak)}</div>
          </div>

          {/* Longest Badge */}
          {showLongest && streak.longest_streak > 0 && (
            <div className="text-right">
              <div className="text-xs text-white/60 mb-1">Personal Best</div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Award className="w-4 h-4" />
                <span className="text-lg font-bold">{streak.longest_streak}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <motion.div
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          className={`p-3 rounded-xl bg-gradient-to-br ${getStreakColor(streak.current_streak)}`}
          animate={streak.current_streak > 0 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Flame className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white">Your Streak</h3>
          <p className="text-sm text-white/60">{getStreakMessage(streak.current_streak)}</p>
        </div>
      </div>

      {/* Main Streak Counter */}
      <div className="text-center mb-6 p-6 bg-white/5 rounded-xl">
        <motion.div
          className="text-7xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {streak.current_streak}
        </motion.div>
        <div className="text-lg text-white/70">Days in a row</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Current Streak */}
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{streak.current_streak}</div>
          <div className="text-xs text-white/60">Current</div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{streak.longest_streak}</div>
          <div className="text-xs text-white/60">Personal Best</div>
        </div>
      </div>

      {/* Progress to Milestones */}
      {streak.current_streak > 0 && (
        <div className="mt-4">
          <div className="text-sm text-white/60 mb-2">Next Milestone</div>
          <StreakMilestoneProgress current={streak.current_streak} />
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 text-center">
        <div className="text-sm text-white/70">
          {streak.current_streak === 0
            ? 'Complete a workout today to start your streak! 🔥'
            : streak.current_streak < 7
            ? `Just ${7 - streak.current_streak} more day${
                7 - streak.current_streak === 1 ? '' : 's'
              } to reach a 7-day streak!`
            : streak.current_streak < 30
            ? `Amazing! ${30 - streak.current_streak} days until 30-day milestone!`
            : streak.current_streak < 100
            ? `Incredible! ${100 - streak.current_streak} days to hit 100!`
            : "You're a legend! Keep the streak alive! 👑"}
        </div>
      </div>
    </motion.div>
  );
}

// Streak Milestone Progress Component
function StreakMilestoneProgress({ current }: { current: number }) {
  const milestones = [7, 30, 100, 365];
  const nextMilestone = milestones.find((m) => m > current) || 365;
  const previousMilestone = milestones.reverse().find((m) => m <= current) || 0;

  const progress =
    ((current - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-white/60">
        <span>{previousMilestone} days</span>
        <span className="font-semibold text-white">
          {current} / {nextMilestone}
        </span>
        <span>{nextMilestone} days</span>
      </div>
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <div className="mt-2 text-center text-xs text-white/50">
        {Math.round(progress)}% to {nextMilestone}-day milestone
      </div>
    </div>
  );
}
