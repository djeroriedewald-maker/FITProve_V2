// Goals Service
// Handles CRUD operations for workout goals

import { supabase } from './supabase';
import { Goal, CreateGoalInput, UpdateGoalInput, GoalStatus } from '../types/goal.types';
import { getWorkoutStats } from './workout-stats.service';
import moment from 'moment';

/**
 * Create a new goal
 */
export async function createGoal(userId: string, input: CreateGoalInput): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        type: input.type,
        title: input.title,
        description: input.description,
        target_value: input.target_value,
        current_value: 0,
        unit: input.unit,
        deadline: input.deadline,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
}

/**
 * Get all goals for a user
 */
export async function getUserGoals(userId: string, status?: GoalStatus): Promise<Goal[]> {
  try {
    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as Goal[]) || [];
  } catch (error) {
    console.error('Error fetching user goals:', error);
    return [];
  }
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(goalId: string): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (error) throw error;
    return data as Goal;
  } catch (error) {
    console.error('Error fetching goal:', error);
    return null;
  }
}

/**
 * Update a goal
 */
export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput
): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  } catch (error) {
    console.error('Error updating goal:', error);
    return null;
  }
}

/**
 * Update goal progress based on current stats
 */
export async function updateGoalProgress(userId: string, goalId: string): Promise<Goal | null> {
  try {
    const goal = await getGoalById(goalId);
    if (!goal) return null;

    // Get current workout stats
    const stats = await getWorkoutStats(userId);

    let newCurrentValue = goal.current_value;

    // Update current_value based on goal type
    switch (goal.type) {
      case 'workouts_per_week':
        newCurrentValue = stats.weeklyWorkouts;
        break;
      case 'workout_minutes':
        newCurrentValue = stats.totalMinutes;
        break;
      case 'streak_days':
        newCurrentValue = stats.activeStreak;
        break;
      case 'calories_burned':
        newCurrentValue = stats.caloriesBurned;
        break;
      default:
        // For custom goals, don't auto-update
        break;
    }

    // Check if goal is completed
    const isCompleted = newCurrentValue >= goal.target_value;
    const newStatus: GoalStatus = isCompleted ? 'completed' : 'active';

    const updateData: UpdateGoalInput = {
      current_value: newCurrentValue,
      status: newStatus,
    };

    if (isCompleted && !goal.completed_at) {
      updateData.status = 'completed';
    }

    return await updateGoal(goalId, updateData);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return null;
  }
}

/**
 * Update all active goals progress for a user
 */
export async function updateAllGoalsProgress(userId: string): Promise<void> {
  try {
    const activeGoals = await getUserGoals(userId, 'active');

    await Promise.all(
      activeGoals.map(goal => updateGoalProgress(userId, goal.id))
    );
  } catch (error) {
    console.error('Error updating all goals progress:', error);
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
}

/**
 * Mark goal as completed
 */
export async function completeGoal(goalId: string): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data as Goal;
  } catch (error) {
    console.error('Error completing goal:', error);
    return null;
  }
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(goal: Goal): number {
  if (goal.target_value === 0) return 0;
  const progress = (goal.current_value / goal.target_value) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Check if goal is overdue
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (!goal.deadline) return false;
  return moment().isAfter(moment(goal.deadline)) && goal.status !== 'completed';
}

/**
 * Get days remaining until deadline
 */
export function getDaysRemaining(goal: Goal): number | null {
  if (!goal.deadline) return null;
  return moment(goal.deadline).diff(moment(), 'days');
}
