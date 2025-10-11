/**
 * Gamification System Type Definitions
 * Includes: XP/Levels, Achievements, Leaderboards, Challenges, Live Sessions
 */

// ============================================
// USER LEVEL & XP SYSTEM
// ============================================

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
  level_title: 'Beginner' | 'Warrior' | 'Champion' | 'Elite' | 'Legend';
  created_at: string;
  updated_at: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  xp_amount: number;
  reason: string;
  activity_type: XPActivityType;
  related_entity_id?: string;
  created_at: string;
}

export type XPActivityType =
  | 'workout_complete'
  | 'challenge_win'
  | 'challenge_complete'
  | 'share_workout'
  | 'receive_like'
  | 'create_workout'
  | 'achieve_pr'
  | 'streak_bonus'
  | 'comment'
  | 'rate_workout'
  | 'help_beginner';

export interface XPRewardConfig {
  COMPLETE_WORKOUT: number;
  COMPLETE_CHALLENGE: number;
  SHARE_WORKOUT: number;
  RECEIVE_WORKOUT_LIKE: number;
  CREATE_PUBLIC_WORKOUT: number;
  ACHIEVE_PR: number;
  CONSECUTIVE_DAY_BONUS: number;
  COMMENT_ON_WORKOUT: number;
  RATE_WORKOUT: number;
  HELP_BEGINNER: number;
}

export interface AwardXPResult {
  xp_awarded: number;
  new_xp: number;
  new_total_xp: number;
  level_up: boolean;
  old_level: number;
  new_level: number;
}

// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

export type AchievementCategory =
  | 'workout'
  | 'social'
  | 'consistency'
  | 'pr'
  | 'specialized'
  | 'creator'
  | 'challenge';

export type AchievementTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'legend';

export type RequirementType =
  | 'workout_count'
  | 'streak_days'
  | 'social_engagement'
  | 'comment_count'
  | 'likes_given'
  | 'follower_count'
  | 'workouts_created'
  | 'workout_uses'
  | 'challenges_completed'
  | 'challenges_won';

export interface AchievementDefinition {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon_url?: string;
  xp_reward: number;
  coin_reward: number;
  requirement_type: RequirementType;
  requirement_value: number;
  is_secret: boolean;
  is_limited_edition: boolean;
  available_until?: string;
  sort_order: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_current: number;
  progress_total: number;
  is_completed: boolean;
  completed_at?: string;
  is_displayed: boolean;
  created_at: string;

  // Relations (loaded separately)
  achievement?: AchievementDefinition;
}

export interface AchievementProgress extends UserAchievement {
  achievement: AchievementDefinition;
  percentage: number;
}

export interface AchievementUnlock {
  achievement: AchievementDefinition;
  user_achievement: UserAchievement;
  rewards_earned: {
    xp: number;
    coins: number;
  };
}

// ============================================
// LEADERBOARD SYSTEM
// ============================================

export type LeaderboardType =
  | 'weekly_workouts'
  | 'monthly_volume'
  | 'streak'
  | 'xp'
  | 'challenge_wins';

export interface Leaderboard {
  id: string;
  user_id: string;
  leaderboard_type: LeaderboardType;
  score: number;
  rank?: number;
  period_start: string;
  period_end: string;
  metadata?: LeaderboardMetadata;
  created_at: string;
  updated_at: string;

  // Relations (loaded separately)
  user?: LeaderboardUser;
}

export interface LeaderboardMetadata {
  total_weight?: number;
  total_reps?: number;
  total_workouts?: number;
  average_duration?: number;
  [key: string]: any;
}

export interface LeaderboardUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  current_level: number;
}

export interface LeaderboardEntry extends Leaderboard {
  user: LeaderboardUser;
  change?: number; // rank change from previous period
  is_current_user?: boolean;
}

export interface LeaderboardSnapshot {
  id: string;
  leaderboard_type: LeaderboardType;
  period_start: string;
  period_end: string;
  top_users: Array<{
    user_id: string;
    score: number;
    rank: number;
    username: string;
    avatar_url?: string;
  }>;
  total_participants: number;
  snapshot_taken_at: string;
}

// ============================================
// CHALLENGE SYSTEM
// ============================================

export type ChallengeType = 'individual' | 'team' | 'community';

export type ChallengeCategory =
  | 'endurance'
  | 'strength'
  | 'volume'
  | 'consistency'
  | 'specialized';

export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export type GoalMetric =
  | 'total_workouts'
  | 'total_reps'
  | 'total_weight'
  | 'streak_days'
  | 'specific_workout';

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  category: ChallengeCategory;
  start_date: string;
  end_date: string;

  // Goal Configuration
  goal_metric: GoalMetric;
  goal_value: number;
  goal_unit?: string;

  // Participation
  participant_count: number;
  max_participants?: number;

  // Rewards
  xp_reward: number;
  coin_reward: number;
  entry_fee: number;
  prize_pool: number;
  rewards?: ChallengeRewards;

  // Metadata
  difficulty_level: 'easy' | 'medium' | 'hard' | 'extreme';
  requirements?: ChallengeRequirements;
  rules?: ChallengeRules;
  banner_image_url?: string;
  sponsored_by?: string;

  // Status
  status: ChallengeStatus;
  is_featured: boolean;

  // Related
  related_workout_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Relations (loaded separately)
  creator?: ChallengeCreator;
  user_participation?: ChallengeParticipant;
}

