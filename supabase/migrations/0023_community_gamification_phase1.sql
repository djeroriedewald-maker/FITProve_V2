-- ============================================================
-- MIGRATION: COMMUNITY GAMIFICATION PHASE 1
-- Description: Leaderboards, Achievements, XP System, Challenges
-- Version: 0023
-- Date: 2025-01-10
-- ============================================================
-- This migration transforms FitProve into a world-class
-- gamified fitness community with competitions, achievements,
-- and real-time engagement features.
-- ============================================================

-- ============================================
-- 1. USER LEVEL & XP SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_level INTEGER DEFAULT 1 NOT NULL,
  current_xp INTEGER DEFAULT 0 NOT NULL,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  level_title TEXT DEFAULT 'Beginner' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT positive_level CHECK (current_level >= 1),
  CONSTRAINT positive_xp CHECK (current_xp >= 0 AND total_xp >= 0)
);

-- XP Transaction History
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'workout_complete', 'challenge_win', 'share', etc.
  related_entity_id UUID, -- workout_id, challenge_id, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_levels_user ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_levels_total_xp ON user_levels(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON xp_transactions(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view user levels" ON user_levels;
CREATE POLICY "Anyone can view user levels" ON user_levels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own XP transactions" ON xp_transactions;
CREATE POLICY "Users can view own XP transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 2. ACHIEVEMENTS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS achievement_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key TEXT UNIQUE NOT NULL, -- 'first_workout', 'streak_7', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'workout', 'social', 'consistency', 'pr', 'specialized'
  tier TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum', 'legend'
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL, -- 'workout_count', 'streak_days', 'social_engagement', etc.
  requirement_value INTEGER NOT NULL,
  is_secret BOOLEAN DEFAULT false,
  is_limited_edition BOOLEAN DEFAULT false,
  available_until TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievement_definitions(id) ON DELETE CASCADE,
  progress_current INTEGER DEFAULT 0 NOT NULL,
  progress_total INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  completed_at TIMESTAMPTZ,
  is_displayed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_achievement_defs_category ON achievement_definitions(category);
CREATE INDEX IF NOT EXISTS idx_achievement_defs_tier ON achievement_definitions(tier);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(user_id, is_completed, completed_at DESC);

-- RLS Policies
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view achievement definitions" ON achievement_definitions;
CREATE POLICY "Anyone can view achievement definitions" ON achievement_definitions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view user achievements" ON user_achievements;
CREATE POLICY "Anyone can view user achievements" ON user_achievements
  FOR SELECT USING (true);

-- ============================================
-- 3. LEADERBOARD SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL, -- 'weekly_workouts', 'monthly_volume', 'streak', 'xp'
  score BIGINT NOT NULL DEFAULT 0,
  rank INTEGER,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB, -- additional stats like total_weight, total_reps, etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, leaderboard_type, period_start)
);

