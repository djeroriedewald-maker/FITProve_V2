/**
 * Fitness Profile Summary Component
 * Shows equipment, preferences, and limitations
 */

import { motion } from 'framer-motion';
import { Dumbbell, Target, AlertCircle, Clock, Calendar } from 'lucide-react';

interface FitnessProfileSummaryProps {
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  age?: number;
  eventType?: string;
  limitations?: string[];
  availableEquipment?: string[];
  preferredDuration?: number;
  preferredWorkoutStyles?: string[];
  frequencyDays?: string[];
  preferredTime?: string;
  onCompleteOnboarding?: () => void;
}

export function FitnessProfileSummary({
  fitnessLevel,
  age,
  eventType,
  limitations = [],
  availableEquipment = [],
  preferredDuration,
  preferredWorkoutStyles = [],
  frequencyDays = [],
  preferredTime,
  onCompleteOnboarding,
}: FitnessProfileSummaryProps) {
  // Fitness level styling
  const levelConfig = {
    beginner: { color: 'from-green-500 to-emerald-500', emoji: '🌱', label: 'Beginner' },
    intermediate: { color: 'from-blue-500 to-cyan-500', emoji: '💪', label: 'Intermediate' },
    advanced: { color: 'from-purple-500 to-pink-500', emoji: '🔥', label: 'Advanced' },
  };

  const level = fitnessLevel ? levelConfig[fitnessLevel] : null;

  // Check if profile is incomplete
  const isIncomplete = !fitnessLevel || availableEquipment.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10"
    >
      {/* Background gradient */}
      {level && (
        <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-5`} />
      )}

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Fitness Profile
          </h3>
          {isIncomplete && (
            <span className="px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30">
              Incomplete
            </span>
          )}
        </div>

        {/* Incomplete state */}
        {isIncomplete ? (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-sm mb-3">
              Complete your fitness profile to get personalized workout recommendations!
            </p>
            <button
              onClick={onCompleteOnboarding}
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-purple-500 transition-all"
            >
              Complete Onboarding
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Level & Age */}
            <div className="grid grid-cols-2 gap-3">
              {/* Fitness Level */}
              {level && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-xs text-gray-400 mb-2">Fitness Level</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-xl`}>
                      {level.emoji}
                    </div>
                    <span className="text-white font-semibold">{level.label}</span>
                  </div>
                </div>
              )}

              {/* Age */}
              {age && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-xs text-gray-400 mb-2">Age</div>
                  <div className="text-2xl font-bold text-white">{age}</div>
                </div>
              )}
            </div>

            {/* Event Type */}
            {eventType && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-2">Training For</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="text-white font-semibold capitalize">{eventType}</span>
                </div>
              </div>
            )}

            {/* Equipment */}
            {availableEquipment.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Available Equipment</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableEquipment.map((equipment) => (
                    <span
                      key={equipment}
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30"
                    >
                      {equipment}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Workout Styles */}
            {preferredWorkoutStyles.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm">⚡</span>
                  <span className="text-xs text-gray-400">Preferred Styles</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {preferredWorkoutStyles.map((style) => (
                    <span
                      key={style}
                      className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Schedule Info */}
            {(preferredDuration || frequencyDays.length > 0 || preferredTime) && (
              <div className="grid grid-cols-1 gap-3">
                {/* Duration */}
                {preferredDuration && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">Preferred Duration</span>
                    </div>
                    <span className="text-sm font-semibold text-cyan-300">
                      {preferredDuration} min
                    </span>
                  </div>
                )}

                {/* Frequency */}
                {frequencyDays.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">Training Days</span>
                    </div>
                    <span className="text-sm font-semibold text-green-300">
                      {frequencyDays.length}x/week
                    </span>
                  </div>
                )}

                {/* Preferred Time */}
                {preferredTime && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🌅</span>
                      <span className="text-sm text-gray-300">Preferred Time</span>
                    </div>
                    <span className="text-sm font-semibold text-orange-300 capitalize">
                      {preferredTime}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Limitations */}
            {limitations.length > 0 && (
              <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-orange-400">Limitations & Injuries</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {limitations.map((limitation) => (
                    <span
                      key={limitation}
                      className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-semibold border border-orange-500/30 capitalize"
                    >
                      {limitation}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
