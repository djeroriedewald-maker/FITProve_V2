/**
 * Achievements Preview Component
 * Shows top achievements and next unlock progress
 */

import { motion } from 'framer-motion';
import { Trophy, Lock, TrendingUp } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  progress?: {
    current: number;
    target: number;
  };
}

interface AchievementsPreviewProps {
  achievements?: Achievement[] | null;
  totalAchievements?: number;
}

export function AchievementsPreview({ achievements, totalAchievements = 0 }: AchievementsPreviewProps) {
  // Filter unlocked vs locked
  const unlocked = achievements?.filter(a => a.unlockedAt !== null) || [];
  const locked = achievements?.filter(a => a.unlockedAt === null) || [];

  // Get top 3 most recent unlocked
  const topAchievements = unlocked
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    })
    .slice(0, 3);

  // Get next to unlock (highest progress)
  const nextToUnlock = locked
    .filter(a => a.progress)
    .sort((a, b) => {
      if (!a.progress || !b.progress) return 0;
      const progressA = (a.progress.current / a.progress.target) * 100;
      const progressB = (b.progress.current / b.progress.target) * 100;
      return progressB - progressA;
    })[0];

  const unlockedCount = unlocked.length;
  const completionPercentage = totalAchievements > 0
    ? Math.round((unlockedCount / totalAchievements) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-orange-600/5" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Achievements
          </h3>
          <span className="text-xs text-gray-500">
            {unlockedCount}/{totalAchievements} unlocked
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{completionPercentage}% Complete</span>
            <span className="text-yellow-400 font-semibold">{unlockedCount} earned</span>
          </div>
        </div>

        {/* Top Achievements */}
        {topAchievements.length > 0 ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-400 mb-2">Recent Achievements</div>
            {topAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              >
                {/* Icon */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
                    {achievement.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <span className="text-xs">✓</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm group-hover:text-yellow-300 transition-colors">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {achievement.description}
                  </div>
                </div>

                {/* Unlock date */}
                {achievement.unlockedAt && (
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-400 text-sm">
              Complete workouts to unlock your first achievement!
            </p>
          </div>
        )}

        {/* Next to Unlock */}
        {nextToUnlock && (
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-400 font-semibold">Next to Unlock</span>
            </div>

            <div className="flex items-start gap-3">
              {/* Locked icon */}
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-2xl opacity-50">
                  {nextToUnlock.icon}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm mb-1">
                  {nextToUnlock.title}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  {nextToUnlock.description}
                </div>

                {/* Progress */}
                {nextToUnlock.progress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-blue-300 font-semibold">
                        {nextToUnlock.progress.current}/{nextToUnlock.progress.target}
                      </span>
                    </div>
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (nextToUnlock.progress.current / nextToUnlock.progress.target) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View All Button */}
        {totalAchievements > 3 && (
          <button className="w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all">
            View All {totalAchievements} Achievements
          </button>
        )}
      </div>
    </motion.div>
  );
}