-- Global Leaderboard Snapshots (for historical data)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  top_users JSONB NOT NULL, -- Array of {user_id, score, rank, username, avatar}
  total_participants INTEGER DEFAULT 0,
  snapshot_taken_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(leaderboard_type, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_period ON leaderboards(leaderboard_type, period_start, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user ON leaderboards(user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(leaderboard_type, period_start, rank ASC);

-- RLS Policies
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view leaderboards" ON leaderboards;
CREATE POLICY "Anyone can view leaderboards" ON leaderboards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view leaderboard snapshots" ON leaderboard_snapshots;
CREATE POLICY "Anyone can view leaderboard snapshots" ON leaderboard_snapshots FOR SELECT USING (true);

-- ============================================
-- 4. CHALLENGE SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT DEFAULT 'individual', -- 'individual', 'team', 'community'
  category TEXT NOT NULL, -- 'endurance', 'strength', 'volume', 'consistency', 'specialized'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,

  -- Goal Configuration
  goal_metric TEXT NOT NULL, -- 'total_workouts', 'total_reps', 'total_weight', 'streak_days', 'specific_workout'
  goal_value NUMERIC NOT NULL,
  goal_unit TEXT, -- 'workouts', 'reps', 'lbs', 'kg', 'days'

  -- Participation
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER,

  -- Rewards
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  entry_fee INTEGER DEFAULT 0, -- in coins
  prize_pool NUMERIC DEFAULT 0, -- in real currency for sponsored challenges
  rewards JSONB, -- Structured rewards: {first: {}, second: {}, third: {}}

  -- Metadata
  difficulty_level TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'extreme'
  requirements JSONB, -- Prerequisites like min_level, min_workouts, etc.
  rules JSONB, -- Specific rules for the challenge
  banner_image_url TEXT,
  sponsored_by TEXT,

  -- Status
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed', 'cancelled'
  is_featured BOOLEAN DEFAULT false,

  -- Related Workout (if challenge is about a specific workout)
  related_workout_id UUID REFERENCES custom_workouts(id) ON DELETE SET NULL,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT positive_goal CHECK (goal_value > 0)
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Progress Tracking
  current_progress NUMERIC DEFAULT 0 NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  rank INTEGER,

  -- Team (for team challenges)
  team_id UUID,

  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(challenge_id, user_id)
);

-- Challenge Progress Logs (detailed tracking)
CREATE TABLE IF NOT EXISTS challenge_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES challenge_participants(id) ON DELETE CASCADE,
  progress_amount NUMERIC NOT NULL,
  progress_note TEXT,
  workout_id UUID REFERENCES custom_workouts(id) ON DELETE SET NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Team Challenges
CREATE TABLE IF NOT EXISTS challenge_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  team_captain_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_image_url TEXT,
  team_motto TEXT,

  -- Stats
  member_count INTEGER DEFAULT 1,
  total_score NUMERIC DEFAULT 0,
  rank INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(challenge_id, team_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenges_status_dates ON community_challenges(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON community_challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_featured ON community_challenges(is_featured, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id, rank ASC);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id, joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_participant ON challenge_progress_logs(participant_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_teams_challenge ON challenge_teams(challenge_id, rank ASC);

-- RLS Policies
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view challenges" ON community_challenges;
CREATE POLICY "Anyone can view challenges" ON community_challenges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view challenge participants" ON challenge_participants;
CREATE POLICY "Anyone can view challenge participants" ON challenge_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join challenges" ON challenge_participants;
CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participation" ON challenge_participants;
CREATE POLICY "Users can update own participation" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view progress logs" ON challenge_progress_logs;
CREATE POLICY "Anyone can view progress logs" ON challenge_progress_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view challenge teams" ON challenge_teams;
CREATE POLICY "Anyone can view challenge teams" ON challenge_teams FOR SELECT USING (true);

-- ============================================
-- 5. LIVE WORKOUT SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS live_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES custom_workouts(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  scheduled_start TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  estimated_duration INTEGER, -- in minutes

  -- Participation
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER,

  -- Features
  is_live BOOLEAN DEFAULT false,
  chat_enabled BOOLEAN DEFAULT true,
  video_url TEXT, -- for hosts with video streaming

  -- Status
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed', 'cancelled'

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT valid_participant_limit CHECK (max_participants IS NULL OR max_participants > 0)
);

CREATE TABLE IF NOT EXISTS live_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  left_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Progress tracking during session
  current_exercise INTEGER DEFAULT 0,
  completed_exercises INTEGER DEFAULT 0,

  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS live_session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'system', 'cheer'

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT message_length CHECK (char_length(message) <= 500)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_workout_sessions(status, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_live_sessions_host ON live_workout_sessions(host_id, scheduled_start DESC);
CREATE INDEX IF NOT EXISTS idx_live_participants_session ON live_session_participants(session_id, is_active);
CREATE INDEX IF NOT EXISTS idx_live_messages_session ON live_session_messages(session_id, created_at DESC);

-- RLS Policies
ALTER TABLE live_workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_session_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view live sessions" ON live_workout_sessions;
CREATE POLICY "Anyone can view live sessions" ON live_workout_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hosts can create sessions" ON live_workout_sessions;
CREATE POLICY "Hosts can create sessions" ON live_workout_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Hosts can update own sessions" ON live_workout_sessions;
CREATE POLICY "Hosts can update own sessions" ON live_workout_sessions
  FOR UPDATE USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Anyone can view session participants" ON live_session_participants;
CREATE POLICY "Anyone can view session participants" ON live_session_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join sessions" ON live_session_participants;
CREATE POLICY "Users can join sessions" ON live_session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view session messages" ON live_session_messages;
CREATE POLICY "Anyone can view session messages" ON live_session_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants can send messages" ON live_session_messages;
CREATE POLICY "Participants can send messages" ON live_session_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM live_session_participants
      WHERE session_id = live_session_messages.session_id
      AND user_id = auth.uid()
      AND is_active = true
    )
  );

-- ============================================
-- 6. USER ACTIVITY TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  activity_type TEXT NOT NULL, -- 'workout_complete', 'challenge_join', 'comment', 'like', 'share'
  activity_data JSONB, -- Flexible data storage

  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Streak Tracking
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT positive_streak CHECK (current_streak >= 0 AND longest_streak >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON user_activity_log(activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak DESC);

-- RLS Policies
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_log;
CREATE POLICY "Users can view own activity" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view streaks" ON user_streaks;
CREATE POLICY "Anyone can view streaks" ON user_streaks FOR SELECT USING (true);

-- ============================================
-- 7. COMMUNITY STATS & REAL-TIME DATA
-- ============================================

CREATE TABLE IF NOT EXISTS community_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,

  -- Daily Totals
  total_workouts_completed INTEGER DEFAULT 0,
  total_users_active INTEGER DEFAULT 0,
  total_weight_lifted NUMERIC DEFAULT 0,
  total_calories_burned NUMERIC DEFAULT 0,
  total_reps_completed BIGINT DEFAULT 0,

  -- Engagement
  total_comments INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,

  -- Challenges
  active_challenges INTEGER DEFAULT 0,
  challenge_completions INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Real-time Active Users (for "X people working out now")
CREATE TABLE IF NOT EXISTS active_workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES custom_workouts(id) ON DELETE SET NULL,

  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_heartbeat TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true,

  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_stats_date ON community_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_active ON active_workout_sessions(is_active, last_heartbeat DESC);

-- RLS Policies
ALTER TABLE community_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view community stats" ON community_stats;
CREATE POLICY "Anyone can view community stats" ON community_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view active sessions count" ON active_workout_sessions;
CREATE POLICY "Anyone can view active sessions count" ON active_workout_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own session" ON active_workout_sessions;
CREATE POLICY "Users can manage own session" ON active_workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Calculate XP needed for next level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Formula: 100 * level^1.5 (gets progressively harder)
  RETURN FLOOR(100 * POWER(level, 1.5))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Award XP to user
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason TEXT,
  p_activity_type TEXT,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_level INTEGER;
  v_current_xp INTEGER;
  v_total_xp INTEGER;
  v_new_xp INTEGER;
  v_new_total_xp INTEGER;
  v_xp_needed INTEGER;
  v_level_up BOOLEAN := false;
  v_new_level INTEGER;
  v_result JSONB;
BEGIN
  -- Get current level data
  SELECT current_level, current_xp, total_xp
  INTO v_current_level, v_current_xp, v_total_xp
  FROM user_levels
  WHERE user_id = p_user_id;

  -- Initialize if user doesn't exist
  IF v_current_level IS NULL THEN
    INSERT INTO user_levels (user_id, current_level, current_xp, total_xp)
    VALUES (p_user_id, 1, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_current_level := 1;
    v_current_xp := 0;
    v_total_xp := 0;
  END IF;

  -- Add XP
  v_new_xp := v_current_xp + p_xp_amount;
  v_new_total_xp := v_total_xp + p_xp_amount;
  v_new_level := v_current_level;

  -- Check for level up
  v_xp_needed := calculate_xp_for_level(v_current_level);

  WHILE v_new_xp >= v_xp_needed LOOP
    v_new_xp := v_new_xp - v_xp_needed;
    v_new_level := v_new_level + 1;
    v_level_up := true;
    v_xp_needed := calculate_xp_for_level(v_new_level);
  END LOOP;

  -- Update user level
  UPDATE user_levels
  SET
    current_level = v_new_level,
    current_xp = v_new_xp,
    total_xp = v_new_total_xp,
    level_title = CASE
      WHEN v_new_level >= 50 THEN 'Legend'
      WHEN v_new_level >= 30 THEN 'Elite'
      WHEN v_new_level >= 20 THEN 'Champion'
      WHEN v_new_level >= 10 THEN 'Warrior'
      ELSE 'Beginner'
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO xp_transactions (user_id, xp_amount, reason, activity_type, related_entity_id)
  VALUES (p_user_id, p_xp_amount, p_reason, p_activity_type, p_related_entity_id);

  -- Return result
  v_result := jsonb_build_object(
    'xp_awarded', p_xp_amount,
    'new_xp', v_new_xp,
    'new_total_xp', v_new_total_xp,
    'level_up', v_level_up,
    'old_level', v_current_level,
    'new_level', v_new_level
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_new_streak INTEGER;
  v_streak_broken BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Get current streak
  SELECT current_streak, longest_streak, last_activity_date
  INTO v_current_streak, v_longest_streak, v_last_activity
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Initialize if doesn't exist
  IF v_current_streak IS NULL THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, v_today)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN jsonb_build_object(
      'current_streak', 1,
      'longest_streak', 1,
      'streak_extended', true,
      'streak_broken', false
    );
  END IF;

  -- Check if already logged today
  IF v_last_activity = v_today THEN
    RETURN jsonb_build_object(
      'current_streak', v_current_streak,
      'longest_streak', v_longest_streak,
      'already_logged_today', true
    );
  END IF;

  -- Check if streak continues (yesterday or today)
  IF v_last_activity = v_today - 1 THEN
    v_new_streak := v_current_streak + 1;
  ELSE
    v_new_streak := 1;
    v_streak_broken := true;
  END IF;

  -- Update longest streak if needed
  IF v_new_streak > v_longest_streak THEN
    v_longest_streak := v_new_streak;
  END IF;

  -- Update streak
  UPDATE user_streaks
  SET
    current_streak = v_new_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Award bonus XP for streak milestones
  IF v_new_streak IN (7, 30, 100, 365) THEN
    PERFORM award_xp(
      p_user_id,
      v_new_streak * 10,
      format('Achieved %s-day streak!', v_new_streak),
      'streak_milestone',
      NULL
    );
  END IF;

  v_result := jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', v_longest_streak,
    'streak_extended', NOT v_streak_broken,
    'streak_broken', v_streak_broken
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Update leaderboard rankings
CREATE OR REPLACE FUNCTION update_leaderboard_rankings(
  p_leaderboard_type TEXT,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Update ranks based on scores
  WITH ranked_users AS (
    SELECT
      id,
      RANK() OVER (ORDER BY score DESC) as new_rank
    FROM leaderboards
    WHERE leaderboard_type = p_leaderboard_type
    AND period_start = p_period_start
    AND period_end = p_period_end
  )
  UPDATE leaderboards l
  SET
    rank = r.new_rank,
    updated_at = NOW()
  FROM ranked_users r
  WHERE l.id = r.id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGERS
-- ============================================

-- Auto-update challenge participant count
CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_challenges
    SET participant_count = participant_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_challenges
    SET participant_count = GREATEST(0, participant_count - 1)
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS challenge_participant_count_trigger ON challenge_participants;
CREATE TRIGGER challenge_participant_count_trigger
  AFTER INSERT OR DELETE ON challenge_participants
  FOR EACH ROW EXECUTE FUNCTION update_challenge_participant_count();

-- Auto-update live session participant count
CREATE OR REPLACE FUNCTION update_live_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE live_workout_sessions
    SET participant_count = participant_count + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE live_workout_sessions
    SET participant_count = GREATEST(0, participant_count - 1)
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS live_session_participant_count_trigger ON live_session_participants;
CREATE TRIGGER live_session_participant_count_trigger
  AFTER INSERT OR DELETE ON live_session_participants
  FOR EACH ROW EXECUTE FUNCTION update_live_session_participant_count();

-- ============================================
-- 10. SEED INITIAL ACHIEVEMENT DEFINITIONS
-- ============================================

INSERT INTO achievement_definitions (achievement_key, name, description, category, tier, xp_reward, coin_reward, requirement_type, requirement_value, sort_order)
VALUES
  -- Workout Milestones
  ('first_workout', 'First Steps', 'Complete your first workout', 'workout', 'bronze', 50, 25, 'workout_count', 1, 1),
  ('workout_10', 'Getting Started', 'Complete 10 workouts', 'workout', 'bronze', 100, 50, 'workout_count', 10, 2),
  ('workout_50', 'Committed', 'Complete 50 workouts', 'workout', 'silver', 250, 150, 'workout_count', 50, 3),
  ('workout_100', 'Century Club', 'Complete 100 workouts', 'workout', 'gold', 500, 300, 'workout_count', 100, 4),
  ('workout_500', 'Unstoppable', 'Complete 500 workouts', 'workout', 'platinum', 2000, 1000, 'workout_count', 500, 5),
  ('workout_1000', 'Legend', 'Complete 1000 workouts', 'workout', 'legend', 5000, 2500, 'workout_count', 1000, 6),

  -- Consistency Streaks
  ('streak_7', 'Week Warrior', '7-day workout streak', 'consistency', 'bronze', 100, 75, 'streak_days', 7, 10),
  ('streak_30', 'Monthly Master', '30-day workout streak', 'consistency', 'silver', 500, 300, 'streak_days', 30, 11),
  ('streak_100', 'Triple Digit', '100-day workout streak', 'consistency', 'gold', 1500, 800, 'streak_days', 100, 12),
  ('streak_365', 'Year of Fire', '365-day workout streak', 'consistency', 'legend', 10000, 5000, 'streak_days', 365, 13),

  -- Social Achievements
  ('first_comment', 'Community Voice', 'Leave your first comment', 'social', 'bronze', 25, 15, 'comment_count', 1, 20),
  ('likes_100', 'Supporting', 'Give 100 likes to others', 'social', 'bronze', 100, 50, 'likes_given', 100, 21),
  ('followers_10', 'Rising Star', 'Gain 10 followers', 'social', 'silver', 200, 100, 'follower_count', 10, 22),
  ('followers_100', 'Influencer', 'Gain 100 followers', 'social', 'gold', 1000, 500, 'follower_count', 100, 23),
  ('followers_1000', 'Celebrity', 'Gain 1000 followers', 'social', 'platinum', 5000, 2500, 'follower_count', 1000, 24),

  -- Creator Achievements
  ('created_first', 'Creator', 'Create your first public workout', 'creator', 'bronze', 100, 75, 'workouts_created', 1, 30),
  ('workout_used_10', 'Helpful', '10 people used your workout', 'creator', 'silver', 200, 150, 'workout_uses', 10, 31),
  ('workout_used_100', 'Popular Creator', '100 people used your workout', 'creator', 'gold', 500, 400, 'workout_uses', 100, 32),
  ('workout_used_1000', 'Elite Creator', '1000 people used your workout', 'creator', 'platinum', 2000, 1500, 'workout_uses', 1000, 33),

  -- Challenge Achievements
  ('challenge_first', 'Challenger', 'Complete your first challenge', 'challenge', 'bronze', 100, 50, 'challenges_completed', 1, 40),
  ('challenge_10', 'Challenge Seeker', 'Complete 10 challenges', 'challenge', 'silver', 500, 300, 'challenges_completed', 10, 41),
  ('challenge_winner', 'Champion', 'Win a community challenge', 'challenge', 'gold', 1000, 750, 'challenges_won', 1, 42)
ON CONFLICT (achievement_key) DO NOTHING;

-- ============================================
-- 11. USEFUL VIEWS
-- ============================================

-- Global Leaderboard View (Current Week)
CREATE OR REPLACE VIEW current_weekly_leaderboard AS
SELECT
  l.*,
  p.display_name,
  p.username,
  p.avatar_url,
  ul.current_level
FROM leaderboards l
LEFT JOIN profiles p ON l.user_id = p.id
LEFT JOIN user_levels ul ON l.user_id = ul.user_id
WHERE l.leaderboard_type = 'weekly_workouts'
AND l.period_start = date_trunc('week', CURRENT_DATE)::DATE
ORDER BY l.rank ASC NULLS LAST, l.score DESC
LIMIT 100;

-- Top Achievers View
CREATE OR REPLACE VIEW top_achievers AS
SELECT
  ul.user_id,
  p.display_name,
  p.username,
  p.avatar_url,
  ul.current_level,
  ul.total_xp,
  us.current_streak,
  us.longest_streak,
  COUNT(ua.id) FILTER (WHERE ua.is_completed) as total_achievements,
  COUNT(ua.id) FILTER (WHERE ua.is_completed AND ad.tier = 'legend') as legend_achievements
FROM user_levels ul
LEFT JOIN profiles p ON ul.user_id = p.id
LEFT JOIN user_streaks us ON ul.user_id = us.user_id
LEFT JOIN user_achievements ua ON ul.user_id = ua.user_id
LEFT JOIN achievement_definitions ad ON ua.achievement_id = ad.id
GROUP BY ul.user_id, p.display_name, p.username, p.avatar_url, ul.current_level, ul.total_xp, us.current_streak, us.longest_streak
ORDER BY ul.total_xp DESC, ul.current_level DESC
LIMIT 100;

-- Active Challenges View
CREATE OR REPLACE VIEW active_challenges_view AS
SELECT
  cc.*,
  p.display_name as creator_name,
  p.username as creator_username,
  p.avatar_url as creator_avatar
FROM community_challenges cc
LEFT JOIN profiles p ON cc.created_by = p.id
WHERE cc.status = 'active'
AND cc.start_date <= NOW()
AND cc.end_date >= NOW()
ORDER BY cc.is_featured DESC, cc.participant_count DESC;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Phase 1 gamification features are ready!
-- Next: Build TypeScript types and service layers
-- ============================================
