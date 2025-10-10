import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Activity,
  RefreshCw,
  Target,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import type { PeriodizationState } from '../types/periodization.types';
import { PeriodizationService } from '../lib/periodization.service';

interface PeriodizationBannerProps {
  periodization: PeriodizationState;
}

export function PeriodizationBanner({ periodization }: PeriodizationBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const phaseInfo = PeriodizationService.getPhaseDescription(periodization.macroCyclePhase);
  const trainingAdvice = PeriodizationService.getTrainingAdvice(periodization);

  // Phase colors
  const phaseColors = {
    base: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400', icon: '📚' },
    build: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400', icon: '💪' },
    peak: { bg: 'from-orange-600 to-red-600', text: 'text-orange-400', icon: '🔥' },
    recovery: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400', icon: '🧘' },
  };

  const currentPhaseColor = phaseColors[periodization.macroCyclePhase];

  // Deload week override
  const isDeload = periodization.isDeloadWeek;
  const displayColor = isDeload
    ? { bg: 'from-teal-600 to-blue-600', text: 'text-teal-400', icon: '🔄' }
    : currentPhaseColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Main Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${displayColor.bg} opacity-10`} />

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            {/* Left: Phase Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${displayColor.bg} rounded-xl blur opacity-50`} />
                  <div className={`relative p-2.5 rounded-xl bg-gradient-to-r ${displayColor.bg}`}>
                    <span className="text-2xl">{displayColor.icon}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xl font-bold ${displayColor.text}`}>
                      {isDeload ? '🔄 Deload Week' : phaseInfo.name}
                    </h3>
                    <span className="text-xs font-medium text-white/50 bg-white/10 px-2 py-1 rounded-full">
                      Week {periodization.currentWeek}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mt-1">
                    {isDeload ? 'Recovery & Adaptation Week' : phaseInfo.description}
                  </p>
                </div>
              </div>

              {/* Training Advice */}
              <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                <Info className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/80">{trainingAdvice}</p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="hidden lg:flex flex-col gap-3 ml-6">
              <div className="flex items-center gap-2 text-right">
                <div className="text-xs text-white/60">Volume</div>
                <div className={`text-sm font-bold ${displayColor.text}`}>
                  {Math.round(periodization.currentVolumeMultiplier * 100)}%
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <div className="text-xs text-white/60">Intensity</div>
                <div className={`text-sm font-bold ${displayColor.text}`}>
                  {Math.round(periodization.currentIntensityMultiplier * 100)}%
                </div>
              </div>
              {!isDeload && (
                <div className="flex items-center gap-2 text-right">
                  <div className="text-xs text-white/60">Next Deload</div>
                  <div className="text-sm font-bold text-white/80">
                    Week {periodization.nextDeloadWeek}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white/80 transition-colors"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </button>

          {/* Expanded Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              {isDeload ? (
                // Deload Recommendations
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Deload Week Guidelines
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {PeriodizationService.getDeloadRecommendations().map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-xs text-white/70 p-2 bg-white/5 rounded-lg"
                      >
                        <span className="flex-shrink-0">{rec.split(' ')[0]}</span>
                        <span>{rec.substring(rec.indexOf(' ') + 1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Phase Recommendations
                <div>
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Phase Focus Areas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {phaseInfo.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-xs text-white/70 p-2 bg-white/5 rounded-lg"
                      >
                        <span className={`${displayColor.text} flex-shrink-0`}>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Visualization */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Next 4 Weeks Preview
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {PeriodizationService.generateWaveProgression(
                    periodization.currentWeek,
                    4,
                    'muscle'
                  ).map((week) => (
                    <div
                      key={week.week}
                      className={`p-2 rounded-lg border ${
                        week.isDeload
                          ? 'bg-teal-500/10 border-teal-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold text-white/80 mb-1">W{week.week}</div>
                      <div className="text-[10px] text-white/60">{week.description}</div>
                      <div className="mt-1 flex gap-1">
                        <div className="text-[10px] text-white/50">
                          V:{Math.round(week.volumeMultiplier * 100)}%
                        </div>
                        <div className="text-[10px] text-white/50">
                          I:{Math.round(week.intensityMultiplier * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Gradient Line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${displayColor.bg}`} />
      </div>
    </motion.div>
  );
}
