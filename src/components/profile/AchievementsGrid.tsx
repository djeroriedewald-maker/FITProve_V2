import React from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../types/profile.types';

interface AchievementCardProps {
  achievement: Achievement;
  delay?: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, delay = 0 }) => {
  const isUnlocked = achievement.unlockedAt !== null;
  const progressPercentage = achievement.progress 
    ? (achievement.progress.current / achievement.progress.target) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`relative p-4 rounded-xl shadow-sm ${
        isUnlocked 
          ? 'bg-white dark:bg-gray-800' 
          : 'bg-gray-100 dark:bg-gray-700/50'
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${
          isUnlocked 
            ? 'bg-primary/10 dark:bg-primary/20' 
            : 'bg-gray-200 dark:bg-gray-600'
        }`}>
          <img
            src={achievement.icon}
            alt={achievement.title}
            className={`w-8 h-8 ${!isUnlocked && 'opacity-50 grayscale'}`}
          />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${
            isUnlocked 
              ? 'text-gray-900 dark:text-white' 
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {achievement.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {achievement.description}
          </p>
          {achievement.progress && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {achievement.progress.current} / {achievement.progress.target}
              </p>
            </div>
          )}
          {isUnlocked && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Unlocked {achievement.unlockedAt?.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface AchievementsGridProps {
  achievements: Achievement[];
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement, index) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};