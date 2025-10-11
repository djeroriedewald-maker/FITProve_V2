/**
 * useWorkoutSession Hook
 * Manages live workout sessions with heartbeat system for real-time activity tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface WorkoutSession {
  id: string;
  user_id: string;
  session_type: 'strength' | 'cardio' | 'hybrid' | 'other';
  started_at: string;
  last_heartbeat: string;
}

interface UseWorkoutSessionReturn {
  // Session state
  isSessionActive: boolean;
  currentSession: WorkoutSession | null;

  // Actions
  startSession: (sessionType: 'strength' | 'cardio' | 'hybrid' | 'other') => Promise<void>;
  endSession: () => Promise<void>;
  sendHeartbeat: () => Promise<void>;

  // Loading/Error states
  isLoading: boolean;
  error: Error | null;
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const SESSION_TIMEOUT = 300000; // 5 minutes

export function useWorkoutSession(): UseWorkoutSessionReturn {
  const { user } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Send heartbeat to keep session alive
  const sendHeartbeat = useCallback(async () => {
    if (!currentSession) return;

    try {
      const { error: updateError } = await supabase
        .from('active_workout_sessions')
        .update({ last_heartbeat: new Date().toISOString() })
        .eq('id', currentSession.id);

      if (updateError) throw updateError;

      console.log('Heartbeat sent for session:', currentSession.id);
    } catch (err) {
      console.error('Error sending heartbeat:', err);
      setError(err as Error);
    }
  }, [currentSession]);

  // Start a new workout session
  const startSession = useCallback(
    async (sessionType: 'strength' | 'cardio' | 'hybrid' | 'other') => {
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      if (isSessionActive) {
        console.warn('Session already active');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const now = new Date().toISOString();

        const { data, error: insertError } = await supabase
          .from('active_workout_sessions')
          .insert({
            user_id: user.id,
            session_type: sessionType,
            started_at: now,
            last_heartbeat: now,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setCurrentSession(data);
        setIsSessionActive(true);

        // Start heartbeat interval
        heartbeatIntervalRef.current = setInterval(() => {
          sendHeartbeat();
        }, HEARTBEAT_INTERVAL);

        console.log('Workout session started:', data.id);
      } catch (err) {
        console.error('Error starting session:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, isSessionActive, sendHeartbeat]
  );

  // End the current workout session
  const endSession = useCallback(async () => {
    if (!currentSession) {
      console.warn('No active session to end');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Delete session from database
      const { error: deleteError } = await supabase
        .from('active_workout_sessions')
        .delete()
        .eq('id', currentSession.id);

      if (deleteError) throw deleteError;

      setCurrentSession(null);
      setIsSessionActive(false);

      console.log('Workout session ended');
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // Check for existing active session on mount
  useEffect(() => {
    if (!user) return;

    const checkActiveSession = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('active_workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('last_heartbeat', new Date(Date.now() - SESSION_TIMEOUT).toISOString())
          .single();

        if (fetchError) {
          if (fetchError.code !== 'PGRST116') {
            // PGRST116 = no rows returned (expected if no active session)
            throw fetchError;
          }
          return;
        }

        if (data) {
          setCurrentSession(data);
          setIsSessionActive(true);

          // Resume heartbeat
          heartbeatIntervalRef.current = setInterval(() => {
            sendHeartbeat();
          }, HEARTBEAT_INTERVAL);

          console.log('Resumed existing session:', data.id);
        }
      } catch (err) {
        console.error('Error checking active session:', err);
      }
    };

    checkActiveSession();

    // Cleanup on unmount
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [user, sendHeartbeat]);

  // Auto-end session if user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        // Synchronous call to delete session before page unload
        navigator.sendBeacon(
          `${supabase.supabaseUrl}/rest/v1/active_workout_sessions?id=eq.${currentSession.id}`,
          JSON.stringify({ _method: 'DELETE' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentSession]);

  return {
    isSessionActive,
    currentSession,
    startSession,
    endSession,
    sendHeartbeat,
    isLoading,
    error,
  };
}

/**
 * Example Usage:
 *
 * function WorkoutPage() {
 *   const { isSessionActive, startSession, endSession } = useWorkoutSession();
 *   const [workoutType, setWorkoutType] = useState<'strength' | 'cardio' | 'hybrid'>('strength');
 *
 *   const handleStartWorkout = async () => {
 *     await startSession(workoutType);
 *     // Begin workout...
 *   };
 *
 *   const handleEndWorkout = async () => {
 *     await endSession();
 *     // Show workout summary...
 *   };
 *
 *   return (
 *     <div>
 *       {!isSessionActive ? (
 *         <button onClick={handleStartWorkout}>Start Workout</button>
 *       ) : (
 *         <button onClick={handleEndWorkout}>End Workout</button>
 *       )}
 *     </div>
 *   );
 * }
 */
