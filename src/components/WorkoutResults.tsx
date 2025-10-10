import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkoutPlanItem } from '../hooks/useGenerateWorkout';
import { WeeklyProgram, DailyWorkout } from '../lib/weekly-workout-generator';
import { Exercise } from '../types/exercise.types';
import { CheckCircleIcon, CalendarIcon, ClockIcon, FireIcon, ChartBarIcon, ChevronDownIcon, ChevronUpIcon, ArrowPathIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import { WorkoutStatsPanel } from './WorkoutStatsPanel';
import { WorkoutQualityService } from '../lib/workout-quality.service';
import { PeriodizationBanner } from './PeriodizationBanner';
import { WorkoutStyleBanner } from './WorkoutStyleBanner';
import type { WorkoutStyle } from '../types/workout-style.types';

interface WorkoutResultsProps {
  weeklyProgram: WeeklyProgram;
  currentDayPlan: WorkoutPlanItem[];
  currentDay: DailyWorkout;
  onSchedule: () => void;
  onSave: () => void;
  onModify: () => void;
  onSwapExercise?: (exerciseId: string, newExercise: Exercise) => void;
  exerciseAlternatives?: (exerciseId: string) => Exercise[];
  isSaving?: boolean;
  canSchedule?: boolean;
  user?: any;
  periodization?: any; // PeriodizationState from useGenerateWorkout
  workoutStyle?: WorkoutStyle; // 🎨 Workout style (EMOM, AMRAP, etc.)
}

export const WorkoutResults: React.FC<WorkoutResultsProps> = ({
  weeklyProgram,
  currentDayPlan,
  currentDay,
  onSchedule,
  onSave,
  onModify,
  onSwapExercise,
  exerciseAlternatives,
  isSaving = false,
  canSchedule = true,
  user,
  periodization,
  workoutStyle,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Set<string>>(new Set());
  const [showAlternativesFor, setShowAlternativesFor] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  // 🎯 Order exercises for optimal performance
  const orderedPlan = useMemo(() => {
    return WorkoutQualityService.orderExercises(currentDayPlan);
  }, [currentDayPlan]);

  // 🔗 Generate superset suggestions
  const supersetPairs = useMemo(() => {
    return WorkoutQualityService.suggestSupersets(currentDayPlan);
  }, [currentDayPlan]);

  const toggleExerciseExpand = (id: string) => {
    setExpandedExerciseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate stats
  const totalExercises = currentDayPlan.length;
  const warmupCount = currentDayPlan.filter(item => item.section === 'warmup').length;
  const mainCount = currentDayPlan.filter(item => item.section === 'main').length;
  const cooldownCount = currentDayPlan.filter(item => item.section === 'cooldown').length;
  const estimatedCalories = Math.round(currentDay.estimatedDuration * 5); // ~5 cal/min

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-20">
      {/* 🎉 HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-pink-900/40 border-b border-purple-500/20"
      >
        <div className="absolute inset-0 bg-[url('/images/creator-flow/hero-welcome.webp')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          {/* Success Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div className="bg-green-500/20 border border-green-400/40 rounded-full px-6 py-2 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              <span className="text-green-300 font-semibold">Workout Generated Successfully!</span>
            </div>
          </motion.div>

          {/* Program Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
          >
            {weeklyProgram.programName}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            {weeklyProgram.description}
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Weekly Workouts</span>
              </div>
              <div className="text-3xl font-black text-white">{weeklyProgram.totalWorkouts}</div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="w-5 h-5 text-pink-400" />
                <span className="text-sm text-gray-400">Weekly Volume</span>
              </div>
              <div className="text-3xl font-black text-white">{weeklyProgram.weeklyVolume}<span className="text-lg text-gray-400">min</span></div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Est. Calories</span>
              </div>
              <div className="text-3xl font-black text-white">~{estimatedCalories}</div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Exercises</span>
              </div>
              <div className="text-3xl font-black text-white">{totalExercises}</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <button
              onClick={onSchedule}
              disabled={!canSchedule || !user}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg
              hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105 transition-all duration-300
              shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              flex items-center gap-2"
            >
              <CalendarIcon className="w-6 h-6" />
              Schedule Full Program
            </button>

            <button
              onClick={onSave}
              disabled={isSaving || !user}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-4 rounded-xl font-bold text-lg
              hover:from-pink-500 hover:to-rose-500 transform hover:scale-105 transition-all duration-300
              shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? '💾 Saving...' : '💾 Save Workout'}
            </button>

            <button
              onClick={onModify}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-8 py-4 rounded-xl font-bold text-lg
              hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300
              shadow-lg border border-gray-600"
            >
              ✏️ Modify & Regenerate
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg
              hover:from-green-500 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300
              shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center gap-2"
            >
              <ChartBarIcon className="w-6 h-6" />
              {showStats ? 'Hide' : 'View'} Analytics
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* 📅 PERIODIZATION BANNER */}
      {periodization && (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <PeriodizationBanner periodization={periodization} />
        </div>
      )}

      {/* 🎨 WORKOUT STYLE BANNER */}
      {workoutStyle && workoutStyle !== 'traditional' && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <WorkoutStyleBanner workoutStyle={workoutStyle} />
        </div>
      )}

      {/* 📊 STATS PANEL (Collapsible) */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-6xl mx-auto px-4 pb-8"
          >
            <WorkoutStatsPanel
              plan={orderedPlan}
              duration={currentDay.estimatedDuration}
              goal={weeklyProgram.programName}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📅 WEEKLY OVERVIEW (if multi-day program) */}
      {weeklyProgram.totalWorkouts > 1 && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-3xl font-black text-white mb-6">📅 Weekly Schedule</h2>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weeklyProgram.workouts.map((workout, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-4 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-600/40 to-pink-600/40 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30'
                      : 'bg-gray-800/40 hover:bg-gray-800/60 ring-1 ring-gray-700'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-400 mb-1">{workout.dayName}</div>
                  <div className="text-lg font-black text-white mb-2">{workout.focus}</div>
                  <div className="text-xs text-gray-400">{workout.estimatedDuration} min</div>

                  {isSelected && (
                    <motion.div
                      layoutId="selected-day"
                      className="absolute inset-0 border-2 border-purple-400 rounded-xl"
                    />
                  )}
                </motion.button>
              );
            })}

            {/* Rest Days */}
            {Array.from({ length: weeklyProgram.restDays }).map((_, idx) => (
              <div
                key={`rest-${idx}`}
                className="p-4 rounded-xl bg-gray-900/40 ring-1 ring-gray-800 opacity-60"
              >
                <div className="text-sm font-semibold text-gray-500 mb-1">Rest Day</div>
                <div className="text-lg font-black text-gray-600">💤</div>
                <div className="text-xs text-gray-600">Recovery</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💪 TODAY'S WORKOUT PLAN */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-white">{currentDay.focus} Workout</h2>
            <p className="text-gray-400">{currentDay.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Target Muscles</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {currentDay.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="text-amber-300 font-semibold text-sm mb-1">Warm-Up</div>
            <div className="text-2xl font-black text-white">{warmupCount}</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-300 font-semibold text-sm mb-1">Main Exercises</div>
            <div className="text-2xl font-black text-white">{mainCount}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="text-blue-300 font-semibold text-sm mb-1">Cool-Down</div>
            <div className="text-2xl font-black text-white">{cooldownCount}</div>
          </div>
        </div>

        {/* Exercise List - Using Ordered Plan */}
        <div className="space-y-4">
          {orderedPlan.map((item, idx) => {
            const exerciseId = item.exercise.id ?? `${item.exercise.name}-${idx}`;
            const isExpanded = expandedExerciseIds.has(exerciseId);

            // 📚 Generate exercise education notes
            const exerciseNotes = WorkoutQualityService.generateExerciseNotes(item.exercise);

            const sectionStyles: Record<string, string> = {
              warmup: 'from-amber-500/20 to-orange-500/20 border-amber-400/40',
              main: 'from-purple-500/20 to-indigo-500/20 border-purple-400/40',
              cooldown: 'from-blue-500/20 to-cyan-500/20 border-blue-400/40',
            };

            const sectionLabels: Record<string, string> = {
              warmup: '🔥 Warm-Up',
              main: '💪 Main',
              cooldown: '❄️ Cool-Down',
            };

            return (
              <motion.div
                key={exerciseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-gradient-to-br ${item.section ? sectionStyles[item.section] : 'from-gray-800/90 to-gray-900/90 border-gray-700'}
                rounded-2xl border overflow-hidden`}
              >
                {/* Exercise Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Exercise Image */}
                    <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black border-2 border-white/10 shadow-lg">
                      {item.exercise.image_url ? (
                        <img
                          src={item.exercise.image_url}
                          alt={item.exercise.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <h3 className="text-lg sm:text-2xl font-black text-white truncate">{item.exercise.name}</h3>
                          {item.exercise.difficulty && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                item.exercise.difficulty === 'beginner'
                                  ? 'bg-green-700 text-green-200'
                                  : item.exercise.difficulty === 'intermediate'
                                  ? 'bg-yellow-700 text-yellow-200'
                                  : 'bg-red-700 text-red-200'
                              }`}
                            >
                              {item.exercise.difficulty}
                            </span>
                          )}
                        </div>

                        {item.section && (
                          <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-white/10 text-white">
                            {sectionLabels[item.section]}
                          </span>
                        )}
                      </div>

                      {/* Prescription */}
                      <div className="flex flex-wrap gap-6 text-base mb-3">
                        {typeof item.sets === 'number' && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Sets:</span>
                            <span className="text-2xl font-black text-white">{item.sets}</span>
                          </div>
                        )}
                        {item.reps && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Reps:</span>
                            <span className="text-2xl font-black text-white">{item.reps}</span>
                          </div>
                        )}
                        {item.distance && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Distance:</span>
                            <span className="text-2xl font-black text-white">{item.distance}</span>
                          </div>
                        )}
                        {item.time && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Time:</span>
                            <span className="text-2xl font-black text-white">{item.time}</span>
                          </div>
                        )}
                        {typeof item.rest === 'number' && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Rest:</span>
                            <span className="text-2xl font-black text-white">{item.rest}s</span>
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      {item.reason && (
                        <div className="text-sm text-purple-300 bg-purple-900/20 rounded-lg px-3 py-2 mb-3">
                          💡 {item.reason}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('[UI] Show Details clicked');
                            toggleExerciseExpand(exerciseId);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>Hide Details</span>
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span>Show Details</span>
                            </>
                          )}
                        </button>

                        {/* Swap Exercise Button */}
                        {onSwapExercise && exerciseAlternatives && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('[UI] Swap Exercise button clicked');
                              const alternatives = exerciseAlternatives(exerciseId);
                              console.log('[UI] Found alternatives:', alternatives.length);
                              if (alternatives.length > 0) {
                                setShowAlternativesFor(exerciseId);
                              }
                            }}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-pink-600
                            text-white text-xs sm:text-sm font-semibold hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Swap</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alternatives Modal */}
                <AnimatePresence>
                  {showAlternativesFor === exerciseId && exerciseAlternatives && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="border-t border-white/10 px-6 py-4 bg-black/30 relative z-10"
                    >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-white">Choose Alternative:</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAlternativesFor(null);
                        }}
                        className="text-gray-400 hover:text-white text-sm font-semibold hover:bg-white/10 px-3 py-1 rounded"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exerciseAlternatives(exerciseId).map((altExercise) => (
                        <button
                          key={altExercise.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('[UI] Swap button clicked for:', altExercise.name);
                            onSwapExercise?.(exerciseId, altExercise);
                            setShowAlternativesFor(null);
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/60 hover:bg-gray-700/60
                          border border-gray-700 hover:border-purple-500 transition-all text-left cursor-pointer"
                        >
                          {altExercise.image_url && (
                            <img
                              src={altExercise.image_url}
                              alt={altExercise.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-white text-sm">{altExercise.name}</div>
                            <div className="text-xs text-gray-400">
                              {altExercise.primary_muscles?.join(', ')}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 px-6 py-4 bg-black/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {item.exercise.primary_muscles && item.exercise.primary_muscles.length > 0 && (
                          <div>
                            <div className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-2">
                              Primary Muscles
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.exercise.primary_muscles.map((muscle) => (
                                <span
                                  key={muscle}
                                  className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded text-xs font-medium"
                                >
                                  {muscle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.exercise.secondary_muscles && item.exercise.secondary_muscles.length > 0 && (
                          <div>
                            <div className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-2">
                              Secondary Muscles
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.exercise.secondary_muscles.map((muscle) => (
                                <span
                                  key={muscle}
                                  className="px-2 py-1 bg-gray-600/30 text-gray-300 rounded text-xs font-medium"
                                >
                                  {muscle}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.exercise.equipment && item.exercise.equipment.length > 0 && (
                          <div>
                            <div className="text-gray-500 uppercase tracking-wide text-xs font-semibold mb-2">
                              Equipment Needed
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.exercise.equipment.map((equip) => (
                                <span
                                  key={equip}
                                  className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs font-medium"
                                >
                                  {equip.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 📚 Exercise Education Section */}
                      {(exerciseNotes.formCues.length > 0 || exerciseNotes.commonMistakes.length > 0 || exerciseNotes.modifications.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                          {/* Form Cues */}
                          {exerciseNotes.formCues.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <AcademicCapIcon className="w-5 h-5 text-green-400" />
                                <div className="text-sm font-bold text-green-400 uppercase tracking-wide">Form Cues</div>
                              </div>
                              <ul className="space-y-1">
                                {exerciseNotes.formCues.map((cue, cueIdx) => (
                                  <li key={cueIdx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-green-400 mt-0.5">✓</span>
                                    <span>{cue}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Common Mistakes */}
                          {exerciseNotes.commonMistakes.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-red-400 font-bold">⚠️</span>
                                <div className="text-sm font-bold text-red-400 uppercase tracking-wide">Avoid</div>
                              </div>
                              <ul className="space-y-1">
                                {exerciseNotes.commonMistakes.map((mistake, mistakeIdx) => (
                                  <li key={mistakeIdx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-red-400 mt-0.5">✗</span>
                                    <span>{mistake}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Modifications */}
                          {exerciseNotes.modifications.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-400 font-bold">🔧</span>
                                <div className="text-sm font-bold text-blue-400 uppercase tracking-wide">Modifications</div>
                              </div>
                              <ul className="space-y-1">
                                {exerciseNotes.modifications.map((mod, modIdx) => (
                                  <li key={modIdx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-blue-400 mt-0.5">→</span>
                                    <span>{mod}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
