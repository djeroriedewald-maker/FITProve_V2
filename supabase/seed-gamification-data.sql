-- =============================================
-- Seed Data for Gamification System
-- Populates test data for challenges, leaderboards, and community activity
-- =============================================

-- Insert sample community challenges
INSERT INTO community_challenges (
  id,
  title,
  description,
  challenge_type,
  category,
  goal_metric,
  goal_value,
  xp_reward,
  coin_reward,
  start_date,
  end_date,
  status,
  difficulty_level,
  is_featured,
  max_participants
) VALUES
  -- Individual Challenges
  (
    gen_random_uuid(),
    '7-Day Consistency Streak',
    'Complete a workout every day for 7 consecutive days. Build the habit that builds champions!',
    'individual',
    'consistency',
    'workout_count',
    7,
    500,
    100,
    NOW(),
    NOW() + INTERVAL '7 days',
    'active',
    'easy',
    true,
    1000
  ),
  (
    gen_random_uuid(),
    '1000 Calorie Burner',
    'Burn 1000 calories in a single workout. Push your limits and feel the burn!',
    'individual',
    'workout_goal',
    'calories_burned',
    1000,
    300,
    75,
    NOW(),
    NOW() + INTERVAL '14 days',
    'active',
    'medium',
    false,
    500
  ),
  (
    gen_random_uuid(),
    '100 Push-Up Challenge',
    'Complete 100 push-ups in a single workout session. Chest day goals!',
    'individual',
    'workout_goal',
    'exercise_reps',
    100,
    250,
    50,
    NOW(),
    NOW() + INTERVAL '7 days',
    'active',
    'medium',
    false,
    NULL
  ),
  (
    gen_random_uuid(),
    'Marathon of Steel',
    'Complete 50 workouts in 30 days. The ultimate consistency challenge!',
    'individual',
    'consistency',
    'workout_count',
    50,
    2000,
    500,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'hard',
    true,
    200
  ),

  -- Team Challenges
  (
    gen_random_uuid(),
    'Team Titan Throwdown',
    'Team up with 4 friends and collectively complete 100 workouts this month!',
    'team',
    'social',
    'workout_count',
    100,
    1500,
    400,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'medium',
    true,
    NULL
  ),
  (
    gen_random_uuid(),
    'Squad Strength Summit',
    'Your team must collectively lift 100,000 lbs in total volume. Let''s get it!',
    'team',
    'workout_goal',
    'volume',
    100000,
    3000,
    750,
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '33 days',
    'upcoming',
    'hard',
    false,
    50
  ),

  -- Community Challenges
  (
    gen_random_uuid(),
    'Global Fitness Revolution',
    'FitProve community goal: Complete 1 MILLION workouts together this month!',
    'community',
    'community',
    'workout_count',
    1000000,
    5000,
    1000,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'medium',
    true,
    NULL
  ),
  (
    gen_random_uuid(),
    'Worldwide Calorie Crusher',
    'Let''s burn 10 BILLION calories together as a community this month!',
    'community',
    'community',
    'calories_burned',
    10000000000,
    5000,
    1000,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'medium',
    true,
    NULL
  ),

  -- Upcoming Challenges
  (
    gen_random_uuid(),
    'New Year, New You 2026',
    'Start the new year right with 30 days of consistent training!',
    'individual',
    'consistency',
    'workout_count',
    30,
    1000,
    250,
    '2026-01-01',
    '2026-01-31',
    'upcoming',
    'easy',
    true,
    NULL
  );

-- Seed some community stats for today
INSERT INTO community_stats (
  stat_date,
  total_workouts_completed,
  total_users_active,
  total_weight_lifted,
  total_calories_burned,
  total_reps_completed,
  total_comments,
  total_likes,
  total_shares,
  new_users,
  active_challenges,
  challenge_completions
) VALUES (
  CURRENT_DATE,
  2847,
  1523,
  2500000,
  1850000,
  125000,
  543,
  2104,
  189,
  89,
  8,
  12
)
ON CONFLICT (stat_date) DO UPDATE SET
  total_workouts_completed = EXCLUDED.total_workouts_completed,
  total_users_active = EXCLUDED.total_users_active,
  total_weight_lifted = EXCLUDED.total_weight_lifted,
  total_calories_burned = EXCLUDED.total_calories_burned,
  total_reps_completed = EXCLUDED.total_reps_completed,
  total_comments = EXCLUDED.total_comments,
  total_likes = EXCLUDED.total_likes,
  total_shares = EXCLUDED.total_shares,
  new_users = EXCLUDED.new_users,
  active_challenges = EXCLUDED.active_challenges,
  challenge_completions = EXCLUDED.challenge_completions;

-- Seed leaderboard snapshots (weekly workouts)
-- Note: Using leaderboard_snapshots since it doesn't require real user IDs
-- For demo purposes, we'll create some sample entries

DO $$
DECLARE
  v_top_users JSONB;
  v_period_start DATE;
  v_period_end DATE;
  v_user_array JSONB[];
