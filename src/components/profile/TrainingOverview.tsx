/**
 * Training Overview Component
 * Shows key training stats in premium cards
 */

import { motion } from 'framer-motion';
import { Trophy, Clock, Flame, TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrainingOverviewProps {
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
  currentWeek?: number;
  totalWeeks?: number;
  phaseName?: string;
}

export function TrainingOverview({
  totalWorkouts,
  totalMinutes,
  currentStreak,
  currentWeek,
  totalWeeks,
  phaseName,
}: TrainingOverviewProps) {
  const [animatedWorkouts, setAnimatedWorkouts] = useState(0);
  const [animatedMinutes, setAnimatedMinutes] = useState(0);

  // Animate counters on mount
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const workoutStep = totalWorkouts / steps;
    const minuteStep = totalMinutes / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedWorkouts(Math.min(Math.floor(workoutStep * currentStep), totalWorkouts));
      setAnimatedMinutes(Math.min(Math.floor(minuteStep * currentStep), totalMinutes));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [totalWorkouts, totalMinutes]);

  const totalHours = Math.floor(animatedMinutes / 60);
  const remainingMinutes = animatedMinutes % 60;

  const stats = [
    {
      icon: Trophy,
      label: 'Workouts',
      value: animatedWorkouts,
      trend: '+5%',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      icon: Clock,
      label: 'Time',
      value: `${totalHours}h ${remainingMinutes}m`,
      trend: '+12%',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/20',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${currentStreak}🔥`,
      trend: currentStreak > 0 ? '→' : '0 days',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/20 to-red-500/20',
    },
    {
      icon: Calendar,
      label: currentWeek ? `Week ${currentWeek}/${totalWeeks}` : 'Program',
      value: phaseName || 'Not Started',
      trend: phaseName ? currentWeek + ` of ${totalWeeks}` : 'Start training',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Training Overview
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              {/* Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 p-6 hover:border-white/20 transition-all">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Value */}
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-sm text-gray-400 mb-2">
                    {stat.label}
                  </div>

                  {/* Trend */}
                  <div className={`text-xs font-semibold ${
                    stat.trend.startsWith('+') ? 'text-green-400' :
                    stat.trend === '→' ? 'text-yellow-400' :
                    'text-gray-500'
                  }`}>
                    {stat.trend}
                  </div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
