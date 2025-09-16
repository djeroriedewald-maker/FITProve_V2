import React from 'react';
import { motion } from 'framer-motion';
import { WorkoutHistory } from '../../types/profile.types';
import { Clock, Flame } from 'lucide-react';

interface WorkoutCardProps {
  workout: WorkoutHistory;
  delay?: number;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{workout.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{workout.type}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{workout.duration} min</span>
        </div>
        <div className="flex items-center justify-end space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Flame className="w-4 h-4" />
          <span>{workout.caloriesBurned} cal</span>
        </div>
      </div>
    </div>
    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
      {workout.completedAt.toLocaleDateString()} at {workout.completedAt.toLocaleTimeString()}
    </div>
  </motion.div>
);

interface WorkoutHistoryListProps {
  workouts: WorkoutHistory[];
}

export const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({ workouts }) => {
  return (
    <div className="space-y-4">
      {workouts.map((workout, index) => (
        <WorkoutCard key={workout.id} workout={workout} delay={index * 0.1} />
      ))}
    </div>
  );
};