BEGIN
  -- Calculate current week period
  v_period_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_period_end := v_period_start + INTERVAL '6 days';

  -- Only seed if snapshot doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM leaderboard_snapshots
    WHERE leaderboard_type = 'weekly_workouts'
    AND period_start = v_period_start
  ) THEN

    -- Build array of top users
    v_user_array := ARRAY[]::JSONB[];

    FOR i IN 1..50 LOOP
      v_user_array := array_append(v_user_array, jsonb_build_object(
        'user_id', gen_random_uuid(),
        'username', 'FitWarrior' || i,
        'avatar_url', 'https://ui-avatars.com/api/?name=FitWarrior' || i || '&background=random',
        'score', 50 - i + (random() * 10)::INTEGER,
        'rank', i,
        'level', (random() * 50 + 1)::INTEGER
      ));
    END LOOP;

    -- Convert array to JSONB
    v_top_users := to_jsonb(v_user_array);

    -- Insert snapshot
    INSERT INTO leaderboard_snapshots (
      leaderboard_type,
      period_start,
      period_end,
      top_users
    ) VALUES (
      'weekly_workouts',
      v_period_start,
      v_period_end,
      v_top_users
    );

  END IF;
END $$;

-- Seed XP leaderboard snapshot
DO $$
DECLARE
  v_top_users JSONB;
  v_period_start DATE;
  v_period_end DATE;
  v_user_array JSONB[];
  v_score INTEGER;
BEGIN
  -- All-time period
  v_period_start := '2024-01-01'::DATE;
  v_period_end := '2099-12-31'::DATE;

  -- Only seed if snapshot doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM leaderboard_snapshots
    WHERE leaderboard_type = 'xp'
    AND period_start = v_period_start
  ) THEN

    -- Build array of top users
    v_user_array := ARRAY[]::JSONB[];

    FOR i IN 1..50 LOOP
      v_score := (100 - i) * 1000 + (random() * 500)::INTEGER;

      v_user_array := array_append(v_user_array, jsonb_build_object(
        'user_id', gen_random_uuid(),
        'username', 'XPMaster' || i,
        'avatar_url', 'https://ui-avatars.com/api/?name=XPMaster' || i || '&background=random',
        'score', v_score,
        'rank', i,
        'level', (v_score / 1000)::INTEGER,
        'total_xp', v_score
      ));
    END LOOP;

    -- Convert array to JSONB
    v_top_users := to_jsonb(v_user_array);

    -- Insert snapshot
    INSERT INTO leaderboard_snapshots (
      leaderboard_type,
      period_start,
      period_end,
      top_users
    ) VALUES (
      'xp',
      v_period_start,
      v_period_end,
      v_top_users
    );

  END IF;
END $$;

-- Seed streak leaderboard snapshot
DO $$
DECLARE
  v_top_users JSONB;
  v_period_start DATE;
  v_period_end DATE;
  v_user_array JSONB[];
  v_score INTEGER;
BEGIN
  -- All-time period
  v_period_start := '2024-01-01'::DATE;
  v_period_end := '2099-12-31'::DATE;

  -- Only seed if snapshot doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM leaderboard_snapshots
    WHERE leaderboard_type = 'streak'
    AND period_start = v_period_start
  ) THEN

    -- Build array of top users
    v_user_array := ARRAY[]::JSONB[];

    FOR i IN 1..50 LOOP
      v_score := 200 - (i * 2) + (random() * 5)::INTEGER;

      v_user_array := array_append(v_user_array, jsonb_build_object(
        'user_id', gen_random_uuid(),
        'username', 'StreakKing' || i,
        'avatar_url', 'https://ui-avatars.com/api/?name=StreakKing' || i || '&background=random',
        'score', v_score,
        'rank', i,
        'current_streak', v_score,
        'longest_streak', v_score + (random() * 50)::INTEGER
      ));
    END LOOP;

    -- Convert array to JSONB
    v_top_users := to_jsonb(v_user_array);

    -- Insert snapshot
    INSERT INTO leaderboard_snapshots (
      leaderboard_type,
      period_start,
      period_end,
      top_users
    ) VALUES (
      'streak',
      v_period_start,
      v_period_end,
      v_top_users
    );

  END IF;
END $$;

-- Create some active workout sessions to show in live activity
-- Note: These would normally be created when users start workouts
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  FOR i IN 1..15 LOOP
    v_user_id := gen_random_uuid();

    INSERT INTO active_workout_sessions (
      user_id,
      session_type,
      started_at,
      last_heartbeat
    ) VALUES (
      v_user_id,
      CASE
        WHEN random() < 0.3 THEN 'strength'
        WHEN random() < 0.6 THEN 'cardio'
        ELSE 'hybrid'
      END,
      NOW() - (random() * INTERVAL '30 minutes'),
      NOW()
    );
  END LOOP;
END $$;

-- Output confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Gamification seed data inserted successfully!';
  RAISE NOTICE '📊 Challenges created: %', (SELECT COUNT(*) FROM community_challenges);
  RAISE NOTICE '🏆 Leaderboard snapshots created: %', (SELECT COUNT(*) FROM leaderboard_snapshots);
  RAISE NOTICE '💪 Active workout sessions: %', (SELECT COUNT(*) FROM active_workout_sessions);
  RAISE NOTICE '📈 Community stats populated for: %', CURRENT_DATE;
END $$;
