/**
 * Progression Timeline Component
 * Shows 8-week progression graph with volume and intensity trends
 */

import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';

interface WeekData {
  week: number;
  volume: number; // 0-100 scale
  intensity: number; // 0-100 scale
  workoutsCompleted: number;
  isDeload?: boolean;
}

interface ProgressionTimelineProps {
  weeks?: WeekData[] | null;
  currentWeek?: number;
}

export function ProgressionTimeline({ weeks, currentWeek = 1 }: ProgressionTimelineProps) {
  // Default empty state
  if (!weeks || weeks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Progression Timeline
        </h3>
        <p className="text-gray-400 text-sm">
          Complete 8+ weeks of training to see your progression graph!
        </p>
      </motion.div>
    );
  }

  // Calculate max values for scaling
  const maxVolume = Math.max(...weeks.map(w => w.volume));
  const maxIntensity = Math.max(...weeks.map(w => w.intensity));
  const maxValue = Math.max(maxVolume, maxIntensity, 100);

  // Calculate average trends
  const avgVolume = Math.round(weeks.reduce((sum, w) => sum + w.volume, 0) / weeks.length);
  const avgIntensity = Math.round(weeks.reduce((sum, w) => sum + w.intensity, 0) / weeks.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Progression Timeline
          </h3>
          <span className="text-xs text-gray-500">
            Last {weeks.length} weeks
          </span>
        </div>

        {/* Legend & Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Volume legend */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
              <span className="text-xs text-gray-400">Volume</span>
              <span className="text-xs font-semibold text-blue-300">{avgVolume}%</span>
            </div>
            {/* Intensity legend */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-pink-500" />
              <span className="text-xs text-gray-400">Intensity</span>
              <span className="text-xs font-semibold text-orange-300">{avgIntensity}%</span>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="relative h-48 bg-white/5 rounded-xl p-4 border border-white/10">
          {/* Y-axis labels */}
          <div className="absolute left-1 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-500">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          {/* Graph area */}
          <div className="ml-8 h-full flex items-end justify-between gap-1">
            {weeks.map((week, index) => {
              const volumeHeight = (week.volume / maxValue) * 100;
              const intensityHeight = (week.intensity / maxValue) * 100;
              const isCurrent = week.week === currentWeek;

              return (
                <div
                  key={week.week}
                  className="flex-1 flex flex-col items-center justify-end gap-1 relative group"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10 pointer-events-none">
                    <div className="font-semibold text-white mb-1">Week {week.week}</div>
                    <div className="text-blue-300">Volume: {week.volume}%</div>
                    <div className="text-orange-300">Intensity: {week.intensity}%</div>
                    <div className="text-gray-400">{week.workoutsCompleted} workouts</div>
                    {week.isDeload && (
                      <div className="text-teal-300 mt-1">🔄 Deload Week</div>
                    )}
                  </div>

                  {/* Bars container */}
                  <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                    {/* Volume bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${volumeHeight}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
                      className={`flex-1 rounded-t ${
                        week.isDeload
                          ? 'bg-gradient-to-t from-teal-600 to-cyan-600'
                          : 'bg-gradient-to-t from-blue-600 to-cyan-500'
                      } ${isCurrent ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900/90' : ''}`}
                    />

                    {/* Intensity bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${intensityHeight}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 + 0.1, ease: 'easeOut' }}
                      className={`flex-1 rounded-t ${
                        week.isDeload
                          ? 'bg-gradient-to-t from-teal-600 to-emerald-600'
                          : 'bg-gradient-to-t from-orange-600 to-pink-500'
                      } ${isCurrent ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-gray-900/90' : ''}`}
                    />
                  </div>

                  {/* Week label */}
                  <div className={`text-xs mt-1 ${isCurrent ? 'text-white font-bold' : 'text-gray-500'}`}>
                    W{week.week}
                  </div>
                  {isCurrent && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-blue-400 font-semibold whitespace-nowrap">
                      Current
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total workouts */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total Workouts</span>
            </div>
            <div className="text-xl font-bold text-white">
              {weeks.reduce((sum, w) => sum + w.workoutsCompleted, 0)}
            </div>
          </div>

          {/* Deload weeks */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🔄</span>
              <span className="text-xs text-gray-400">Deload Weeks</span>
            </div>
            <div className="text-xl font-bold text-white">
              {weeks.filter(w => w.isDeload).length}
            </div>
          </div>
        </div>

        {/* Trend message */}
        <div className="text-xs text-gray-400 leading-relaxed">
          {avgVolume > avgIntensity ? (
            <span>📊 <span className="text-blue-300">Volume-focused</span> training - Building capacity and work tolerance.</span>
          ) : avgIntensity > avgVolume ? (
            <span>🔥 <span className="text-orange-300">Intensity-focused</span> training - Pushing performance limits.</span>
          ) : (
            <span>⚖️ <span className="text-purple-300">Balanced</span> training - Equal emphasis on volume and intensity.</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
