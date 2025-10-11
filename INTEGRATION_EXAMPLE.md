# 🔗 Gamification Integration Examples

This guide shows how to integrate gamification features into your existing workout flows.

## Table of Contents
- [Workout Completion Flow](#workout-completion-flow)
- [Exercise Library Integration](#exercise-library-integration)
- [Profile Page Integration](#profile-page-integration)
- [Social Features Integration](#social-features-integration)

---

## Workout Completion Flow

### Scenario: User completes a workout
Award XP, update streak, check achievements, and show celebrations.

```typescript
// pages/WorkoutSummaryPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { AchievementUnlockModal } from '../components/gamification';
import type { AchievementProgress } from '../types/gamification.types';

export function WorkoutSummaryPage() {
  const navigate = useNavigate();
  const [unlockedAchievement, setUnlockedAchievement] = useState<AchievementProgress | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const { endSession } = useWorkoutSession();

  const { awardXP, updateStreak, checkAchievements, userLevel } = useGamification(
    // onLevelUp callback
    (newLevel, xp) => {
      console.log(`🎉 Level Up! You're now level ${newLevel}!`);
      // You can show a custom level-up modal here
    },
    // onAchievementUnlock callback
    (achievement) => {
      console.log('🏆 Achievement Unlocked!', achievement);
      setUnlockedAchievement(achievement);
      setShowAchievementModal(true);
    },
    // onStreakMilestone callback
    (streak) => {
      console.log(`🔥 Streak Milestone! ${streak} days!`);
      // Show custom streak celebration
    }
  );

  const handleCompleteWorkout = async (workoutData: any) => {
    // 1. End the live workout session
    await endSession();

    // 2. Calculate XP based on workout metrics
    const baseXP = 100;
    const durationBonus = Math.floor(workoutData.duration / 60) * 10; // 10 XP per minute
    const exerciseBonus = workoutData.exercises.length * 5; // 5 XP per exercise
    const totalXP = baseXP + durationBonus + exerciseBonus;

    // 3. Award XP
    const xpResult = await awardXP(
      totalXP,
      'Completed workout',
      'workout_completion',
      workoutData.id
    );

    console.log('XP Result:', xpResult);

    // 4. Update daily streak
    const streakResult = await updateStreak();
    console.log('Streak Result:', streakResult);

    // 5. Check for achievement unlocks
    const totalWorkouts = workoutData.userWorkoutCount + 1;
    const achievements = await checkAchievements('workout_count', totalWorkouts);

    // Also check for other achievement types
    if (workoutData.duration >= 60) {
      await checkAchievements('workout_duration', workoutData.duration);
    }

    if (workoutData.caloriesBurned >= 500) {
      await checkAchievements('calories_burned', workoutData.caloriesBurned);
    }

    // 6. Navigate to next screen
    setTimeout(() => {
      navigate('/workout-history');
    }, 2000);
  };

  return (
    <div className="workout-summary">
      {/* Workout stats, charts, etc. */}

      <button onClick={() => handleCompleteWorkout(workoutData)}>
        Complete Workout
      </button>

      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        achievement={unlockedAchievement}
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false);
          setUnlockedAchievement(null);
        }}
      />
    </div>
  );
}
```

---

## Exercise Library Integration

### Scenario: Show user's level and quick stats in exercise library

```typescript
// pages/ExerciseLibraryPage.tsx
import { XPProgressBar } from '../components/gamification';
import { useGamification } from '../hooks/useGamification';

