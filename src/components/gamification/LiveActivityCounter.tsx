import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Users, Dumbbell, Flame, TrendingUp, Zap } from 'lucide-react';
import { GamificationService } from '../../services/gamification.service';
import type { CommunityRealTimeStats } from '../../types/gamification.types';

interface LiveActivityCounterProps {
  variant?: 'compact' | 'full' | 'ticker';
  showAllStats?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function LiveActivityCounter({
  variant = 'compact',
  showAllStats = false,
  refreshInterval = 10000, // 10 seconds default
}: LiveActivityCounterProps) {
  const [stats, setStats] = useState<CommunityRealTimeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    fetchStats();

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchStats = async () => {
    try {
      const data = await GamificationService.getRealTimeStats();
      setStats(data);

      // Trigger pulse animation
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-white/10 rounded-xl" />
      </div>
    );
  }

  // Compact variant - just shows active users
  if (variant === 'compact') {
    return (
      <motion.div
        className="relative bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl px-4 py-3 border border-red-500/30"
        animate={pulse ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          {/* Pulsing dot */}
          <div className="relative">
            <motion.div
              className="w-3 h-3 bg-red-500 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(239, 68, 68, 0.7)',
                  '0 0 0 8px rgba(239, 68, 68, 0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
          </div>

          {/* Count */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-400" />
            <AnimatePresence mode="wait">
              <motion.span
                key={stats.users_working_out_now}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="text-xl font-bold text-white"
              >
                {stats.users_working_out_now}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-white/70">working out now</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Ticker variant - scrolling stats
  if (variant === 'ticker') {
    const tickerStats = [
      {
        icon: <Activity className="w-4 h-4" />,
        value: stats.users_working_out_now,
        label: 'active',
        color: 'text-red-400',
      },
      {
        icon: <Dumbbell className="w-4 h-4" />,
        value: stats.workouts_completed_today,
        label: 'workouts today',
        color: 'text-cyan-400',
      },
      {
        icon: <Flame className="w-4 h-4" />,
        value: `${(stats.total_calories_burned_today / 1000).toFixed(1)}k`,
        label: 'calories burned',
        color: 'text-orange-400',
      },
      {
        icon: <TrendingUp className="w-4 h-4" />,
        value: stats.active_challenges,
        label: 'active challenges',
        color: 'text-purple-400',
      },
    ];

    return (
      <div className="relative bg-white/5 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10 overflow-hidden">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {/* Live indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.div
              className="w-2 h-2 bg-red-500 rounded-full"
              animate={{
                opacity: [1, 0.3, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-semibold text-red-400 uppercase">Live</span>
          </div>

          {/* Stats */}
          {tickerStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2 flex-shrink-0">
              <div className={stat.color}>{stat.icon}</div>
              <span className="text-lg font-bold text-white">{stat.value}</span>
              <span className="text-xs text-white/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant - all stats with cards
  return (
    <motion.div
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"
              animate={pulse ? { scale: [1, 1.1, 1] } : {}}
            >
              <Activity className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Live Activity</h3>
            <p className="text-sm text-white/60">Real-time community stats</p>
          </div>
        </div>

        <motion.div
          className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30"
          animate={{
            opacity: [1, 0.7, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-xs font-semibold text-red-400 uppercase">Live</span>
        </motion.div>
      </div>

      {/* Main Stat - Users Working Out */}
      <motion.div
        className="mb-6 p-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30"
        animate={pulse ? { scale: [1, 1.02, 1] } : {}}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-red-400" />
              <span className="text-sm font-semibold text-white/70 uppercase">Right Now</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stats.users_working_out_now}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
              >
                {stats.users_working_out_now}
              </motion.div>
            </AnimatePresence>
            <p className="text-sm text-white/60 mt-1">people crushing it</p>
          </div>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-16 h-16 text-orange-400 opacity-20" />
          </motion.div>
        </div>
      </motion.div>

      {/* Additional Stats Grid */}
      {showAllStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Dumbbell className="w-5 h-5 text-cyan-400" />}
            value={stats.workouts_completed_today}
            label="Workouts Today"
            color="from-cyan-500/20 to-blue-500/20"
            borderColor="border-cyan-500/30"
            pulse={pulse}
          />

          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-400" />}
            value={`${(stats.total_calories_burned_today / 1000).toFixed(1)}k`}
            label="Calories Burned"
            color="from-orange-500/20 to-red-500/20"
            borderColor="border-orange-500/30"
            pulse={pulse}
          />

          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            value={`${(stats.total_weight_lifted_today / 1000).toFixed(1)}k`}
            label="Weight Lifted (lbs)"
            color="from-purple-500/20 to-pink-500/20"
            borderColor="border-purple-500/30"
            pulse={pulse}
          />

          <StatCard
            icon={<Activity className="w-5 h-5 text-green-400" />}
            value={stats.active_challenges}
            label="Active Challenges"
            color="from-green-500/20 to-emerald-500/20"
            borderColor="border-green-500/30"
            pulse={pulse}
          />

          <StatCard
            icon={<Users className="w-5 h-5 text-indigo-400" />}
            value={`${(stats.total_users / 1000).toFixed(1)}k`}
            label="Total Members"
            color="from-indigo-500/20 to-blue-500/20"
            borderColor="border-indigo-500/30"
            pulse={pulse}
          />

          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-4 border border-white/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs text-white/60">Community</div>
              <div className="text-xs text-white/60">on Fire!</div>
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-center text-xs text-white/40">
        Updates every {refreshInterval / 1000} seconds
      </div>
    </motion.div>
  );
}

// Helper Component
interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  color: string;
  borderColor: string;
  pulse: boolean;
}

function StatCard({ icon, value, label, color, borderColor, pulse }: StatCardProps) {
  return (
    <motion.div
      className={`bg-gradient-to-br ${color} rounded-xl p-4 border ${borderColor}`}
      animate={pulse ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={String(value)}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="text-2xl font-bold text-white mb-1"
        >
          {value}
        </motion.div>
      </AnimatePresence>
      <p className="text-xs text-white/60">{label}</p>
    </motion.div>
  );
}
