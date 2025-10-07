import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UserHistoryEntry {
  exercise_id: string;
  completed_at: string;
}

interface UseUserHistoryResult {
  recentExerciseIds: string[];
  isLoading: boolean;
  error: string | null;
}

export function useUserHistory(limit: number = 20): UseUserHistoryResult {
  const [recentExerciseIds, setRecentExerciseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) {
          if (isMounted) setRecentExerciseIds([]);
          return;
        }

        const { data, error: historyError } = await supabase
          .from('user_workout_history')
          .select('exercise_id, completed_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(limit);

        if (historyError) throw historyError;

        const entries = (data ?? []) as UserHistoryEntry[];
        if (isMounted) setRecentExerciseIds(entries.map((entry) => entry.exercise_id));
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message ?? 'Unable to load workout history');
          setRecentExerciseIds([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { recentExerciseIds, isLoading, error };
}