export function ExerciseLibraryPage() {
  const { userLevel, isLoading } = useGamification();

  return (
    <div className="exercise-library">
      {/* Header with user stats */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Exercise Library</h1>

        {/* Compact XP bar in header */}
        {!isLoading && <XPProgressBar variant="compact" showDetails={false} />}
      </header>

      {/* Exercise filters and list */}
      {/* ... */}
    </div>
  );
}
```

---

## Profile Page Integration

### Scenario: Show comprehensive gamification stats on user profile

```typescript
// pages/ProfilePage.tsx
import { useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import {
  XPProgressBar,
  StreakDisplay,
  AchievementGrid,
} from '../components/gamification';

export function ProfilePage() {
  const { userLevel, achievements, streak, isLoading } = useGamification();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements'>('overview');

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  const completedAchievements = achievements.filter((a) => a.is_unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <section className="profile-header mb-8">
        <div className="flex items-center gap-6">
          <img src={user.avatar} className="w-24 h-24 rounded-full" />
          <div>
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <p className="text-xl text-white/60">
              Level {userLevel?.current_level} {userLevel?.level_title}
            </p>
          </div>
        </div>
      </section>

      {/* Gamification Stats */}
      <section className="gamification-stats mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* XP Progress */}
          <div className="lg:col-span-2">
            <XPProgressBar variant="full" showDetails />
          </div>

          {/* Streak */}
          <div>
            <StreakDisplay variant="full" showLongest />
          </div>
        </div>

        {/* Achievement Summary */}
        <div className="mt-6 p-6 bg-white/10 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Achievements</h3>
              <p className="text-white/60">
                {completedAchievements} of {totalAchievements} unlocked
              </p>
            </div>
            <button
              onClick={() => setSelectedTab('achievements')}
              className="px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600"
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section>
        {selectedTab === 'overview' && (
          <div>
            {/* Workout history, stats, etc. */}
          </div>
        )}

        {selectedTab === 'achievements' && (
          <AchievementGrid showFilters columns={3} />
        )}
      </section>
    </div>
  );
}
```

---

## Social Features Integration

### Scenario: Award XP for social actions (follow, share, comment)

```typescript
// components/SocialActions.tsx
import { useGamification } from '../hooks/useGamification';

export function SocialActions({ postId }: { postId: string }) {
  const { awardXP, checkAchievements } = useGamification();

  const handleLike = async () => {
    // Like the post
    await likePost(postId);

    // Award XP
    await awardXP(5, 'Liked a post', 'social_interaction', postId);

    // Check for social achievements
    const totalLikes = await getUserTotalLikes();
    await checkAchievements('social_likes', totalLikes);
  };

  const handleComment = async (commentText: string) => {
    // Post comment
    await createComment(postId, commentText);

    // Award XP
    await awardXP(10, 'Commented on a post', 'social_interaction', postId);

    // Check for social achievements
    const totalComments = await getUserTotalComments();
    await checkAchievements('social_comments', totalComments);
  };

  const handleShare = async () => {
    // Share the post
    await sharePost(postId);

    // Award XP
    await awardXP(15, 'Shared a post', 'social_interaction', postId);

    // Check for creator achievements
    const totalShares = await getUserTotalShares();
    await checkAchievements('social_shares', totalShares);
  };

  return (
    <div className="social-actions">
      <button onClick={handleLike}>❤️ Like (+5 XP)</button>
      <button onClick={() => handleComment('Great post!')}>💬 Comment (+10 XP)</button>
      <button onClick={handleShare}>🔗 Share (+15 XP)</button>
    </div>
  );
}
```

---

## Live Workout Session Integration

### Scenario: Start/end workout session with live activity tracking

```typescript
// pages/WorkoutPage.tsx
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { useGamification } from '../hooks/useGamification';
import { useEffect } from 'react';

export function WorkoutPage() {
  const { isSessionActive, startSession, endSession } = useWorkoutSession();
  const { awardXP } = useGamification();

  const handleStartWorkout = async (workoutType: 'strength' | 'cardio' | 'hybrid') => {
    // Start live session (appears in community live activity)
    await startSession(workoutType);

    // Award XP for starting workout
    await awardXP(25, 'Started workout', 'workout_start');
  };

  const handleEndWorkout = async () => {
    // End live session
    await endSession();

    // Navigate to summary
    navigate('/workout-summary');
  };

  // Auto-end session if user navigates away without ending
  useEffect(() => {
    return () => {
      if (isSessionActive) {
        endSession();
      }
    };
  }, [isSessionActive, endSession]);

  return (
    <div className="workout-page">
      {!isSessionActive ? (
        <div>
          <h2>Ready to start your workout?</h2>
          <button onClick={() => handleStartWorkout('strength')}>
            Start Strength Workout
          </button>
          <button onClick={() => handleStartWorkout('cardio')}>
            Start Cardio Workout
          </button>
          <button onClick={() => handleStartWorkout('hybrid')}>
            Start Hybrid Workout
          </button>
        </div>
      ) : (
        <div>
          <h2>Workout in Progress... 💪</h2>
          {/* Workout exercises, timer, etc. */}
          <button onClick={handleEndWorkout}>End Workout</button>
        </div>
      )}
    </div>
  );
}
```

---

## Challenge Participation Integration

### Scenario: Join a challenge and track progress

```typescript
// pages/ChallengeDetailsPage.tsx
import { useState } from 'react';
import { GamificationService } from '../services/gamification.service';
import { useAuth } from '../contexts/AuthContext';

export function ChallengeDetailsPage({ challengeId }: { challengeId: string }) {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [isParticipating, setIsParticipating] = useState(false);

  const handleJoinChallenge = async () => {
    if (!user) return;

    // Join the challenge
    const result = await GamificationService.joinChallenge(
      challengeId,
      user.id,
      user.username || 'Anonymous'
    );

    if (result) {
      setIsParticipating(true);

      // Award XP for joining
      await GamificationService.awardXP(
        user.id,
        50,
        'Joined a challenge',
        'challenge_join',
        challengeId
      );
    }
  };

  const handleLogProgress = async (progressValue: number) => {
    if (!user) return;

    // Log challenge progress
    await GamificationService.logChallengeProgress(
      challengeId,
      user.id,
      progressValue,
      'workout_completed'
    );

    // Check if challenge is complete
    const progress = await GamificationService.getChallengeProgress(challengeId, user.id);

    if (progress && progress.current_progress >= challenge.goal_value) {
      // Challenge completed! Award rewards
      await GamificationService.awardXP(
        user.id,
        challenge.xp_reward,
        'Completed challenge',
        'challenge_completion',
        challengeId
      );

      // Show celebration
      alert('Challenge Complete! 🎉');
    }
  };

  return (
    <div className="challenge-details">
      <h1>{challenge?.title}</h1>
      <p>{challenge?.description}</p>

      {!isParticipating ? (
        <button onClick={handleJoinChallenge}>Join Challenge (+50 XP)</button>
      ) : (
        <div>
          <p>You're in! Keep going!</p>
          <button onClick={() => handleLogProgress(1)}>Log Workout</button>
        </div>
      )}
    </div>
  );
}
```

---

## XP Reward Values Reference

Use these values when awarding XP for different activities:

```typescript
// constants/xp-rewards.ts
export const XP_REWARDS = {
  // Workout Actions
  WORKOUT_START: 25,
  WORKOUT_COMPLETE: 100,
  WORKOUT_MINUTE: 10, // Per minute of workout
  EXERCISE_COMPLETE: 5,

  // Social Actions
  LIKE_POST: 5,
  COMMENT_POST: 10,
  SHARE_POST: 15,
  FOLLOW_USER: 10,
  CREATE_POST: 20,

  // Challenge Actions
  JOIN_CHALLENGE: 50,
  CHALLENGE_COMPLETE: (challenge) => challenge.xp_reward,
  CHALLENGE_MILESTONE: 25,

  // Creator Actions
  WORKOUT_PUBLISHED: 50,
  WORKOUT_SHARED: 15,
  WORKOUT_RATED_5_STARS: 30,

  // Achievements
  ACHIEVEMENT_UNLOCK: (achievement) => achievement.xp_reward,

  // Streak Bonuses
  STREAK_7_DAY: 100,
  STREAK_30_DAY: 500,
  STREAK_100_DAY: 2000,
  STREAK_365_DAY: 10000,
};
```

---

## Best Practices

### 1. **Always Award XP After Actions Complete**
```typescript
// ❌ Bad - awarding XP before action completes
await awardXP(100, 'Workout complete', 'workout_completion');
await completeWorkout();

// ✅ Good - award XP after action succeeds
await completeWorkout();
await awardXP(100, 'Workout complete', 'workout_completion');
```

### 2. **Check Multiple Achievement Types**
```typescript
// After workout completion, check multiple achievement categories
await checkAchievements('workout_count', totalWorkouts);
await checkAchievements('workout_duration', workoutDuration);
await checkAchievements('calories_burned', totalCalories);
await checkAchievements('consistency', currentStreak);
```

### 3. **Use Activity Type Consistently**
Use standardized activity type strings for XP tracking:
- `workout_completion`
- `workout_start`
- `social_interaction`
- `challenge_join`
- `challenge_completion`
- `achievement_unlock`
- `streak_milestone`

### 4. **Handle Errors Gracefully**
```typescript
try {
  await awardXP(100, 'Workout complete', 'workout_completion');
} catch (error) {
  console.error('Failed to award XP:', error);
  // Don't block the user flow, just log the error
  // XP can be retroactively awarded later if needed
}
```

### 5. **Provide Visual Feedback**
Always show users they've earned something:
- Confetti for level-ups and achievements
- Toast notifications for XP gains
- Progress bars for challenges
- Streak flames for daily consistency

---

## Testing Your Integration

1. **Award XP manually** to test level-ups:
```sql
SELECT award_xp('<your-user-id>'::UUID, 1000, 'Test XP', 'test_activity', NULL);
```

2. **Check achievement progress**:
```sql
SELECT * FROM achievement_progress WHERE user_id = '<your-user-id>';
```

3. **Monitor XP transactions**:
```sql
SELECT * FROM xp_transactions WHERE user_id = '<your-user-id>' ORDER BY created_at DESC;
```

4. **Test live sessions**:
```sql
SELECT * FROM active_workout_sessions WHERE user_id = '<your-user-id>';
```

---

**Ready to implement?** Start with the workout completion flow - it's the most impactful integration point!
