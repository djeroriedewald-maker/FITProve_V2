# 🎮 Gamification System - Testing Guide

## Quick Start Testing

### 1. Seed Test Data

Run the seed data script in Supabase SQL Editor to populate test challenges and leaderboards:

```sql
-- Copy and paste the contents of: supabase/seed-gamification-data.sql
```

This will create:
- ✅ 9 sample challenges (individual, team, community, upcoming)
- ✅ 150 leaderboard entries across 3 types (weekly_workouts, xp, streak)
- ✅ 15 simulated active workout sessions
- ✅ Community stats for today

### 2. View the Community Page

Navigate to `/community` in your browser. You should see:

**Hero Section:**
- Live activity ticker showing active users
- Animated gradient title
- Hero image with overlay

**User Progress (if logged in):**
- XP progress bar with level information
- Streak display showing current/longest streak

**Navigation Tabs:**
- Overview
- Leaderboards
- Achievements
- Challenges

### 3. Test Each Tab

#### Overview Tab
- ✅ Live activity counter (full version)
- ✅ Community highlights
- ✅ Three promo cards (Workouts, Challenges, Network)
- ✅ Quick leaderboard preview

#### Leaderboards Tab
- ✅ Weekly workouts leaderboard with top 50
- ✅ XP leaderboard with top 50
- ✅ Streak leaderboard with top 50
- ✅ Podium display for top 3
- ✅ User avatars and level badges

#### Achievements Tab
- ✅ Achievement grid with filters
- ✅ Categories: workouts, consistency, social, creator, challenges, special
- ✅ Tier filters: bronze, silver, gold, platinum, legend
- ✅ Progress bars on each achievement
- ✅ Lock icons for unreached achievements

#### Challenges Tab
- ✅ Challenge browser with grid layout
- ✅ Active, upcoming, and completed challenges
- ✅ Challenge cards showing:
  - Title and description
  - Participant count
  - Time remaining
  - Difficulty level
  - XP/coin rewards
  - Featured badges

## Testing Gamification Features

### Test XP System

1. **Award XP Manually (Supabase SQL Editor):**

```sql
-- Award 100 XP to your user for completing a workout
SELECT award_xp(
  '<your-user-id>'::UUID,
  100,
  'Completed workout',
  'workout_completion',
  NULL
);
```

2. **Check for Level Up:**
- Result will show if you leveled up
- Frontend should show confetti celebration
- XP progress bar should update

3. **View XP History:**

```sql
SELECT * FROM xp_transactions
WHERE user_id = '<your-user-id>'
ORDER BY created_at DESC
LIMIT 10;
```

### Test Achievement System

1. **Check Achievement Progress:**

```sql
SELECT
  ap.*,
  ad.name,
  ad.description,
  ad.tier
FROM achievement_progress ap
JOIN achievement_definitions ad ON ap.achievement_id = ad.id
WHERE ap.user_id = '<your-user-id>';
```

2. **Manually Unlock Achievement (for testing):**

```sql
-- Unlock "First Blood" achievement
UPDATE achievement_progress
SET
  current_value = requirement_value,
  unlocked_at = NOW(),
  is_unlocked = true
WHERE user_id = '<your-user-id>'
AND achievement_id = (
  SELECT id FROM achievement_definitions
  WHERE achievement_key = 'first_blood'
);
```

3. **Trigger Achievement Modal:**
- Refresh the page
- Modal should appear with confetti
- Shows achievement details and rewards

### Test Streak System

1. **Update Streak Manually:**

```sql
-- Update your streak
SELECT update_user_streak('<your-user-id>'::UUID);
```

2. **Check Streak Status:**

```sql
SELECT * FROM user_streaks
WHERE user_id = '<your-user-id>';
```

3. **View in UI:**
- Navigate to Community page
- Streak display should show current/longest streak
- Flame icon intensity changes based on streak length

### Test Live Activity

1. **Create Active Session:**

```sql
-- Simulate you working out
INSERT INTO active_workout_sessions (
  user_id,
  session_type,
  started_at,
  last_heartbeat
) VALUES (
  '<your-user-id>'::UUID,
  'strength',
  NOW(),
  NOW()
);
```

2. **Check Live Counter:**
- Live activity counter should increment
- Shows "X users working out now"
- Auto-refreshes every 10 seconds

3. **End Session:**

```sql
-- Remove your session
DELETE FROM active_workout_sessions
WHERE user_id = '<your-user-id>';
```

### Test Challenge System

1. **Join a Challenge:**

```sql
-- Join an active challenge
INSERT INTO challenge_participants (
  challenge_id,
  user_id,
  username
) VALUES (
  (SELECT id FROM community_challenges WHERE status = 'active' LIMIT 1),
  '<your-user-id>'::UUID,
  '<your-username>'
);
```

2. **Update Challenge Progress:**

```sql
-- Log progress on a challenge
INSERT INTO challenge_progress_logs (
  challenge_id,
  user_id,
  progress_value,
  activity_type
) VALUES (
  (SELECT id FROM community_challenges WHERE status = 'active' LIMIT 1),
  '<your-user-id>'::UUID,
  5,
  'workout_completed'
);
```

