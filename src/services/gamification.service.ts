/**
 * Gamification Service Layer
 * Handles all gamification features: XP, Achievements, Leaderboards, Challenges
 */

import { supabase } from '../lib/supabase';
import type {
  UserLevel,
  XPTransaction,
  AwardXPResult,
  AchievementDefinition,
  UserAchievement,
  AchievementProgress,
  Leaderboard,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardFilters,
  CommunityChallenge,
  ChallengeParticipant,
  ChallengeFilters,
  JoinChallengeRequest,
  LogChallengeProgressRequest,
  UserStreak,
  StreakUpdate,
  CommunityStats,
  CommunityRealTimeStats,
} from '../types/gamification.types';

// ============================================
// XP & LEVEL SYSTEM
// ============================================

export const GamificationService = {
  /**
   * Get user's current level and XP
   */
  async getUserLevel(userId: string): Promise<UserLevel | null> {
    const { data, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user level:', error);
      return null;
    }

    return data;
  },

  /**
   * Calculate XP needed for a specific level
   */
  calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
  },

  /**
   * Award XP to user (calls database function)
   */
  async awardXP(
    userId: string,
    xpAmount: number,
    reason: string,
    activityType: string,
    relatedEntityId?: string
  ): Promise<AwardXPResult | null> {
    const { data, error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_xp_amount: xpAmount,
      p_reason: reason,
      p_activity_type: activityType,
      p_related_entity_id: relatedEntityId || null,
    });

    if (error) {
      console.error('Error awarding XP:', error);
      return null;
    }

    return data as AwardXPResult;
  },

  /**
   * Get XP transaction history for a user
   */
  async getXPTransactions(
    userId: string,
    limit = 50
  ): Promise<XPTransaction[]> {
    const { data, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching XP transactions:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get user's level progression info
   */
  async getLevelProgression(userId: string) {
    const level = await this.getUserLevel(userId);
    if (!level) return null;

    const xpNeeded = this.calculateXPForLevel(level.current_level);
    const xpForNextLevel = this.calculateXPForLevel(level.current_level + 1);
    const progressPercentage = (level.current_xp / xpNeeded) * 100;

    return {
      ...level,
      xp_needed_for_current_level: xpNeeded,
      xp_needed_for_next_level: xpForNextLevel,
      progress_percentage: Math.min(progressPercentage, 100),
    };
  },

  // ============================================
  // STREAK SYSTEM
  // ============================================

  /**
   * Get user's current streak
   */
  async getUserStreak(userId: string): Promise<UserStreak | null> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching user streak:', error);
      return null;
    }

    return data;
  },

  /**
   * Update user's streak (calls database function)
   */
  async updateStreak(userId: string): Promise<StreakUpdate | null> {
    const { data, error } = await supabase.rpc('update_user_streak', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error updating streak:', error);
      return null;
    }

    return data as StreakUpdate;
  },

  /**
   * Get top streaks leaderboard
   */
  async getTopStreaks(limit = 10): Promise<Array<UserStreak & { user: any }>> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select(
        `
        *,
        profiles:user_id (
          id,
          display_name,
          username,
          avatar_url
        )
      `
      )
      .order('current_streak', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching top streaks:', error);
      return [];
    }

    return (
      data?.map((item: any) => ({
        ...item,
        user: item.profiles,
      })) || []
    );
  },

  // ============================================
  // ACHIEVEMENT SYSTEM
  // ============================================

  /**
   * Get all achievement definitions
   */
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching achievement definitions:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get user's achievements with progress
   */
  async getUserAchievements(userId: string): Promise<AchievementProgress[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(
        `
        *,
        achievement:achievement_id (
          *
        )
      `
      )
      .eq('user_id', userId)
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return (
      data?.map((item: any) => ({
        ...item,
        achievement: item.achievement,
        percentage: (item.progress_current / item.progress_total) * 100,
      })) || []
    );
  },

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(
    category: string
  ): Promise<AchievementDefinition[]> {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching achievements by category:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Check and unlock achievements for a user
   * This should be called after any activity that could trigger achievements
   */
  async checkAndUnlockAchievements(
    userId: string,
    activityType: string,
    currentValue: number
  ): Promise<AchievementProgress[]> {
    // Get all relevant achievement definitions
    const { data: achievements, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('requirement_type', activityType);

    if (error || !achievements) return [];

    const unlockedAchievements: AchievementProgress[] = [];

    for (const achievement of achievements) {
      // Check if user already has this achievement
      const { data: userAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (userAchievement && userAchievement.is_completed) {
        continue; // Already unlocked
      }

      // Check if requirement is met
      if (currentValue >= achievement.requirement_value) {
        // Unlock achievement
        const { data: updated } = await supabase
          .from('user_achievements')
          .upsert({
            user_id: userId,
            achievement_id: achievement.id,
            progress_current: currentValue,
            progress_total: achievement.requirement_value,
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (updated) {
          // Award XP and coins
          await this.awardXP(
            userId,
            achievement.xp_reward,
            `Unlocked achievement: ${achievement.name}`,
            'achievement_unlock',
            achievement.id
          );

          unlockedAchievements.push({
            ...updated,
            achievement,
            percentage: 100,
          });
        }
      } else {
        // Update progress
        await supabase.from('user_achievements').upsert({
          user_id: userId,
          achievement_id: achievement.id,
          progress_current: currentValue,
          progress_total: achievement.requirement_value,
          is_completed: false,
        });
      }
    }

    return unlockedAchievements;
  },

  // ============================================
  // LEADERBOARD SYSTEM
  // ============================================

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(
    filters: LeaderboardFilters,
    limit = 100
  ): Promise<LeaderboardEntry[]> {
    const { type, scope = 'global', period = 'current' } = filters;

    // Calculate period dates
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    if (type === 'weekly_workouts') {
      const dayOfWeek = now.getDay();
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - dayOfWeek);
      periodStart.setHours(0, 0, 0, 0);

      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    } else if (type === 'xp' || type === 'streak') {
      // All-time leaderboards
      periodStart = new Date('2024-01-01');
      periodEnd = new Date('2099-12-31');
    } else {
      // Default to current month
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Try to get from leaderboard_snapshots first (for seeded demo data)
    const { data: snapshotData, error: snapshotError } = await supabase
      .from('leaderboard_snapshots')
      .select('*')
      .eq('leaderboard_type', type)
      .eq('period_start', periodStart.toISOString().split('T')[0])
      .single();

    if (snapshotData && !snapshotError) {
      // Return data from snapshot
      const topUsers = snapshotData.top_users as any[];
      return topUsers.slice(0, limit).map((user: any) => ({
        id: user.user_id,
        user_id: user.user_id,
        leaderboard_type: type,
        score: user.score,
        rank: user.rank,
        period_start: snapshotData.period_start,
        period_end: snapshotData.period_end,
        metadata: {
          username: user.username,
          avatar_url: user.avatar_url,
          level: user.level,
          total_xp: user.total_xp,
          current_streak: user.current_streak,
          longest_streak: user.longest_streak,
        },
        user: {
          id: user.user_id,
          display_name: user.username,
          username: user.username,
          avatar_url: user.avatar_url,
          current_level: user.level || 1,
        },
        created_at: snapshotData.created_at,
        updated_at: snapshotData.updated_at,
      }));
    }

    // Fallback to real leaderboards table (for actual user data)
    const { data, error } = await supabase
      .from('leaderboards')
      .select(
        `
        *,
        profiles:user_id (
          id,
          display_name,
          username,
          avatar_url
        ),
        user_levels:user_id (
          current_level
        )
      `
      )
      .eq('leaderboard_type', type)
      .gte('period_start', periodStart.toISOString().split('T')[0])
      .lte('period_end', periodEnd.toISOString().split('T')[0])
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return (
      data?.map((item: any, index: number) => ({
        ...item,
        rank: item.rank || index + 1,
        user: {
          ...item.profiles,
          current_level: item.user_levels?.current_level || 1,
        },
      })) || []
    );
  },

  /**
   * Update user's leaderboard score
   */
  async updateLeaderboardScore(
    userId: string,
    leaderboardType: LeaderboardType,
    score: number,
    metadata?: any
  ): Promise<boolean> {
    // Calculate current period
    const now = new Date();
    const dayOfWeek = now.getDay();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - dayOfWeek);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);

    const { error } = await supabase.from('leaderboards').upsert({
      user_id: userId,
      leaderboard_type: leaderboardType,
      score,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      metadata,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error updating leaderboard score:', error);
      return false;
    }

    // Update rankings
    await supabase.rpc('update_leaderboard_rankings', {
      p_leaderboard_type: leaderboardType,
      p_period_start: periodStart.toISOString().split('T')[0],
      p_period_end: periodEnd.toISOString().split('T')[0],
    });

    return true;
  },

  /**
   * Get user's leaderboard position
   */
  async getUserLeaderboardPosition(
    userId: string,
    leaderboardType: LeaderboardType
  ): Promise<LeaderboardEntry | null> {
    const leaderboard = await this.getLeaderboard({ type: leaderboardType });
    return leaderboard.find((entry) => entry.user_id === userId) || null;
  },

  // ============================================
  // CHALLENGE SYSTEM
  // ============================================

  /**
   * Get challenges with filters
   */
  async getChallenges(
    filters?: ChallengeFilters
  ): Promise<CommunityChallenge[]> {
    let query = supabase.from('community_challenges').select(`
        *,
        profiles:created_by (
          id,
          display_name,
          username,
          avatar_url
        )
      `);

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.type && filters.type !== 'all') {
      query = query.eq('challenge_type', filters.type);
    }

    query = query.order('start_date', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }

    return (
      data?.map((item: any) => ({
        ...item,
        creator: item.profiles,
      })) || []
    );
  },

  /**
   * Get challenge by ID with full details
   */
  async getChallengeById(challengeId: string): Promise<CommunityChallenge | null> {
    const { data, error } = await supabase
      .from('community_challenges')
      .select(`
        *,
        profiles:created_by (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
      .eq('id', challengeId)
      .single();

    if (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }

    return data
      ? {
          ...data,
          creator: data.profiles,
        }
      : null;
  },

  /**
   * Join a challenge
   */
  async joinChallenge(request: JoinChallengeRequest, userId: string): Promise<boolean> {
    const { challenge_id, team_id } = request;

    const { error } = await supabase.from('challenge_participants').insert({
      challenge_id,
      user_id: userId,
      team_id,
      current_progress: 0,
      progress_percentage: 0,
    });

    if (error) {
      console.error('Error joining challenge:', error);
      return false;
    }

    return true;
  },

  /**
   * Log challenge progress
   */
  async logChallengeProgress(request: LogChallengeProgressRequest, userId: string): Promise<boolean> {
    const { challenge_id, progress_amount, progress_note, workout_id } = request;

    // Get participant record
    const { data: participant, error: participantError } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', challenge_id)
      .eq('user_id', userId)
      .single();

    if (participantError || !participant) {
      console.error('Error fetching participant:', participantError);
      return false;
    }

    // Update progress
    const newProgress = participant.current_progress + progress_amount;

    // Get challenge to calculate percentage
    const { data: challenge } = await supabase
      .from('community_challenges')
      .select('goal_value')
      .eq('id', challenge_id)
      .single();

    const progressPercentage = challenge
      ? (newProgress / challenge.goal_value) * 100
      : 0;

    const { error: updateError } = await supabase
      .from('challenge_participants')
      .update({
        current_progress: newProgress,
        progress_percentage: Math.min(progressPercentage, 100),
        is_completed: progressPercentage >= 100,
        completed_at: progressPercentage >= 100 ? new Date().toISOString() : null,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return false;
    }

    // Log progress
    await supabase.from('challenge_progress_logs').insert({
      participant_id: participant.id,
      progress_amount,
      progress_note,
      workout_id,
    });

    return true;
  },

  /**
   * Get user's challenge participations
   */
  async getUserChallenges(userId: string): Promise<ChallengeParticipant[]> {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        community_challenges (
          *
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching user challenges:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get challenge leaderboard
   */
  async getChallengeLeaderboard(challengeId: string, limit = 100): Promise<ChallengeParticipant[]> {
    const { data, error } = await supabase
      .from('challenge_participants')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          username,
          avatar_url
        ),
        user_levels:user_id (
          current_level
        )
      `)
      .eq('challenge_id', challengeId)
      .order('current_progress', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching challenge leaderboard:', error);
      return [];
    }

    return (
      data?.map((item: any, index: number) => ({
        ...item,
        rank: index + 1,
        user: {
          ...item.profiles,
          current_level: item.user_levels?.current_level || 1,
        },
      })) || []
    );
  },

  // ============================================
  // COMMUNITY STATS
  // ============================================

  /**
   * Get today's community stats
   */
  async getTodayStats(): Promise<CommunityStats | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('community_stats')
      .select('*')
      .eq('stat_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today stats:', error);
      return null;
    }

    return data;
  },

  /**
   * Get real-time community stats
   */
  async getRealTimeStats(): Promise<CommunityRealTimeStats> {
    // Get active workout sessions (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { count: activeUsers } = await supabase
      .from('active_workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('last_heartbeat', fiveMinutesAgo);

    // Get today's stats
    const todayStats = await this.getTodayStats();

    // Get active challenges count
    const { count: activeChallenges } = await supabase
      .from('community_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      users_working_out_now: activeUsers || 0,
      workouts_completed_today: todayStats?.total_workouts_completed || 0,
      total_weight_lifted_today: todayStats?.total_weight_lifted || 0,
      total_calories_burned_today: todayStats?.total_calories_burned || 0,
      active_challenges: activeChallenges || 0,
      total_users: totalUsers || 0,
    };
  },

  /**
   * Start active workout session (for real-time tracking)
   */
  async startWorkoutSession(userId: string, workoutId?: string): Promise<boolean> {
    const { error } = await supabase.from('active_workout_sessions').upsert({
      user_id: userId,
      workout_id: workoutId,
      started_at: new Date().toISOString(),
      last_heartbeat: new Date().toISOString(),
      is_active: true,
    });

    if (error) {
      console.error('Error starting workout session:', error);
      return false;
    }

    return true;
  },

  /**
   * End active workout session
   */
  async endWorkoutSession(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('active_workout_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error ending workout session:', error);
      return false;
    }

    return true;
  },

  /**
   * Update workout session heartbeat
   */
  async updateWorkoutHeartbeat(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('active_workout_sessions')
      .update({
        last_heartbeat: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating heartbeat:', error);
      return false;
    }

    return true;
  },
};

export default GamificationService;
