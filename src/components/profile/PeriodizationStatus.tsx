/**
 * Periodization Status Component
 * Shows current training phase, week progress, and multipliers
 */

import { motion } from 'framer-motion';
import { Calendar, Activity } from 'lucide-react';
import type { PeriodizationState } from '../../types/periodization.types';

interface PeriodizationStatusProps {
  periodization?: PeriodizationState | null;
}

export function PeriodizationStatus({ periodization }: PeriodizationStatusProps) {
  if (!periodization) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Periodization Status
        </h3>
        <p className="text-gray-400 text-sm">
          Generate your first workout to start tracking your training phases!
        </p>
      </motion.div>
    );
  }

  // Phase-specific colors and emojis
  const phaseConfig = {
    base: { color: 'from-blue-600 to-cyan-600', emoji: '📚', name: 'Base Phase' },
    build: { color: 'from-purple-600 to-pink-600', emoji: '💪', name: 'Build Phase' },
    peak: { color: 'from-orange-600 to-red-600', emoji: '🔥', name: 'Peak Phase' },
    recovery: { color: 'from-green-600 to-emerald-600', emoji: '🧘', name: 'Recovery Phase' },
  };

  const currentPhase = phaseConfig[periodization.macroCyclePhase];
  const isDeload = periodization.isDeloadWeek;

  // Calculate week progress percentage
  const weekProgress = Math.min(((periodization.currentWeek) / 16) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentPhase.color} opacity-10`} />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Periodization Status
          </h3>
          {isDeload && (
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              🔄 Deload Week
            </span>
          )}
        </div>

        {/* Current Phase */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPhase.color} flex items-center justify-center text-2xl`}>
              {currentPhase.emoji}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {currentPhase.name}
              </div>
              <div className="text-sm text-gray-400">
                Week {periodization.currentWeek}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${currentPhase.color} rounded-full`}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(weekProgress)}% through program
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Volume */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Volume</div>
            <div className="text-2xl font-bold text-white">
              {Math.round(periodization.currentVolumeMultiplier * 100)}%
            </div>
            <div className={`text-xs font-semibold ${
              periodization.currentVolumeMultiplier > 1 ? 'text-green-400' :
              periodization.currentVolumeMultiplier < 1 ? 'text-orange-400' :
              'text-gray-400'
            }`}>
              {periodization.currentVolumeMultiplier > 1 ? '↗ High' :
               periodization.currentVolumeMultiplier < 1 ? '↘ Low' :
               '→ Normal'}
            </div>
          </div>

          {/* Intensity */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Intensity</div>
            <div className="text-2xl font-bold text-white">
              {Math.round(periodization.currentIntensityMultiplier * 100)}%
            </div>
            <div className={`text-xs font-semibold ${
              periodization.currentIntensityMultiplier > 1 ? 'text-green-400' :
              periodization.currentIntensityMultiplier < 1 ? 'text-orange-400' :
              'text-gray-400'
            }`}>
              {periodization.currentIntensityMultiplier > 1 ? '↗ High' :
               periodization.currentIntensityMultiplier < 1 ? '↘ Low' :
               '→ Normal'}
            </div>
          </div>
        </div>

        {/* Next Deload */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span className="text-sm text-gray-300">Next Deload</span>
          </div>
          <span className="text-sm font-semibold text-teal-300">
            Week {periodization.nextDeloadWeek}
          </span>
        </div>

        {/* Phase Description */}
        <div className="text-xs text-gray-400 leading-relaxed">
          {isDeload ? (
            "🔄 Recovery week - Reduced volume and intensity for adaptation and recovery."
          ) : periodization.macroCyclePhase === 'base' ? (
            "📚 Building foundation - High volume, moderate intensity. Focus on form and capacity."
          ) : periodization.macroCyclePhase === 'build' ? (
            "💪 Progressive overload - Increasing intensity while maintaining volume."
          ) : periodization.macroCyclePhase === 'peak' ? (
            "🔥 Maximum performance - Peak intensity, reduced volume. Test your limits!"
          ) : (
            "🧘 Active recovery - Light training for regeneration before next cycle."
          )}
        </div>
      </div>
    </motion.div>
  );
}
