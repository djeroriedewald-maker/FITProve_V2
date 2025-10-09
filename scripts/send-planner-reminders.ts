// scripts/send-planner-reminders.ts
// Node.js script to send reminders for planner events (including recurring)
// Run this script on a schedule (e.g., every 15 minutes)

import { supabase } from '../src/lib/supabase';
import { createNotificationWithPrefs } from '../src/lib/notifications';
import moment from 'moment';

// Expand recurring events for a date range (simple FREQ=DAILY|WEEKLY|MONTHLY)
function expandRecurringEvents(event, rangeStart, rangeEnd) {
  const results = [];
  if (!event.recurrence_rule) {
    results.push({ ...event, date: event.date });
    return results;
  }
  let freq = '';
  if (event.recurrence_rule.includes('FREQ=DAILY')) freq = 'DAILY';
  else if (event.recurrence_rule.includes('FREQ=WEEKLY')) freq = 'WEEKLY';
  else if (event.recurrence_rule.includes('FREQ=MONTHLY')) freq = 'MONTHLY';
  else return results;
  const start = moment(event.date);
  const until = event.recurrence_end ? moment(event.recurrence_end) : moment(rangeEnd);
  let current = start.clone();
  while (current.isSameOrBefore(until) && current.isSameOrBefore(rangeEnd)) {
    if (current.isSameOrAfter(rangeStart)) {
      results.push({ ...event, date: current.format('YYYY-MM-DD') });
    }
    if (freq === 'DAILY') current.add(1, 'day');
    else if (freq === 'WEEKLY') current.add(1, 'week');
    else if (freq === 'MONTHLY') current.add(1, 'month');
  }
  return results;
}

async function main() {
  const now = moment();
  const lookahead = now.clone().add(48, 'hours');

  // 1. Fetch all planner events with reminders set
  const { data: events, error } = await supabase
    .from('planner_events')
    .select('*')
    .or('reminder_minutes_before.is.not.null,reminder_minutes_before.gt.0')
    .order('date', { ascending: true });
  if (error) throw error;

  // 2. Expand recurring events for the next 48h
  let allOccurrences = [];
  for (const event of events) {
    const occurrences = expandRecurringEvents(event, now, lookahead);
    allOccurrences = allOccurrences.concat(occurrences);
  }

  // 3. For each occurrence, check if a reminder should be sent now
  for (const occ of allOccurrences) {
    if (!occ.reminder_minutes_before) continue;
    const eventDateTime = moment(`${occ.date}T${occ.time || '07:00'}`);
    const reminderTime = eventDateTime.clone().subtract(occ.reminder_minutes_before, 'minutes');
    // Send if reminderTime is within the last interval (e.g., last 15 min)
    if (reminderTime.isBetween(now.clone().subtract(15, 'minutes'), now, null, '[)')) {
      // Fetch user notification preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', occ.user_id)
        .single();
      const prefs = profile?.notification_preferences || { events: ['in_app'] };
      for (const channel of prefs.events) {
        await createNotificationWithPrefs({
          user_id: occ.user_id,
          notifType: 'events',
          channel,
          type: 'reminder',
          title: `Upcoming Workout: ${occ.title || occ.workout_type || 'Workout'}`,
          message: `You have a workout scheduled on ${occ.date}${occ.time ? ' at ' + occ.time : ''}.`,
          data: { eventId: occ.id, date: occ.date },
        });
      }
    }
  }
  console.log('Reminders processed.');
}

main().catch((err) => {
  console.error('Error sending planner reminders:', err);
  process.exit(1);
});
