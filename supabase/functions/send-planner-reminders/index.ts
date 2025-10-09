// Supabase Edge Function: Send Planner Reminders
// This function should be called via a cron job (e.g., every 15 minutes)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderEvent {
  event_id: string;
  user_id: string;
  event_title: string;
  event_date: string;
  event_time: string | null;
  reminder_minutes: number;
  user_email: string;
  user_name: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending reminders
    const { data: reminders, error } = await supabase
      .rpc('get_pending_reminders', { p_check_window_minutes: 15 });

    if (error) {
      throw error;
    }

    console.log(`Found ${reminders?.length || 0} pending reminders`);

    const results = {
      total: reminders?.length || 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each reminder
    for (const reminder of (reminders as ReminderEvent[]) || []) {
      try {
        // Format the event time
        const eventDateTime = reminder.event_time
          ? `${reminder.event_date} om ${reminder.event_time}`
          : reminder.event_date;

        // Send notification (this would integrate with your notification system)
        // For now, we'll just log it. You could integrate with:
        // - Push notifications (via Firebase, OneSignal, etc.)
        // - Email (via SendGrid, Resend, etc.)
        // - SMS (via Twilio, etc.)
        // - In-app notifications (via Supabase Realtime)

        console.log(`Sending reminder for event: ${reminder.event_title}`);
        console.log(`  To: ${reminder.user_email} (${reminder.user_name || 'Unknown'})`);
        console.log(`  Event: ${eventDateTime}`);
        console.log(`  Reminder: ${reminder.reminder_minutes} minutes before`);

        // Example: Insert into notifications table
        await supabase.from('notifications').insert({
          user_id: reminder.user_id,
          type: 'planner_reminder',
          title: 'Workout Herinnering 🏋️',
          message: `"${reminder.event_title}" begint ${reminder.reminder_minutes === 1 ? 'over 1 minuut' : `over ${reminder.reminder_minutes} minuten`}!`,
          data: {
            event_id: reminder.event_id,
            event_title: reminder.event_title,
            event_date: reminder.event_date,
            event_time: reminder.event_time,
          },
          read: false,
        });

        // Mark reminder as sent
        await supabase.rpc('mark_reminder_sent', { p_event_id: reminder.event_id });

        results.sent++;
      } catch (err) {
        console.error(`Failed to send reminder for event ${reminder.event_id}:`, err);
        results.failed++;
        results.errors.push(`Event ${reminder.event_id}: ${err.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.total} reminders`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-planner-reminders:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
