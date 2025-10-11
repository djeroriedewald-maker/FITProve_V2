# 🚀 Gamification System - Deployment Checklist

Complete this checklist before launching the gamification features to production.

## ✅ Phase 1: Database Setup

- [ ] **Run migration script**
  ```sql
  -- In Supabase SQL Editor:
  -- Copy/paste: supabase/migrations/0023_community_gamification_phase1.sql
  ```

- [ ] **Verify all tables created**
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name LIKE '%achievement%'
     OR table_name LIKE '%leaderboard%'
     OR table_name LIKE '%challenge%'
     OR table_name LIKE '%streak%'
     OR table_name LIKE '%xp%'
     OR table_name LIKE '%level%';
  ```
  Expected tables:
  - user_levels
  - xp_transactions
  - achievement_definitions
  - achievement_progress
  - user_achievements
  - leaderboards
  - leaderboard_snapshots
  - community_challenges
  - challenge_participants
  - challenge_progress_logs
  - challenge_teams
  - user_streaks
  - user_activity_log
  - community_stats
  - active_workout_sessions

- [ ] **Verify RLS policies enabled**
  ```sql
  SELECT tablename, policyname FROM pg_policies
  WHERE tablename IN (
    'user_levels', 'achievement_progress', 'user_achievements',
    'leaderboards', 'community_challenges', 'challenge_participants',
    'user_streaks', 'active_workout_sessions'
  );
  ```

- [ ] **Verify database functions exist**
  ```sql
  SELECT routine_name FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name IN (
    'award_xp',
    'update_user_streak',
    'update_leaderboard_rankings',
    'calculate_xp_for_level',
    'get_user_rank'
  );
  ```

- [ ] **Run seed data** (optional, for testing)
  ```sql
  -- Copy/paste: supabase/seed-gamification-data.sql
  ```

---

## ✅ Phase 2: Frontend Setup

- [ ] **Install dependencies**
  ```bash
  npm install canvas-confetti
  npm install @types/canvas-confetti --save-dev
  ```

- [ ] **Verify all files exist**
  - [ ] `src/types/gamification.types.ts`
  - [ ] `src/services/gamification.service.ts`
  - [ ] `src/hooks/useGamification.ts`
  - [ ] `src/hooks/useWorkoutSession.ts`
  - [ ] `src/components/gamification/XPProgressBar.tsx`
  - [ ] `src/components/gamification/LiveActivityCounter.tsx`
  - [ ] `src/components/gamification/Leaderboard.tsx`
  - [ ] `src/components/gamification/AchievementGrid.tsx`
  - [ ] `src/components/gamification/AchievementUnlockModal.tsx`
  - [ ] `src/components/gamification/ChallengeBrowser.tsx`
  - [ ] `src/components/gamification/StreakDisplay.tsx`
  - [ ] `src/components/gamification/index.ts`

- [ ] **Build project successfully**
  ```bash
  npm run build
  ```

- [ ] **Check for TypeScript errors**
  ```bash
  npx tsc --noEmit
  ```

---

## ✅ Phase 3: Integration Testing

### Test Community Page

- [ ] **Navigate to `/community`**
  - [ ] Hero section loads with image
  - [ ] Live activity ticker shows (even if "0 users")
  - [ ] Navigation tabs render correctly
  - [ ] All 4 tabs switch properly (Overview, Leaderboards, Achievements, Challenges)

- [ ] **Test if logged in**
  - [ ] XP progress bar appears
  - [ ] Streak display appears
  - [ ] Shows correct user level and XP

- [ ] **Test if NOT logged in**
  - [ ] XP bar and streak hidden
  - [ ] Other components still work (leaderboards, challenges)

### Test XP System

- [ ] **Create user level entry**
  ```sql
  -- Should auto-create on first XP award, but can manually create:
  INSERT INTO user_levels (user_id, current_level, current_xp, total_xp)
  VALUES ('<your-user-id>'::UUID, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  ```

- [ ] **Award test XP**
  ```sql
  SELECT award_xp(
    '<your-user-id>'::UUID,
    100,
    'Test XP',
    'test_activity',
    NULL
  );
  ```

- [ ] **Verify XP bar updates**
  - [ ] Refresh page
  - [ ] XP value increased
  - [ ] Progress bar filled accordingly

- [ ] **Test level-up**
  ```sql
  -- Award enough XP to level up (Level 1→2 = 283 XP)
  SELECT award_xp('<your-user-id>'::UUID, 300, 'Level up test', 'test_activity', NULL);
  ```
  - [ ] Result shows `level_up: true`
  - [ ] Confetti animation triggers (if implemented in UI)

### Test Achievements

- [ ] **Initialize achievement progress**
  ```sql
  -- Run this to create progress entries for all achievements
  INSERT INTO achievement_progress (user_id, achievement_id, current_value, requirement_value)
  SELECT
    '<your-user-id>'::UUID,
    id,
    0,
    requirement_value
  FROM achievement_definitions
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
  ```

- [ ] **View achievements tab**
  - [ ] Achievement grid loads
  - [ ] Shows locked and unlocked achievements
  - [ ] Progress bars visible
  - [ ] Filters work (category, tier, status)

- [ ] **Unlock test achievement**
  ```sql
  -- Unlock "First Blood" achievement
  UPDATE achievement_progress
  SET
    current_value = requirement_value,
    unlocked_at = NOW(),
    is_unlocked = true
  WHERE user_id = '<your-user-id>'
  AND achievement_id = (
    SELECT id FROM achievement_definitions WHERE achievement_key = 'first_blood'
  );
  ```
  - [ ] Achievement shows as unlocked in grid
  - [ ] Glow effect appears on unlocked achievement

- [ ] **Test unlock modal**
  - [ ] Modal appears with animation
  - [ ] Confetti triggers
  - [ ] Shows correct tier and rewards
  - [ ] Close button works

### Test Leaderboards

- [ ] **View leaderboards tab**
  - [ ] Weekly workouts leaderboard loads
  - [ ] XP leaderboard loads
  - [ ] Streak leaderboard loads

- [ ] **Check leaderboard display**
  - [ ] Top 3 have podium display
  - [ ] Crown on 1st place
  - [ ] Medals on 2nd/3rd place
  - [ ] User avatars load
  - [ ] Rank numbers correct

- [ ] **Test filters** (if implemented)
  - [ ] Global scope works
  - [ ] Friends scope works
  - [ ] Local scope works

### Test Challenges

- [ ] **View challenges tab**
  - [ ] Challenge cards load
  - [ ] Shows active challenges
  - [ ] Shows upcoming challenges
  - [ ] Filters work

- [ ] **Check challenge details**
  - [ ] Title and description display
  - [ ] Goal metric shows (e.g., "50 workouts")
  - [ ] Participant count displays
  - [ ] Rewards show (XP + coins)
  - [ ] Difficulty badge shows

- [ ] **Join a challenge**
  ```sql
  INSERT INTO challenge_participants (challenge_id, user_id, username)
  VALUES (
    (SELECT id FROM community_challenges WHERE status = 'active' LIMIT 1),
    '<your-user-id>'::UUID,
    '<your-username>'
  );
  ```
  - [ ] Participant count increases
  - [ ] Shows you're participating

### Test Streaks

- [ ] **Initialize streak**
  ```sql
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_workout_date)
  VALUES ('<your-user-id>'::UUID, 1, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  ```

- [ ] **View streak display**
  - [ ] Current streak shows
  - [ ] Longest streak shows
  - [ ] Flame icon animates
  - [ ] Color changes based on streak length

- [ ] **Update streak**
  ```sql
  SELECT update_user_streak('<your-user-id>'::UUID);
  ```
  - [ ] Result shows new streak value
  - [ ] Milestone XP awarded for 7-day, 30-day, etc.

### Test Live Activity

- [ ] **Create active session**
  ```sql
  INSERT INTO active_workout_sessions (user_id, session_type, started_at, last_heartbeat)
  VALUES ('<your-user-id>'::UUID, 'strength', NOW(), NOW());
  ```

- [ ] **Check live counter**
  - [ ] "X users working out now" updates
  - [ ] Pulse animation shows
  - [ ] Auto-refreshes every 10 seconds

- [ ] **End session**
  ```sql
  DELETE FROM active_workout_sessions WHERE user_id = '<your-user-id>';
  ```
  - [ ] Counter decrements

---

## ✅ Phase 4: Workflow Integration

### Integrate with Workout Completion

- [ ] **Import hooks in WorkoutSummaryPage**
  ```typescript
  import { useGamification } from '../hooks/useGamification';
  import { useWorkoutSession } from '../hooks/useWorkoutSession';
  ```

- [ ] **Award XP on workout complete**
  ```typescript
  await awardXP(150, 'Completed workout', 'workout_completion', workoutId);
  ```

- [ ] **Update streak**
  ```typescript
  await updateStreak();
  ```

- [ ] **Check achievements**
  ```typescript
  await checkAchievements('workout_count', totalWorkouts + 1);
  ```

- [ ] **Test end-to-end flow**
  - [ ] Complete a workout
  - [ ] XP is awarded
  - [ ] Streak updates
  - [ ] Achievements unlock (if thresholds met)
  - [ ] Celebrations show

### Integrate Live Sessions

- [ ] **Start session on workout start**
  ```typescript
  await startSession('strength'); // or 'cardio', 'hybrid'
  ```

- [ ] **Send heartbeats** (automatic every 30s)

- [ ] **End session on workout end**
  ```typescript
  await endSession();
  ```

- [ ] **Test live tracking**
  - [ ] Start workout → appears in live counter
  - [ ] Other users see you working out
  - [ ] End workout → removed from live counter

---

## ✅ Phase 5: Performance & Security

### Database Performance

- [ ] **Check query performance**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM leaderboards
  WHERE leaderboard_type = 'weekly_workouts'
  ORDER BY rank ASC
  LIMIT 100;
  ```

- [ ] **Add indexes if needed**
  ```sql
  -- Already included in migration, verify they exist:
  SELECT indexname FROM pg_indexes
  WHERE tablename = 'leaderboards';
  ```

- [ ] **Test with 1000+ leaderboard entries**
  - [ ] Query completes in < 100ms
  - [ ] UI renders smoothly

### Security Checks

- [ ] **Verify RLS policies**
  - [ ] Users can only update their own data
  - [ ] Users can read public leaderboards
  - [ ] Users can read all achievements
  - [ ] Users can only see their own progress

- [ ] **Test unauthorized access**
  - [ ] Try to update another user's XP → should fail
  - [ ] Try to delete another user's achievements → should fail

- [ ] **Check API endpoints**
  - [ ] Service functions use authenticated user ID
  - [ ] No hardcoded user IDs in production code

### Error Handling

- [ ] **Test offline behavior**
  - [ ] Disconnect internet
  - [ ] Try to award XP → should fail gracefully
  - [ ] Error messages shown to user
  - [ ] No app crashes

- [ ] **Test invalid data**
  - [ ] Award negative XP → should reject
  - [ ] Award XP to non-existent user → should fail gracefully

---

## ✅ Phase 6: UI/UX Polish

### Animations

- [ ] **Confetti effects work**
  - [ ] Achievement unlocks trigger confetti
  - [ ] Level-ups trigger confetti
  - [ ] Different intensities for different tiers

- [ ] **Transitions smooth**
  - [ ] Tab switches animate
  - [ ] Cards hover effects work
  - [ ] Progress bars animate

- [ ] **Loading states**
  - [ ] Skeleton loaders show while data loads
  - [ ] Spinners for async actions
  - [ ] No layout shifts

### Responsive Design

- [ ] **Test mobile (< 768px)**
  - [ ] Community page layout stacks properly
  - [ ] Tabs scroll horizontally
  - [ ] Cards are readable
  - [ ] Modals fit screen

- [ ] **Test tablet (768px - 1024px)**
  - [ ] Grid layouts adjust
  - [ ] 2-column layouts work

- [ ] **Test desktop (> 1024px)**
  - [ ] 3-column layouts work
  - [ ] Leaderboards have good width
  - [ ] Modals centered

### Accessibility

- [ ] **Keyboard navigation**
  - [ ] Tabs navigable with keyboard
  - [ ] Modals closable with ESC
  - [ ] Focus indicators visible

- [ ] **Screen reader support**
  - [ ] Images have alt text
  - [ ] Buttons have aria-labels
  - [ ] Progress bars have aria values

---

## ✅ Phase 7: Documentation

- [ ] **README files complete**
  - [ ] `GAMIFICATION_README.md` exists
  - [ ] `GAMIFICATION_TESTING.md` exists
  - [ ] `INTEGRATION_EXAMPLE.md` exists
  - [ ] `DEPLOYMENT_CHECKLIST.md` exists (this file)

- [ ] **Code comments**
  - [ ] All components have JSDoc comments
  - [ ] Complex functions explained
  - [ ] Type definitions documented

- [ ] **Update main README**
  - [ ] Add gamification section
  - [ ] Link to gamification docs
  - [ ] Mention Phase 1 completion

---

## ✅ Phase 8: Production Deployment

### Pre-deployment

- [ ] **Run full test suite**
  ```bash
  npm test
  ```

- [ ] **Build production bundle**
  ```bash
  npm run build
  ```

- [ ] **Check bundle size**
  - [ ] No significant increase (canvas-confetti is small)
  - [ ] Code splitting works

- [ ] **Run lighthouse audit**
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90

### Deployment

- [ ] **Deploy database migration**
  - [ ] Run migration in production Supabase
  - [ ] Verify all tables created
  - [ ] Verify functions exist
  - [ ] Enable RLS policies

- [ ] **Deploy frontend**
  - [ ] Push code to main branch
  - [ ] Trigger production build
  - [ ] Verify deployment successful

- [ ] **Smoke test production**
  - [ ] Visit `/community` page
  - [ ] Check console for errors
  - [ ] Test one XP award
  - [ ] Test one achievement unlock

### Post-deployment

- [ ] **Monitor errors**
  - [ ] Check Sentry/error tracking
  - [ ] Watch for Supabase errors
  - [ ] Monitor API response times

- [ ] **Track metrics**
  - [ ] Achievement unlock rate
  - [ ] Challenge participation rate
  - [ ] Average XP per user
  - [ ] Leaderboard engagement

- [ ] **Gather user feedback**
  - [ ] Create feedback form
  - [ ] Monitor support requests
  - [ ] Track feature requests

---

## 🎉 Phase 1 Complete!

Once all items are checked, Phase 1 of the gamification system is complete and live!

### Next Steps (Phase 2+)

- [ ] Virtual currency & coin shop
- [ ] Battle pass system
- [ ] Live workout sessions with video streaming
- [ ] Team challenges with real-time leaderboards
- [ ] AI-powered workout buddy matching
- [ ] Location-based features (gym check-ins)
- [ ] Creator marketplace
- [ ] Expert network integration

---

## 📊 Success Metrics

Track these KPIs to measure gamification success:

- **Engagement**
  - Daily Active Users (DAU) increase
  - Average session duration increase
  - Workout completion rate increase

- **Retention**
  - 7-day retention rate
  - 30-day retention rate
  - Streak completion rate

- **Social**
  - Challenge participation rate
  - Leaderboard views
  - Achievement unlock rate

- **Monetization** (if applicable)
  - Premium conversion rate
  - Coin shop purchases
  - Battle pass sales

---

**Good luck with your deployment! 🚀**
