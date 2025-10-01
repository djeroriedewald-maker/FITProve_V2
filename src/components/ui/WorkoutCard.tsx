import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface WorkoutCardProps {
  title: string;
  description?: string;
  duration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises?: number;
  image?: string;
  tags?: string[];
  onTap?: () => void;
  className?: string;
  featured?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  title,
  description,
  duration,
  difficulty,
  exercises,
  image,
  tags = [],
  onTap,
  className,
  featured = false,
}) => {
  const difficultyColors = {
    Beginner: 'from-green-400 to-green-600',
    Intermediate: 'from-yellow-400 to-orange-500',
    Advanced: 'from-red-400 to-red-600',
  };

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden cursor-pointer group',
        featured
          ? 'glass-card bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20'
          : 'workout-card',
        className
      )}
      onClick={onTap}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Background Image */}
      {image && (
        <div className="absolute inset-0 z-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Animated Border */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-accent to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate mb-1">{title}</h3>
            {description && <p className="text-sm text-white/70 line-clamp-2">{description}</p>}
          </div>

          {difficulty && (
            <div
              className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold text-white ml-2 flex-shrink-0',
                `bg-gradient-to-r ${difficultyColors[difficulty]}`
              )}
            >
              {difficulty}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center space-x-4 mb-4">
          {duration && (
            <div className="flex items-center space-x-1 text-white/80">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span className="text-sm font-medium">{duration}</span>
            </div>
          )}

          {exercises && (
            <div className="flex items-center space-x-1 text-white/80">
              <div className="w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-secondary" />
              </div>
              <span className="text-sm font-medium">{exercises} exercises</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium rounded-lg bg-glass-white text-white/90 border border-white/20"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium rounded-lg bg-glass-white text-white/90 border border-white/20">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </motion.div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'orange' | 'green';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
  glowColor = 'cyan',
}) => {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-white/70',
  };

  return (
    <motion.div
      className={cn('stats-card', className)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{value}</span>
            {trendValue && trend && (
              <span className={cn('text-sm font-medium', trendColors[trend])}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              glowColor === 'cyan' && 'bg-primary/20 text-primary',
              glowColor === 'purple' && 'bg-secondary/20 text-secondary',
              glowColor === 'orange' && 'bg-accent/20 text-accent',
              glowColor === 'green' && 'bg-green-500/20 text-green-400'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};
