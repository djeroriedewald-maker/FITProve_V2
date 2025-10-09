// GoalCard Component
// Displays individual workout goals with progress

import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Flame,
  Dumbbell,
  Clock,
  Activity,
  TrendingUp,
  CheckCircle,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Goal } from '../../types/goal.types';
import { calculateGoalProgress, isGoalOverdue, getDaysRemaining } from '../../lib/goals.service';
import { GlassCard } from './GlassCard';
import moment from 'moment';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onComplete?: (goalId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  flame: Flame,
  dumbbell: Dumbbell,
  clock: Clock,
  activity: Activity,
  trending: TrendingUp,
};

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-400 to-cyan-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
  green: 'from-green-400 to-green-600',
  blue: 'from-blue-400 to-blue-600',
  pink: 'from-pink-400 to-pink-600',
};

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onComplete }) => {
  const progress = calculateGoalProgress(goal);
  const isCompleted = goal.status === 'completed';
  const isOverdue = isGoalOverdue(goal);
  const daysRemaining = getDaysRemaining(goal);

  // Determine icon and color based on goal type or default
  const getIconName = (): string => {
    switch (goal.type) {
      case 'streak_days':
        return 'flame';
      case 'workouts_per_week':
        return 'dumbbell';
      case 'workout_minutes':
        return 'clock';
      case 'calories_burned':
        return 'activity';
      default:
        return 'target';
    }
  };

  const getColor = (): string => {
    switch (goal.type) {
      case 'streak_days':
        return 'orange';
      case 'workouts_per_week':
        return 'cyan';
      case 'workout_minutes':
        return 'purple';
      case 'calories_burned':
        return 'green';
      default:
        return 'blue';
    }
  };

  const IconComponent = iconMap[getIconName()] || Target;
  const gradientColor = colorMap[getColor()] || colorMap.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <GlassCard
        variant="workout"
        className={`p-6 relative overflow-hidden ${
          isCompleted ? 'ring-2 ring-green-400/30' : isOverdue ? 'ring-2 ring-red-400/30' : ''
        }`}
      >
        {/* Background gradient accent */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientColor} opacity-10 blur-3xl rounded-full`}
        />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center`}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{goal.title}</h3>
              {goal.description && (
                <p className="text-sm text-white/60 mt-1">{goal.description}</p>
              )}
            </div>
          </div>

          {/* Status badge */}
          {isCompleted && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg border border-green-400/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">Completed</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/70">Progress</span>
            <span className="text-sm font-bold text-white">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${gradientColor} rounded-full`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-white">
              {goal.current_value}
              <span className="text-sm text-white/60 ml-1">/ {goal.target_value}</span>
            </div>
            <div className="text-xs text-white/50 mt-1">{goal.unit}</div>
          </div>

          {/* Deadline info */}
          {goal.deadline && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/70">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-xs">
                  {daysRemaining !== null && daysRemaining >= 0
                    ? `${daysRemaining} days left`
                    : isOverdue
                    ? 'Overdue'
                    : moment(goal.deadline).format('MMM D, YYYY')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative z-10 flex items-center gap-2 pt-4 border-t border-white/10">
          {!isCompleted && onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}

          {!isCompleted && progress >= 100 && onComplete && (
            <button
              onClick={() => onComplete(goal.id)}
              className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-green-400/30"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default GoalCard;
