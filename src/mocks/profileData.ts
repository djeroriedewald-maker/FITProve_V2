import { UserProfile } from '../types/profile.types';

export const mockUserProfile: UserProfile = {
  id: '1',
  username: 'fitprove_user',
  displayName: 'John Doe',
  bio: 'Passionate about fitness and healthy living. Always striving to improve and inspire others.',
  avatarUrl: '/default-avatar.svg',
  memberSince: new Date('2025-01-01'),
  level: 15,
  stats: {
    workoutsCompleted: 147,
    totalMinutes: 4380,
    streakDays: 12,
    achievementsCount: 23,
    followersCount: 256,
    followingCount: 184
  },
  achievements: [
    {
      id: '1',
      title: 'Early Bird',
      description: 'Complete 10 workouts before 8 AM',
      icon: '/icons/achievements/early-bird.svg',
      unlockedAt: new Date('2025-08-15'),
      progress: {
        current: 10,
        target: 10
      }
    },
    {
      id: '2',
      title: 'Consistency King',
      description: 'Maintain a 30-day workout streak',
      icon: '/icons/achievements/streak.svg',
      unlockedAt: null,
      progress: {
        current: 12,
        target: 30
      }
    },
    {
      id: '3',
      title: 'Strength Master',
      description: 'Achieve a new personal record in three different exercises',
      icon: '/icons/achievements/strength.svg',
      unlockedAt: new Date('2025-09-01')
    }
  ],
  recentWorkouts: [
    {
      id: '1',
      type: 'Strength Training',
      title: 'Full Body Workout',
      duration: 45,
      caloriesBurned: 320,
      completedAt: new Date('2025-09-13T09:00:00')
    },
    {
      id: '2',
      type: 'Cardio',
      title: 'HIIT Session',
      duration: 30,
      caloriesBurned: 280,
      completedAt: new Date('2025-09-12T16:30:00')
    },
    {
      id: '3',
      type: 'Flexibility',
      title: 'Yoga Flow',
      duration: 60,
      caloriesBurned: 180,
      completedAt: new Date('2025-09-11T07:00:00')
    }
  ],
  fitnessGoals: ['Build Strength', 'Improve Flexibility', 'Weight Loss']
};