export interface ChallengeRewards {
  first?: {
    xp?: number;
    coins?: number;
    badge?: string;
    prize_money?: number;
  };
  second?: {
    xp?: number;
    coins?: number;
    badge?: string;
    prize_money?: number;
  };
  third?: {
    xp?: number;
    coins?: number;
    badge?: string;
    prize_money?: number;
  };
  participation?: {
    xp?: number;
    coins?: number;
  };
}

export interface ChallengeRequirements {
  min_level?: number;
  min_workouts?: number;
  min_streak?: number;
  required_achievements?: string[];
}

export interface ChallengeRules {
  [key: string]: any;
}

export interface ChallengeCreator {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;

  // Progress
  current_progress: number;
  progress_percentage: number;
  rank?: number;

  // Team
  team_id?: string;

  // Status
  is_completed: boolean;
  completed_at?: string;

  // Metadata
  joined_at: string;
  last_activity_at: string;

  // Relations
  user?: ChallengeUser;
  team?: ChallengeTeam;
}

export interface ChallengeUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  current_level: number;
}

export interface ChallengeProgressLog {
  id: string;
  participant_id: string;
  progress_amount: number;
  progress_note?: string;
  workout_id?: string;
  logged_at: string;
}

export interface ChallengeTeam {
  id: string;
  challenge_id: string;
  team_name: string;
  team_captain_id: string;
  team_image_url?: string;
  team_motto?: string;

  member_count: number;
  total_score: number;
  rank?: number;

  created_at: string;

  // Relations
  captain?: ChallengeUser;
  members?: ChallengeParticipant[];
}

// ============================================
// LIVE WORKOUT SESSIONS
// ============================================

export type SessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface LiveWorkoutSession {
  id: string;
  host_id: string;
  workout_id?: string;

  title: string;
  description?: string;

  // Scheduling
  scheduled_start: string;
  actual_start?: string;
  actual_end?: string;
  estimated_duration?: number;

  // Participation
  participant_count: number;
  max_participants?: number;

  // Features
  is_live: boolean;
  chat_enabled: boolean;
  video_url?: string;

  // Status
  status: SessionStatus;

  created_at: string;
  updated_at: string;

  // Relations
  host?: SessionHost;
  participants?: LiveSessionParticipant[];
}

export interface SessionHost {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  current_level: number;
}

export interface LiveSessionParticipant {
  id: string;
  session_id: string;
  user_id: string;

  joined_at: string;
  left_at?: string;
  is_active: boolean;

  current_exercise: number;
  completed_exercises: number;

  // Relations
  user?: SessionUser;
}

export interface SessionUser {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
}

export interface LiveSessionMessage {
  id: string;
  session_id: string;
  user_id: string;

  message: string;
  message_type: 'text' | 'emoji' | 'system' | 'cheer';

  created_at: string;

  // Relations
  user?: SessionUser;
}

// ============================================
// STREAKS & ACTIVITY
// ============================================

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface StreakUpdate {
  current_streak: number;
  longest_streak: number;
  streak_extended: boolean;
  streak_broken: boolean;
  already_logged_today?: boolean;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  xp_earned: number;
  coins_earned: number;
  created_at: string;
}

// ============================================
// COMMUNITY STATS
// ============================================

export interface CommunityStats {
  id: string;
  stat_date: string;

  // Daily Totals
  total_workouts_completed: number;
  total_users_active: number;
  total_weight_lifted: number;
  total_calories_burned: number;
  total_reps_completed: number;

  // Engagement
  total_comments: number;
  total_likes: number;
  total_shares: number;
  new_users: number;

  // Challenges
  active_challenges: number;
  challenge_completions: number;

  created_at: string;
  updated_at: string;
}

export interface ActiveWorkoutSession {
  id: string;
  user_id: string;
  workout_id?: string;
  started_at: string;
  last_heartbeat: string;
  is_active: boolean;
}

export interface CommunityRealTimeStats {
  users_working_out_now: number;
  workouts_completed_today: number;
  total_weight_lifted_today: number;
  total_calories_burned_today: number;
  active_challenges: number;
  total_users: number;
}

// ============================================
// VIRTUAL CURRENCY (for future phases)
// ============================================

export interface UserCurrency {
  id: string;
  user_id: string;
  coins: number;
  gems: number;
  lifetime_coins: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface JoinChallengeRequest {
  challenge_id: string;
  team_id?: string;
}

export interface LogChallengeProgressRequest {
  challenge_id: string;
  progress_amount: number;
  progress_note?: string;
  workout_id?: string;
}

export interface CreateLiveSessionRequest {
  workout_id?: string;
  title: string;
  description?: string;
  scheduled_start: string;
  estimated_duration?: number;
  max_participants?: number;
  chat_enabled?: boolean;
}

export interface JoinLiveSessionRequest {
  session_id: string;
}

export interface SendSessionMessageRequest {
  session_id: string;
  message: string;
  message_type?: 'text' | 'emoji' | 'cheer';
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface LeaderboardFilters {
  type: LeaderboardType;
  scope?: 'global' | 'friends' | 'local';
  period?: 'current' | 'previous' | 'all-time';
}

export interface ChallengeFilters {
  status?: ChallengeStatus | 'all';
  category?: ChallengeCategory | 'all';
  type?: ChallengeType | 'all';
  difficulty?: string | 'all';
}

export interface AchievementFilters {
  category?: AchievementCategory | 'all';
  tier?: AchievementTier | 'all';
  status?: 'completed' | 'in-progress' | 'locked' | 'all';
}
