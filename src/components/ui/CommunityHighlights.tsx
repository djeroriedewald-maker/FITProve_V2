import { Trophy, Medal, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  type: 'milestone' | 'record' | 'streak' | 'challenge';
  title: string;
  description: string;
  timestamp: Date;
}

const getAchievementIcon = (type: Achievement['type']) => {
  switch (type) {
    case 'milestone':
      return Trophy;
    case 'record':
      return Medal;
    case 'streak':
      return Flame;
    case 'challenge':
      return Star;
    default:
      return Trophy;
  }
};

export const CommunityHighlights = () => {
  // Mock data - replace with real data from your backend
  const achievements: Achievement[] = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        avatar: '/images/avatars/sarah.jpg'
      },
      type: 'milestone',
      title: 'Reached 100 Workouts',
      description: 'Completed their 100th workout milestone!',
      timestamp: new Date('2025-09-13T10:00:00')
    },
    {
      id: '2',
      user: {
        name: 'Mike Chen',
        avatar: '/images/avatars/mike.jpg'
      },
      type: 'record',
      title: 'New Personal Best',
      description: 'Set a new record in bench press: 225 lbs',
      timestamp: new Date('2025-09-13T09:30:00')
    },
    {
      id: '3',
      user: {
        name: 'Emily White',
        avatar: '/images/avatars/emily.jpg'
      },
      type: 'streak',
      title: '30-Day Streak',
      description: 'Maintained a workout streak for 30 days!',
      timestamp: new Date('2025-09-13T08:45:00')
    }
  ];

  return (
    <div className="rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
        Community Highlights
      </h3>
      <div className="space-y-4">
        {achievements.map((achievement, index) => {
          const Icon = getAchievementIcon(achievement.type);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {achievement.user.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {achievement.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {achievement.title}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full px-4 py-3 text-sm font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-lg hover:bg-primary/15 dark:hover:bg-primary/25 transition-colors duration-300"
      >
        View All Achievements
      </motion.button>
    </div>
  );
};