import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Zap, Users, Star, Bookmark, Share, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface WorkoutData {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: number;
  category: string;
  rating?: number;
  totalRatings?: number;
  instructor?: {
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  tags?: string[];
  isBookmarked?: boolean;
  isPremium?: boolean;
  completedBy?: number;
}

interface ModernWorkoutCardProps {
  workout: WorkoutData;
  variant?: 'default' | 'featured' | 'compact' | 'list';
  onPlay?: (workout: WorkoutData) => void;
  onBookmark?: (workout: WorkoutData) => void;
  onShare?: (workout: WorkoutData) => void;
  className?: string;
}

const difficultyColors = {
  beginner: {
    bg: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    dot: 'bg-green-400',
  },
  intermediate: {
    bg: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  advanced: {
    bg: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
};

export const ModernWorkoutCard: React.FC<ModernWorkoutCardProps> = ({
  workout,
  variant = 'default',
  onPlay,
  onBookmark,
  onShare,
  className,
}) => {
  const difficultyStyle = difficultyColors[workout.difficulty];

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-4 cursor-pointer group',
          className
        )}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPlay?.(workout)}
      >
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
            {workout.thumbnail ? (
              <img 
                src={workout.thumbnail} 
                alt={workout.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white/60" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm truncate mb-1">
              {workout.title}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-white/60">
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(workout.duration)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className={cn('w-2 h-2 rounded-full', difficultyStyle.dot)} />
                <span className={difficultyStyle.text}>
                  {workout.difficulty}
                </span>
              </span>
            </div>
          </div>

          {/* Play button */}
          <motion.button
            className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play className="w-4 h-4 text-primary ml-0.5" />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl cursor-pointer group',
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background image */}
        <div className="relative h-48 overflow-hidden">
          {workout.thumbnail ? (
            <>
              <img 
                src={workout.thumbnail} 
                alt={workout.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          )}

          {/* Premium badge */}
          {workout.isPremium && (
            <div className="absolute top-4 left-4">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold">
                Premium
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.(workout);
              }}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl transition-colors',
                workout.isBookmarked ? 'bg-primary/30 text-primary' : 'bg-white/20 text-white/70 hover:bg-white/30'
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark className="w-4 h-4" fill={workout.isBookmarked ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(workout);
              }}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white/70 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              onClick={() => onPlay?.(workout)}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="w-6 h-6 text-white ml-1" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-2">{workout.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2">
                {workout.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-1 text-white/60">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(workout.duration)}</span>
              </span>
              <span className="flex items-center space-x-1 text-white/60">
                <Zap className="w-4 h-4" />
                <span>{workout.exercises} exercises</span>
              </span>
              {workout.rating && (
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white/80">{workout.rating}</span>
                  {workout.totalRatings && (
                    <span className="text-white/60">({workout.totalRatings})</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Tags and difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {workout.tags?.slice(0, 2).map((tag) => (
                <span 
                  key={tag}
                  className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-semibold',
              `bg-gradient-to-r ${difficultyStyle.bg}`,
              difficultyStyle.text
            )}>
              {workout.difficulty}
            </span>
          </div>

          {/* Instructor */}
          {workout.instructor && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs text-white font-semibold">
                {workout.instructor.avatar ? (
                  <img 
                    src={workout.instructor.avatar} 
                    alt={workout.instructor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  workout.instructor.name.charAt(0)
                )}
              </div>
              <span className="text-white/70 text-sm">{workout.instructor.name}</span>
              {workout.completedBy && (
                <span className="text-white/50 text-xs ml-auto">
                  {workout.completedBy}+ completed
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl cursor-pointer group',
        className
      )}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onPlay?.(workout)}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: [-100, 100] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2">{workout.title}</h3>
            <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
              {workout.description}
            </p>
          </div>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.(workout);
            }}
            className={cn(
              'ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              workout.isBookmarked ? 'text-primary' : 'text-white/40 hover:text-white/60'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bookmark className="w-4 h-4" fill={workout.isBookmarked ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(workout.duration)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Zap className="w-4 h-4" />
            <span>{workout.exercises} exercises</span>
          </span>
          <span className="flex items-center space-x-1">
            <div className={cn('w-2 h-2 rounded-full', difficultyStyle.dot)} />
            <span className={difficultyStyle.text}>{workout.difficulty}</span>
          </span>
        </div>

        {/* Tags */}
        {workout.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {workout.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="px-2 py-1 rounded-lg bg-white/10 text-white/70 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {workout.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-white/80 text-sm">{workout.rating}</span>
              </div>
            )}
            {workout.completedBy && (
              <div className="flex items-center space-x-1 text-white/60 text-sm">
                <Users className="w-4 h-4" />
                <span>{workout.completedBy}</span>
              </div>
            )}
          </div>

          <motion.button
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Workout
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};