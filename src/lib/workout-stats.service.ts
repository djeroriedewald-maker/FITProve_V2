// Workout Statistics Service
// Fetches and calculates workout stats from planner_events table

import { supabase } from './supabase';
import moment from 'moment';

export interface WorkoutStats {
  todayProgress: number; // 0-100
  weeklyWorkouts: number;
  activeStreak: number;
  caloriesBurned: number;
  minutesActive: number;
  totalMinutes: number; // Alias for minutesActive
  completedThisWeek: number;
  totalPlanned: number;
}

export interface DailyWorkoutData {
  date: string;
  completed: number;
  planned: number;
  minutes: number;
}

/**
 * Get workout statistics for the current user
 */
export async function getWorkoutStats(userId: string): Promise<WorkoutStats> {
  try {
    const today = moment().format('YYYY-MM-DD');
    const weekStart = moment().startOf('week').format('YYYY-MM-DD');
    const weekEnd = moment().endOf('week').format('YYYY-MM-DD');

    // Get all events for the user
    const { data: allEvents, error } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'workout')
      .order('date', { ascending: false });

    if (error) throw error;

    // Today's progress (completed workouts / total planned)
    const todayEvents = allEvents?.filter(e => e.date === today) || [];
    const todayCompleted = todayEvents.filter(e => e.completed).length;
    const todayTotal = todayEvents.length;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // Weekly workouts (completed this week)
    const weekEvents = allEvents?.filter(e => {
      const eventDate = moment(e.date);
      return eventDate.isBetween(weekStart, weekEnd, 'day', '[]');
    }) || [];
    const weeklyWorkouts = weekEvents.filter(e => e.completed).length;
    const totalPlanned = weekEvents.length;

    // Active streak (consecutive days with completed workouts)
    const activeStreak = calculateStreak(allEvents || []);

    // Calculate calories and minutes (estimated)
    const completedEvents = allEvents?.filter(e => e.completed) || [];
    const minutesActive = completedEvents.reduce((sum, e) => sum + (e.duration_min || 0), 0);
    const caloriesBurned = Math.round(minutesActive * 7.5); // Rough estimate: 7.5 cal/min

    return {
      todayProgress,
      weeklyWorkouts,
      activeStreak,
      caloriesBurned,
      minutesActive,
      totalMinutes: minutesActive,
      completedThisWeek: weeklyWorkouts,
      totalPlanned,
    };
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    return {
      todayProgress: 0,
      weeklyWorkouts: 0,
      activeStreak: 0,
      caloriesBurned: 0,
      minutesActive: 0,
      totalMinutes: 0,
      completedThisWeek: 0,
      totalPlanned: 0,
    };
  }
}

/**
 * Calculate consecutive days streak
 */
function calculateStreak(events: any[]): number {
  if (!events || events.length === 0) return 0;

  // Group by date and check if any workout was completed that day
  const completedDates = new Set<string>();
  events.forEach(event => {
    if (event.completed) {
      completedDates.add(event.date);
    }
  });

  // Sort dates descending
  const sortedDates = Array.from(completedDates).sort().reverse();

  let streak = 0;
  let currentDate = moment();

  // Check today and count backwards
  for (const date of sortedDates) {
    const eventDate = moment(date);
    const daysDiff = currentDate.diff(eventDate, 'days');

    if (daysDiff === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get daily workout data for the past N days (for charts)
 */
export async function getDailyWorkoutData(userId: string, days: number = 7): Promise<DailyWorkoutData[]> {
  try {
    const startDate = moment().subtract(days - 1, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');

    const { data: events, error } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'workout')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    // Group by date
    const dateMap = new Map<string, { completed: number; planned: number; minutes: number }>();

    // Initialize all dates with 0
    for (let i = 0; i < days; i++) {
      const date = moment().subtract(days - 1 - i, 'days').format('YYYY-MM-DD');
      dateMap.set(date, { completed: 0, planned: 0, minutes: 0 });
    }

    // Fill in actual data
    events?.forEach(event => {
      const existing = dateMap.get(event.date) || { completed: 0, planned: 0, minutes: 0 };
      existing.planned++;
      if (event.completed) {
        existing.completed++;
        existing.minutes += event.duration_min || 0;
      }
      dateMap.set(event.date, existing);
    });

    // Convert to array
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  } catch (error) {
    console.error('Error fetching daily workout data:', error);
    return [];
  }
}

/**
 * Get upcoming scheduled workouts
 */
export async function getUpcomingWorkouts(userId: string, limit: number = 5) {
  try {
    const today = moment().format('YYYY-MM-DD');

    const { data: events, error } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'workout')
      .eq('completed', false)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return events || [];
  } catch (error) {
    console.error('Error fetching upcoming workouts:', error);
    return [];
  }
}

/**
 * Get weekly workout trend (for charts)
 */
export async function getWeeklyTrend(userId: string, weeks: number = 4) {
  try {
    const startDate = moment().subtract(weeks, 'weeks').startOf('week').format('YYYY-MM-DD');
    const endDate = moment().endOf('week').format('YYYY-MM-DD');

    const { data: events, error } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'workout')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // Group by week
    const weekMap = new Map<string, { completed: number; total: number; minutes: number }>();

    events?.forEach(event => {
      const weekStart = moment(event.date).startOf('week').format('YYYY-MM-DD');
      const existing = weekMap.get(weekStart) || { completed: 0, total: 0, minutes: 0 };
      existing.total++;
      if (event.completed) {
        existing.completed++;
        existing.minutes += event.duration_min || 0;
      }
      weekMap.set(weekStart, existing);
    });

    return Array.from(weekMap.entries()).map(([week, data]) => ({
      week,
      ...data,
    }));
  } catch (error) {
    console.error('Error fetching weekly trend:', error);
    return [];
  }
}
