import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { WorkoutPlanItem } from '../hooks/useGenerateWorkout';
import { MuscleGroup } from '../types/exercise.types';
import { FireIcon, BoltIcon, ScaleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface WorkoutStatsPanelProps {
  plan: WorkoutPlanItem[];
  duration: number;
  goal: string;
}

interface MuscleVolumeData {
  muscle: MuscleGroup;
  volume: number; // Total sets targeting this muscle
  percentage: number;
  color: string;
}

export const WorkoutStatsPanel: React.FC<WorkoutStatsPanelProps> = ({
  plan,
  duration,
  goal,
}) => {
  // 📊 Calculate muscle volume distribution
  const muscleVolumeData = useMemo((): MuscleVolumeData[] => {
    const volumeMap = new Map<MuscleGroup, number>();

    plan.forEach((item) => {
      const sets = item.sets || 3;

      // Primary muscles get full credit
      (item.exercise.primary_muscles || []).forEach((muscle) => {
        volumeMap.set(muscle, (volumeMap.get(muscle) || 0) + sets);
      });

      // Secondary muscles get half credit
      (item.exercise.secondary_muscles || []).forEach((muscle) => {
        volumeMap.set(muscle, (volumeMap.get(muscle) || 0) + sets * 0.5);
      });
    });

    const totalVolume = Array.from(volumeMap.values()).reduce((sum, vol) => sum + vol, 0);

    const colors = [
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#3b82f6', // blue
      '#ef4444', // red
      '#06b6d4', // cyan
      '#f97316', // orange
      '#a855f7', // violet
      '#14b8a6', // teal
    ];

    return Array.from(volumeMap.entries())
      .map(([muscle, volume], idx) => ({
        muscle,
        volume,
        percentage: (volume / totalVolume) * 100,
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 8); // Top 8 muscles
  }, [plan]);

  // 💪 Calculate workout intensity score
  const intensityScore = useMemo(() => {
    let score = 0;

    plan.forEach((item) => {
      const sets = item.sets || 3;
      const rest = item.rest || 60;

      // More sets = higher intensity
      score += sets * 2;

      // Shorter rest = higher intensity
      if (rest < 60) score += 3;
      else if (rest < 90) score += 2;
      else score += 1;

      // Compound exercises boost intensity
      const muscleCount = (item.exercise.primary_muscles?.length || 0) +
        (item.exercise.secondary_muscles?.length || 0);
      if (muscleCount >= 3) score += 3;
    });

    // Normalize to 0-100 scale
    const maxPossibleScore = plan.length * 15;
    return Math.min(100, (score / maxPossibleScore) * 100);
  }, [plan]);

  // 🔥 Calculate estimated calories burned
  const estimatedCalories = useMemo(() => {
    // Base: 5 cal/min
    let calories = duration * 5;

    // Intensity multiplier
    const intensityMultiplier = 1 + (intensityScore / 200); // 1.0 - 1.5x
    calories *= intensityMultiplier;

    // Muscle group variety bonus (more muscles = more calories)
    const uniqueMuscles = new Set(
      plan.flatMap((item) => [
        ...(item.exercise.primary_muscles || []),
        ...(item.exercise.secondary_muscles || []),
      ])
    );
    const varietyBonus = 1 + (uniqueMuscles.size / 100); // Small bonus for variety
    calories *= varietyBonus;

    return Math.round(calories);
  }, [duration, intensityScore, plan]);

  // ⚖️ Calculate push/pull balance
  const pushPullBalance = useMemo(() => {
    let pushSets = 0;
    let pullSets = 0;

    const pushMuscles: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
    const pullMuscles: MuscleGroup[] = ['back', 'biceps', 'forearms'];

    plan.forEach((item) => {
      const sets = item.sets || 3;
      const isPush = (item.exercise.primary_muscles || []).some((m) => pushMuscles.includes(m));
      const isPull = (item.exercise.primary_muscles || []).some((m) => pullMuscles.includes(m));

      if (isPush) pushSets += sets;
      if (isPull) pullSets += sets;
    });

    const total = pushSets + pullSets;
    if (total === 0) return { pushPercentage: 50, pullPercentage: 50, isBalanced: true };

    const pushPercentage = (pushSets / total) * 100;
    const pullPercentage = (pullSets / total) * 100;

    // Balanced if within 60/40 to 40/60 range
    const isBalanced = pushPercentage >= 40 && pushPercentage <= 60;

    return { pushPercentage, pullPercentage, isBalanced };
  }, [plan]);

  // 🎯 Training load score
  const trainingLoad = useMemo(() => {
    const totalSets = plan.reduce((sum, item) => sum + (item.sets || 3), 0);

    // Score based on total volume
    if (totalSets < 10) return { score: 'Light', color: 'text-green-400', emoji: '🟢' };
    if (totalSets < 15) return { score: 'Moderate', color: 'text-yellow-400', emoji: '🟡' };
    if (totalSets < 20) return { score: 'Heavy', color: 'text-orange-400', emoji: '🟠' };
    return { score: 'Very Heavy', color: 'text-red-400', emoji: '🔴' };
  }, [plan]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <FireIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Workout Analytics</h3>
          <p className="text-sm text-gray-400">Performance insights and volume distribution</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl p-4 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <FireIcon className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-400">Calories</span>
          </div>
          <div className="text-3xl font-black text-white">{estimatedCalories}</div>
          <div className="text-xs text-purple-300 mt-1">Estimated burn</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 rounded-xl p-4 border border-pink-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <BoltIcon className="w-5 h-5 text-pink-400" />
            <span className="text-xs text-gray-400">Intensity</span>
          </div>
          <div className="text-3xl font-black text-white">{Math.round(intensityScore)}</div>
          <div className="text-xs text-pink-300 mt-1">Out of 100</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-900/40 to-amber-900/40 rounded-xl p-4 border border-orange-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <ScaleIcon className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-gray-400">Load</span>
          </div>
          <div className={`text-2xl font-black ${trainingLoad.color}`}>
            {trainingLoad.emoji} {trainingLoad.score}
          </div>
          <div className="text-xs text-orange-300 mt-1">Training volume</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-4 border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-gray-400">Duration</span>
          </div>
          <div className="text-3xl font-black text-white">{duration}</div>
          <div className="text-xs text-blue-300 mt-1">Minutes</div>
        </motion.div>
      </div>

      {/* Muscle Volume Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/40"
      >
        <h4 className="text-lg font-bold text-white mb-4">💪 Muscle Volume Distribution</h4>

        <div className="space-y-3">
          {muscleVolumeData.map((data, idx) => (
            <div key={data.muscle}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white capitalize">
                  {data.muscle.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-400">
                  {data.volume.toFixed(1)} sets ({data.percentage.toFixed(0)}%)
                </span>
              </div>

              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.percentage}%` }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: data.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Push/Pull Balance */}
      {pushPullBalance.pushPercentage + pushPullBalance.pullPercentage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/40"
        >
          <h4 className="text-lg font-bold text-white mb-4">⚖️ Push/Pull Balance</h4>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-orange-400">Push</span>
                <span className="text-sm text-gray-400">
                  {pushPullBalance.pushPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pushPullBalance.pushPercentage}%` }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-blue-400">Pull</span>
                <span className="text-sm text-gray-400">
                  {pushPullBalance.pullPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pushPullBalance.pullPercentage}%` }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {pushPullBalance.isBalanced ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <span className="text-lg">✓</span>
              <span>Well balanced! This ratio helps prevent muscle imbalances and injuries.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <span className="text-lg">⚠</span>
              <span>
                Consider adding more {pushPullBalance.pushPercentage > pushPullBalance.pullPercentage ? 'pull' : 'push'} exercises for balance.
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Workout Structure Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/20"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h5 className="font-bold text-white mb-1">Training Tip</h5>
            <p className="text-sm text-gray-300">
              {intensityScore > 70
                ? 'High intensity workout! Ensure adequate warm-up and cool-down. Consider reducing volume if recovery is poor.'
                : intensityScore > 40
                ? 'Moderate intensity workout. Perfect for building strength and muscle with good recovery.'
                : 'Lower intensity workout. Great for active recovery, technique work, or high-frequency training.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
