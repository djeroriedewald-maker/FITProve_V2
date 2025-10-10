/**
 * Workout Styles Breakdown Component
 * Shows distribution of workout styles with animated bars
 */

import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import type { WorkoutStyle } from '../../types/workout-style.types';

interface WorkoutStyleData {
  style: WorkoutStyle;
  name: string;
  emoji: string;
  count: number;
  percentage: number;
  color: string;
}

interface WorkoutStylesBreakdownProps {
  styles?: WorkoutStyleData[] | null;
  totalWorkouts?: number;
}

export function WorkoutStylesBreakdown({ styles, totalWorkouts = 0 }: WorkoutStylesBreakdownProps) {
  // Default empty state
  if (!styles || styles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Workout Styles
        </h3>
        <p className="text-gray-400 text-sm">
          Complete workouts to see your style distribution!
        </p>
      </motion.div>
    );
  }

  // Sort by count descending
  const sortedStyles = [...styles].sort((a, b) => b.count - a.count);
  const topStyle = sortedStyles[0];
  const maxCount = topStyle.count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10"
    >
      {/* Background gradient based on top style */}
      <div className={`absolute inset-0 bg-gradient-to-br ${topStyle.color} opacity-5`} />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Workout Styles
          </h3>
          <span className="text-xs text-gray-500">
            {totalWorkouts} total workouts
          </span>
        </div>

        {/* Top Style Highlight */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${topStyle.color} flex items-center justify-center text-xl`}>
                {topStyle.emoji}
              </div>
              <div>
                <div className="text-white font-semibold">{topStyle.name}</div>
                <div className="text-xs text-gray-400">Most Used</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {topStyle.percentage}%
              </div>
              <div className="text-xs text-gray-400">
                {topStyle.count} workouts
              </div>
            </div>
          </div>
          <TrendingUp className="w-4 h-4 text-green-400 inline mr-1" />
          <span className="text-xs text-green-400 font-semibold">
            Your favorite style
          </span>
        </div>

        {/* Style Distribution Bars */}
        <div className="space-y-3">
          <div className="text-xs text-gray-400 mb-2">Style Distribution</div>
          {sortedStyles.map((style, index) => (
            <motion.div
              key={style.style}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              {/* Style label */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{style.emoji}</span>
                  <span className="text-gray-300">{style.name}</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {style.count} ({style.percentage}%)
                </span>
              </div>

              {/* Animated progress bar */}
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(style.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                  className={`h-full bg-gradient-to-r ${style.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Style Diversity Indicator */}
        {sortedStyles.length > 1 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <span className="text-sm">🎯</span>
              </div>
              <span className="text-sm text-gray-300">Style Variety</span>
            </div>
            <span className="text-sm font-semibold text-cyan-300">
              {sortedStyles.length} styles used
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
