import React from 'react';
import { Medal, Calendar, Clock, Flame, Trophy, Users } from 'lucide-react';
import { UserStats } from '../../types/profile.types';
import { motion } from 'framer-motion';

interface StatBlockProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  delay?: number;
}

const StatBlock: React.FC<StatBlockProps> = ({ icon, label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
  >
    <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg mb-2">{icon}</div>
    <span className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</span>
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
  </motion.div>
);

interface UserStatsGridProps {
  stats: UserStats;
}

export const UserStatsGrid: React.FC<UserStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatBlock
        icon={<Trophy className="w-6 h-6 text-primary" />}
        label="Workouts"
        value={stats.workoutsCompleted}
        delay={0.1}
      />
      <StatBlock
        icon={<Clock className="w-6 h-6 text-primary" />}
        label="Total Minutes"
        value={stats.totalMinutes}
        delay={0.2}
      />
      <StatBlock
        icon={<Flame className="w-6 h-6 text-primary" />}
        label="Day Streak"
        value={stats.streakDays}
        delay={0.3}
      />
      <StatBlock
        icon={<Medal className="w-6 h-6 text-primary" />}
        label="Achievements"
        value={stats.achievementsCount}
        delay={0.4}
      />
      <StatBlock
        icon={<Users className="w-6 h-6 text-primary" />}
        label="Followers"
        value={stats.followersCount}
        delay={0.5}
      />
      <StatBlock
        icon={<Calendar className="w-6 h-6 text-primary" />}
        label="Following"
        value={stats.followingCount}
        delay={0.6}
      />
    </div>
  );
};
