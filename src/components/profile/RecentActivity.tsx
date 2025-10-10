/**
 * Recent Activity Component
 * Shows timeline of recent workouts and milestones
 */

import { motion } from 'framer-motion';
import { Activity, Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'workout' | 'achievement' | 'milestone' | 'streak';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: {
    duration?: number;
    caloriesBurned?: number;
    workoutStyle?: string;
    icon?: string;
  };
}

interface RecentActivityProps {
  activities?: ActivityItem[] | null;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Default empty state
  if (!activities || activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 p-6"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Recent Activity
        </h3>
        <p className="text-gray-400 text-sm">
          Your recent workouts and achievements will appear here!
        </p>
      </motion.div>
    );
  }

  // Sort by most recent first
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Limit to last 10 activities
  const recentActivities = sortedActivities.slice(0, 10);

  // Activity type configurations
  const activityConfig = {
    workout: {
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
    },
    achievement: {
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-300',
    },
    milestone: {
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-300',
    },
    streak: {
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-300',
    },
  };

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-blue-600/5" />

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Recent Activity
          </h3>
          <span className="text-xs text-gray-500">Last 10 activities</span>
        </div>

        {/* Timeline */}
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-transparent" />

          {/* Activity items */}
          {recentActivities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-start gap-4 group"
              >
                {/* Icon */}
                <div className={`relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                  {activity.metadata?.icon ? (
                    <span className="text-xl">{activity.metadata.icon}</span>
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className={`p-4 rounded-xl ${config.bgColor} border ${config.borderColor} group-hover:bg-white/10 transition-colors`}>
                    {/* Title & Time */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold ${config.textColor} text-sm`}>
                          {activity.title}
                        </div>
                        {activity.description && (
                          <div className="text-xs text-gray-400 mt-1">
                            {activity.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                        <Calendar className="w-3 h-3" />
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {activity.metadata.duration && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span className="text-xs">⏱️</span>
                            <span>{activity.metadata.duration} min</span>
                          </div>
                        )}
                        {activity.metadata.caloriesBurned && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <span className="text-xs">🔥</span>
                            <span>{activity.metadata.caloriesBurned} cal</span>
                          </div>
                        )}
                        {activity.metadata.workoutStyle && (
                          <div className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-gray-300">
                            {activity.metadata.workoutStyle}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Link */}
        {activities.length > 10 && (
          <button className="w-full py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-all">
            View All Activity
          </button>
        )}
      </div>
    </motion.div>
  );
}
