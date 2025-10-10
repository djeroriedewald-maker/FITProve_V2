/**
 * WorkoutStyleBanner Component
 * Displays workout style information with style-specific theming and instructions
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutStyleService } from '../lib/workout-style.service';
import type { WorkoutStyle } from '../types/workout-style.types';

interface WorkoutStyleBannerProps {
  workoutStyle: WorkoutStyle;
}

export function WorkoutStyleBanner({ workoutStyle }: WorkoutStyleBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const styleInfo = WorkoutStyleService.getStyleSummary(workoutStyle);
  const instructions = WorkoutStyleService.getDetailedInstructions(workoutStyle);

  // Style-specific color themes
  const styleThemes: Record<WorkoutStyle, { bg: string; text: string; border: string }> = {
    traditional: { bg: 'from-gray-600 to-slate-600', text: 'text-gray-400', border: 'border-gray-500' },
    emom: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400', border: 'border-blue-500' },
    amrap: { bg: 'from-red-600 to-orange-600', text: 'text-red-400', border: 'border-red-500' },
    tabata: { bg: 'from-yellow-600 to-orange-600', text: 'text-yellow-400', border: 'border-yellow-500' },
    circuit: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400', border: 'border-green-500' },
    superset: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400', border: 'border-purple-500' },
    'drop-set': { bg: 'from-indigo-600 to-purple-600', text: 'text-indigo-400', border: 'border-indigo-500' },
    pyramid: { bg: 'from-pink-600 to-rose-600', text: 'text-pink-400', border: 'border-pink-500' },
    cluster: { bg: 'from-orange-600 to-red-600', text: 'text-orange-400', border: 'border-orange-500' },
    ladder: { bg: 'from-teal-600 to-cyan-600', text: 'text-teal-400', border: 'border-teal-500' },
    complex: { bg: 'from-violet-600 to-purple-600', text: 'text-violet-400', border: 'border-violet-500' },
    'for-time': { bg: 'from-rose-600 to-red-600', text: 'text-rose-400', border: 'border-rose-500' },
  };

  const theme = styleThemes[workoutStyle];

  // Difficulty badge color
  const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-300 border-green-500/30',
    intermediate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      {/* Gradient Orb Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${theme.bg} opacity-20 blur-3xl rounded-full`} />
        <div className={`absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr ${theme.bg} opacity-20 blur-3xl rounded-full`} />
      </div>

      <div className="relative">
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Style Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{styleInfo.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {styleInfo.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {styleInfo.description}
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[styleInfo.difficulty]}`}>
                  {styleInfo.difficulty.charAt(0).toUpperCase() + styleInfo.difficulty.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${theme.border} ${theme.text} bg-black/30`}>
                  Intensity: {styleInfo.intensityLevel}/5
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${theme.border} ${theme.text} bg-black/30`}>
                  Efficiency: {styleInfo.timeEfficiency}/5
                </span>
              </div>
            </div>

            {/* Right: Expand Button (Desktop) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
            >
              <span className="text-sm text-gray-300 group-hover:text-white">
                {isExpanded ? 'Hide' : 'Show'} Details
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Mobile Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <span className="text-sm text-gray-300">
              {isExpanded ? 'Hide' : 'Show'} Instructions
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Expandable Instructions */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-white/10">
                <h4 className={`text-lg font-semibold mb-3 ${theme.text}`}>
                  📋 How to Execute
                </h4>
                <ul className="space-y-2">
                  {instructions.map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full ${theme.bg} bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white mt-0.5`}>
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed">{instruction}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Style Tips */}
                {workoutStyle !== 'traditional' && (
                  <div className={`mt-6 p-4 rounded-xl bg-gradient-to-br ${theme.bg} bg-opacity-10 border ${theme.border} border-opacity-30`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h5 className={`font-semibold mb-1 ${theme.text}`}>Pro Tip</h5>
                        <p className="text-sm text-gray-300">
                          {getProTip(workoutStyle)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Helper function for pro tips
function getProTip(style: WorkoutStyle): string {
  const tips: Record<WorkoutStyle, string> = {
    traditional: 'Focus on progressive overload - gradually increase weight, reps, or sets over time.',
    emom: 'If you finish early, use the extra time to recover completely. If you can\'t finish in 40s, reduce reps.',
    amrap: 'Pace yourself! Start at 70-80% intensity to maintain consistency. Sprint finish in the last 2 minutes.',
    tabata: 'This is HIGH intensity. Give 100% during work intervals. Your reps may drop - that\'s normal and expected.',
    circuit: 'Set up all equipment before starting. Minimize transitions. This is about continuous movement.',
    superset: 'Choose exercises that don\'t interfere with each other (e.g., push/pull or upper/lower).',
    'drop-set': 'Have lighter weights ready before starting. Drop weight immediately - no rest between drops.',
    pyramid: 'Increase weight as reps decrease (descending) or decrease weight as reps increase (ascending).',
    cluster: 'Perfect for strength training. The intra-set rest allows you to lift heavier than traditional sets.',
    ladder: 'Great for bodyweight exercises. Can be done with a partner - alternate sets for built-in rest.',
    complex: 'Start with lighter weight than normal - you can\'t rest until all exercises are complete.',
    'for-time': 'Record your time and try to beat it next time. Break up reps strategically to avoid burnout.',
  };

  return tips[style];
}