3. **View in Browser:**
- Challenge should show your participation
- Progress bar should update
- Participant count increments

## Expected Behavior

### XP Progress Bar
- ✅ Shows current level and XP
- ✅ Progress bar fills based on XP
- ✅ Shimmer animation on bar
- ✅ Shows XP needed for next level
- ✅ Level-up triggers confetti

### Leaderboards
- ✅ Top 3 get podium display
- ✅ Crown for 1st place
- ✅ Medals for 2nd and 3rd
- ✅ User avatars load
- ✅ Level badges show
- ✅ Current user highlighted (if in top 100)

### Achievements
- ✅ Grid layout (3 columns default)
- ✅ Locked achievements are grayed out
- ✅ Unlocked achievements have glow effect
- ✅ Progress bars for in-progress achievements
- ✅ Filter by category and tier works
- ✅ Stats show completed/in-progress/total

### Achievement Unlock Modal
- ✅ Full-screen overlay with backdrop blur
- ✅ Confetti intensity based on tier:
  - Bronze: 2 seconds, 150 particles
  - Silver: 2 seconds, 150 particles
  - Gold: 2 seconds, 150 particles
  - Platinum: 3 seconds, 200 particles
  - Legend: 5 seconds, 300 particles + star burst
- ✅ Rotating badge with shimmer effect
- ✅ Orbiting stars animation
- ✅ Shows XP and coin rewards
- ✅ Tier badge with gradient

### Challenge Browser
- ✅ Grid layout with challenge cards
- ✅ Shows challenge details (title, description, goal)
- ✅ Participant count displays
- ✅ Time remaining shows for active challenges
- ✅ Difficulty indicator (beginner/intermediate/advanced)
- ✅ Featured badge for featured challenges
- ✅ Status filters work (all/active/upcoming/completed)

### Streak Display
- ✅ Flame icon with animation
- ✅ Current streak shows
- ✅ Longest streak shows (if showLongest=true)
- ✅ Color changes based on streak length:
  - 0-6 days: gray
  - 7-29 days: orange
  - 30-99 days: red
  - 100+ days: purple
- ✅ Milestone progress for 7, 30, 100, 365 days

## Troubleshooting

### No achievements showing
**Issue:** Achievement grid is empty
**Fix:** Run this query to create progress entries for your user:

```sql
INSERT INTO achievement_progress (user_id, achievement_id, current_value, requirement_value)
SELECT
  '<your-user-id>'::UUID,
  id,
  0,
  requirement_value
FROM achievement_definitions
ON CONFLICT (user_id, achievement_id) DO NOTHING;
```

### Leaderboards empty
**Issue:** No leaderboard data
**Fix:** Run the seed data script: `supabase/seed-gamification-data.sql`

### No live activity showing
**Issue:** "0 users working out now"
**Fix:** Create active sessions with the seed script or manually:

```sql
INSERT INTO active_workout_sessions (user_id, session_type, started_at, last_heartbeat)
VALUES (gen_random_uuid(), 'strength', NOW(), NOW());
```

### XP not updating
**Issue:** XP bar not changing
**Fix:** Award XP using the function:

```sql
SELECT award_xp(
  '<your-user-id>'::UUID,
  100,
  'Test XP',
  'test_activity',
  NULL
);
```

### TypeScript errors
**Issue:** Import errors or type mismatches
**Fix:**
1. Check `src/types/gamification.types.ts` exists
2. Verify `src/services/gamification.service.ts` exists
3. Ensure all components are in `src/components/gamification/`
4. Check `src/components/gamification/index.ts` exports all components

### Missing dependencies
**Issue:** "Cannot find module 'canvas-confetti'"
**Fix:**
```bash
npm install canvas-confetti
npm install @types/canvas-confetti --save-dev
```

## Performance Testing

### Test Real-time Updates

1. **Open Community page in two browser windows**
2. **In window 1:** Create active session
3. **In window 2:** Live counter should update within 10 seconds
4. **In window 1:** Delete session
5. **In window 2:** Counter should decrement

### Test Leaderboard Updates

1. **Award XP to your user**
2. **Check if rank changes on leaderboard**
3. **Verify ranking function recalculates**

```sql
-- Force leaderboard recalculation
SELECT update_leaderboard_rankings();
```

### Test Load Performance

1. **Open browser DevTools > Network**
2. **Navigate to /community**
3. **Check for:**
   - ✅ All images load progressively
   - ✅ API calls complete within 2 seconds
   - ✅ No duplicate queries
   - ✅ Animations are smooth (60fps)

## Next Steps

After testing Phase 1:

1. **Gather user feedback** on gamification features
2. **Monitor engagement metrics** (achievement unlocks, challenge participation)
3. **Plan Phase 2 features:**
   - Virtual currency & coin shop
   - Battle pass system
   - Live workout sessions with video
   - Team challenges with real-time leaderboards
   - AI-powered workout matching
   - Location-based features

## Support

For issues or questions:
- Check `GAMIFICATION_README.md` for system documentation
- Review database schema in migration file
- Verify RLS policies are enabled
- Check browser console for errors
- Ensure user is authenticated

---

**Built with ❤️ for the FitProve Community**
