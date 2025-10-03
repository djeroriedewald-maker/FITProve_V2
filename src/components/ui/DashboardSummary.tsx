import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Flame, 
  Activity, 
  Clock, 
  Calendar,
  Award,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DashboardStat {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    period: string;
  };
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info';
  target?: {
    current: number;
    goal: number;
    unit?: string;
  };
}

interface DashboardSummaryProps {
  stats: DashboardStat[];
  title?: string;
  variant?: 'grid' | 'list' | 'compact';
  showTrends?: boolean;
  className?: string;
}

const colorMap = {
  primary: {
    bg: 'from-primary/20 to-primary/5',
    border: 'border-primary/30',
    icon: 'text-primary',
    accent: 'text-primary',
    glow: 'shadow-primary/20'
  },
  secondary: {
    bg: 'from-secondary/20 to-secondary/5',
    border: 'border-secondary/30',
    icon: 'text-secondary',
    accent: 'text-secondary',
    glow: 'shadow-secondary/20'
  },
  accent: {
    bg: 'from-accent/20 to-accent/5',
    border: 'border-accent/30',
    icon: 'text-accent',
    accent: 'text-accent',
    glow: 'shadow-accent/20'
  },
  success: {
    bg: 'from-green-500/20 to-green-500/5',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    accent: 'text-green-400',
    glow: 'shadow-green-400/20'
  },
  warning: {
    bg: 'from-yellow-500/20 to-yellow-500/5',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    accent: 'text-yellow-400',
    glow: 'shadow-yellow-400/20'
  },
  info: {
    bg: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    accent: 'text-blue-400',
    glow: 'shadow-blue-400/20'
  }
};

const StatCard: React.FC<{
  stat: DashboardStat;
  index: number;
  variant?: 'default' | 'compact';
  showTrend?: boolean;
}> = ({ stat, index, variant = 'default', showTrend = true }) => {
  const colors = colorMap[stat.color];
  const Icon = stat.icon;

  const getTrendIcon = () => {
    if (!stat.trend) return null;
    switch (stat.trend.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className={cn(
          'relative overflow-hidden rounded-xl border backdrop-blur-xl p-4 hover:scale-105 transition-all duration-300',
          `bg-gradient-to-br ${colors.bg}`,
          colors.border,
          colors.glow
        )}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center',
            colors.icon
          )}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium">{stat.label}</p>
            <div className="flex items-end space-x-1">
              <span className="text-white font-bold text-lg">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-white/60 text-sm">{stat.unit}</span>
              )}
            </div>
          </div>

          {showTrend && stat.trend && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={cn(
                'text-xs font-medium',
                stat.trend.direction === 'up' ? 'text-green-400' : 
                stat.trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
              )}>
                {stat.trend.value}
              </span>
            </div>
          )}
        </div>

        {stat.target && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/60">Progress</span>
              <span className={colors.accent}>
                {stat.target.current}/{stat.target.goal} {stat.target.unit || ''}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <motion.div
                className={cn('h-1.5 rounded-full bg-gradient-to-r', colors.bg)}
                initial={{ width: 0 }}
                animate={{ width: `${(stat.target.current / stat.target.goal) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 group hover:scale-105 transition-all duration-300',
        `bg-gradient-to-br ${colors.bg}`,
        colors.border,
        colors.glow
      )}
      whileHover={{ y: -4 }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: [-100, 100] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center',
            colors.icon
          )}>
            <Icon className="w-6 h-6" />
          </div>
          
          {showTrend && stat.trend && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={cn(
                'text-sm font-medium',
                stat.trend.direction === 'up' ? 'text-green-400' : 
                stat.trend.direction === 'down' ? 'text-red-400' : 'text-gray-400'
              )}>
                {stat.trend.value}
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <div className="flex items-end space-x-2">
            <motion.span 
              className="text-3xl font-bold text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {stat.value}
            </motion.span>
            {stat.unit && (
              <span className="text-white/60 text-lg mb-1">{stat.unit}</span>
            )}
          </div>
          <p className="text-white/70 font-medium">{stat.label}</p>
          {showTrend && stat.trend && (
            <p className="text-white/50 text-sm mt-1">
              {stat.trend.period}
            </p>
          )}
        </div>

        {/* Progress bar for targets */}
        {stat.target && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Goal Progress</span>
              <span className={colors.accent}>
                {Math.round((stat.target.current / stat.target.goal) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className={cn(
                  'h-2 rounded-full bg-gradient-to-r shadow-sm',
                  colors.bg
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stat.target.current / stat.target.goal) * 100, 100)}%` }}
                transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{stat.target.current} {stat.target.unit || ''}</span>
              <span>{stat.target.goal} {stat.target.unit || ''}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  stats,
  title = 'Your Stats',
  variant = 'grid',
  showTrends = true,
  className
}) => {
  if (variant === 'list') {
    return (
      <div className={cn('space-y-4', className)}>
        {title && (
          <h3 className="text-white font-bold text-lg">{title}</h3>
        )}
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              variant="compact"
              showTrend={showTrends}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-4', className)}>
        {title && (
          <h3 className="text-white font-bold text-lg">{title}</h3>
        )}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              variant="compact"
              showTrend={showTrends}
            />
          ))}
        </div>
      </div>
    );
  }

  // Grid variant (default)
  return (
    <div className={cn('space-y-6', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-xl">{title}</h3>
          <div className="text-white/60 text-sm">
            {stats.filter(s => s.trend?.direction === 'up').length} improving
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.id}
            stat={stat}
            index={index}
            showTrend={showTrends}
          />
        ))}
      </div>
    </div>
  );
};