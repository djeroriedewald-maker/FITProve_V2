// Planner Service - Recurring Events & Reminders
import { supabase } from './supabase';

export interface PlannerEvent {
  id: string;
  user_id: string;
  date: string;
  type: 'workout' | 'rest';
  title?: string;
  notes?: string;
  workout_id?: string;
  workout_type?: string;
  duration_min?: number;
  time?: string;
  completed?: boolean;
  color?: string;
  source?: string;
  recurring_rule?: string;
  recurrence_end?: string;
  parent_event_id?: string;
  reminder_minutes?: number;
  reminder_sent?: boolean;
  created_at?: string;
  updated_at?: string;
  meta?: Record<string, unknown>;
}

export type RecurringRule = 'daily' | 'weekly' | 'biweekly' | 'monthly' | '';

/**
 * Create a workout event with optional recurring pattern
 */
export async function createWorkoutEvent(
  event: Omit<PlannerEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  generateUntil?: string
): Promise<{ data: PlannerEvent | null; error: any }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Insert the base event with user_id
    const { data, error } = await supabase
      .from('planner_events')
      .insert({ ...event, user_id: user.id })
      .select()
      .single();

    if (error) throw error;

    // If recurring and generateUntil is specified, generate instances
    if (data && event.recurring_rule && generateUntil) {
      await generateRecurringEvents(data.id, data.date, generateUntil);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating workout event:', error);
    return { data: null, error };
  }
}

/**
 * Generate recurring event instances
 */
export async function generateRecurringEvents(
  eventId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase.rpc('generate_recurring_events', {
      p_event_id: eventId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error generating recurring events:', error);
    return { success: false, error };
  }
}

/**
 * Update a recurring event
 * @param updateFuture If true, updates this event and all future instances
 */
export async function updateRecurringEvent(
  eventId: string,
  updates: Partial<PlannerEvent>,
  updateFuture: boolean = false
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!updateFuture) {
      // Just update this single event
      const { error } = await supabase
        .from('planner_events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;
    } else {
      // Update this event and all future instances
      // First, get the event to find its date
      const { data: event, error: fetchError } = await supabase
        .from('planner_events')
        .select('date, parent_event_id, user_id')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // Update this event
      await supabase
        .from('planner_events')
        .update(updates)
        .eq('id', eventId);

      // Update all future instances
      const parentId = event.parent_event_id || eventId;
      await supabase
        .from('planner_events')
        .update(updates)
        .eq('parent_event_id', parentId)
        .gte('date', event.date);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating recurring event:', error);
    return { success: false, error };
  }
}

/**
 * Delete a recurring event
 * @param deleteFuture If true, deletes this event and all future instances
 */
export async function deleteRecurringEvent(
  eventId: string,
  deleteFuture: boolean = false
): Promise<{ success: boolean; error?: any }> {
  try {
    if (!deleteFuture) {
      // Just delete this single event
      const { error } = await supabase
        .from('planner_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    } else {
      // Delete this event and all future instances
      // First, get the event to find its date
      const { data: event, error: fetchError } = await supabase
        .from('planner_events')
        .select('date, parent_event_id, user_id')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // Delete this event
      await supabase
        .from('planner_events')
        .delete()
        .eq('id', eventId);

      // Delete all future instances
      const parentId = event.parent_event_id || eventId;
      await supabase
        .from('planner_events')
        .delete()
        .eq('parent_event_id', parentId)
        .gte('date', event.date);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting recurring event:', error);
    return { success: false, error };
  }
}

/**
 * Get all events for a user in a date range
 */
export async function getEventsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ data: PlannerEvent[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('planner_events')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return { data: data as PlannerEvent[], error: null };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { data: null, error };
  }
}

/**
 * Set reminder for an event
 */
export async function setEventReminder(
  eventId: string,
  reminderMinutes: number
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('planner_events')
      .update({
        reminder_minutes: reminderMinutes,
        reminder_sent: false, // Reset reminder sent flag
      })
      .eq('id', eventId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error setting event reminder:', error);
    return { success: false, error };
  }
}

/**
 * Helper function to calculate next occurrence date
 */
export function getNextOccurrence(
  currentDate: string,
  recurringRule: RecurringRule
): string | null {
  if (!recurringRule) return null;

  const date = new Date(currentDate);

  switch (recurringRule) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return null;
  }

  return date.toISOString().split('T')[0];
}

/**
 * Helper function to format recurring rule for display
 */
export function formatRecurringRule(rule: RecurringRule): string {
  const labels: Record<RecurringRule, string> = {
    daily: 'Dagelijks',
    weekly: 'Wekelijks',
    biweekly: 'Om de 2 weken',
    monthly: 'Maandelijks',
    '': 'Geen herhaling',
  };

  return labels[rule] || 'Geen herhaling';
}

/**
 * Helper function to format reminder time for display
 */
export function formatReminderTime(minutes: number): string {
  if (minutes === 0) return 'Geen herinnering';
  if (minutes < 60) return `${minutes} minuten voor`;
  if (minutes === 60) return '1 uur voor';
  if (minutes < 1440) return `${Math.floor(minutes / 60)} uur voor`;
  return `${Math.floor(minutes / 1440)} dag voor`;
}
