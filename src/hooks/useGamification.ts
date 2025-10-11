/**
 * useGamification Hook
 * Provides easy access to gamification features throughout the app
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GamificationService } from '../services/gamification.service';
import type {
  UserLevel,
  AchievementProgress,
  UserStreak,
  AwardXPResult,
  StreakUpdate,
} from '../types/gamification.types';

interface UseGamificationReturn {
  // User Progress
  userLevel: UserLevel | null;
  achievements: AchievementProgress[];
  streak: UserStreak | null;

  // Loading states
  isLoading: boolean;
  error: Error | null;

  // Actions
  awardXP: (
    xpAmount: number,
    reason: string,
    activityType: string,
    relatedEntityId?: string
  ) => Promise<AwardXPResult | null>;
  updateStreak: () => Promise<StreakUpdate | null>;
  checkAchievements: (
    activityType: string,
    currentValue: number
  ) => Promise<AchievementProgress[]>;
  refreshData: () => Promise<void>;

  // Callbacks
  onLevelUp?: (newLevel: number, xpAwarded: number) => void;
  onAchievementUnlock?: (achievement: AchievementProgress) => void;
  onStreakMilestone?: (streak: number) => void;
}

export function useGamification(
  onLevelUp?: (newLevel: number, xpAwarded: number) => void,
  onAchievementUnlock?: (achievement: AchievementProgress) => void,
  onStreakMilestone?: (streak: number) => void
): UseGamificationReturn {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [levelData, achievementData, streakData] = await Promise.all([
        GamificationService.getUserLevel(user.id),
        GamificationService.getUserAchievements(user.id),
        GamificationService.getUserStreak(user.id),
      ]);

      setUserLevel(levelData);
      setAchievements(achievementData || []);
      setStreak(streakData);
    } catch (err) {
      console.error('Error loading gamification data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Award XP with level-up detection
  const awardXP = useCallback(
    async (
      xpAmount: number,
      reason: string,
      activityType: string,
      relatedEntityId?: string
    ): Promise<AwardXPResult | null> => {
      if (!user) return null;

      try {
        const result = await GamificationService.awardXP(
          user.id,
          xpAmount,
          reason,
          activityType,
          relatedEntityId
        );

        if (result) {
          // Update local state
          setUserLevel({
            ...userLevel!,
            current_xp: result.new_xp,
            total_xp: result.new_total_xp,
            current_level: result.new_level,
          });

          // Trigger level-up callback
          if (result.level_up && onLevelUp) {
            onLevelUp(result.new_level, result.xp_awarded);
          }

          return result;
        }

        return null;
      } catch (err) {
        console.error('Error awarding XP:', err);
        setError(err as Error);
        return null;
      }
    },
    [user, userLevel, onLevelUp]
  );

  // Update streak with milestone detection
  const updateStreak = useCallback(async (): Promise<StreakUpdate | null> => {
    if (!user) return null;

    try {
      const result = await GamificationService.updateStreak(user.id);

      if (result) {
        // Update local state
        setStreak((prev) => ({
          ...prev!,
          current_streak: result.new_streak,
          longest_streak: result.longest_streak,
          last_workout_date: result.last_workout_date,
        }));

        // Trigger milestone callback for streaks: 7, 30, 100, 365
        if (
          onStreakMilestone &&
          result.milestone_reached &&
          [7, 30, 100, 365].includes(result.new_streak)
        ) {
          onStreakMilestone(result.new_streak);
        }

        return result;
      }

      return null;
    } catch (err) {
      console.error('Error updating streak:', err);
      setError(err as Error);
      return null;
    }
  }, [user, onStreakMilestone]);

  // Check and unlock achievements
  const checkAchievements = useCallback(
    async (
      activityType: string,
      currentValue: number
    ): Promise<AchievementProgress[]> => {
      if (!user) return [];

      try {
        const unlocked = await GamificationService.checkAndUnlockAchievements(
          user.id,
          activityType,
          currentValue
        );

        if (unlocked && unlocked.length > 0) {
          // Update local achievements
          setAchievements((prev) => {
            const updatedAchievements = [...prev];
            unlocked.forEach((newAchievement) => {
              const index = updatedAchievements.findIndex(
                (a) => a.achievement_id === newAchievement.achievement_id
              );
              if (index !== -1) {
                updatedAchievements[index] = newAchievement;
              } else {
                updatedAchievements.push(newAchievement);
              }
            });
            return updatedAchievements;
          });

          // Trigger unlock callbacks
          if (onAchievementUnlock) {
            unlocked.forEach((achievement) => {
              if (achievement.is_unlocked) {
                onAchievementUnlock(achievement);
              }
            });
          }

          return unlocked;
        }

        return [];
      } catch (err) {
        console.error('Error checking achievements:', err);
        setError(err as Error);
        return [];
      }
    },
    [user, onAchievementUnlock]
  );

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    userLevel,
    achievements,
    streak,
    isLoading,
    error,
    awardXP,
    updateStreak,
    checkAchievements,
    refreshData,
  };
}

/**
 * Example Usage:
 *
 * function WorkoutCompletePage() {
 *   const { awardXP, updateStreak, checkAchievements } = useGamification(
 *     (newLevel, xp) => console.log('Level up!', newLevel, xp),
 *     (achievement) => setShowAchievementModal(achievement),
 *     (streak) => console.log('Streak milestone!', streak)
 *   );
 *
 *   const handleWorkoutComplete = async () => {
 *     // Award XP for completing workout
 *     await awardXP(150, 'Completed workout', 'workout_completion');
 *
 *     // Update daily streak
 *     await updateStreak();
 *
 *     // Check for achievement unlocks
 *     await checkAchievements('workout_count', totalWorkouts + 1);
 *   };
 *
 *   return <button onClick={handleWorkoutComplete}>Complete Workout</button>;
 * }
 */
