import { useCallback, useState } from 'react';
import { saveGeneratorWorkout } from '../lib/generator-workout.service';
import { supabase } from '../lib/supabase';

interface SaveWorkoutOptions {
  name: string;
  exercises: any[];
  meta?: Record<string, unknown>;
}

interface UseSaveWorkoutResult {
  saveWorkout: (options: SaveWorkoutOptions) => Promise<void>;
  isSaving: boolean;
  error: string | null;
  saved: boolean;
  reset: () => void;
}

export function useSaveWorkout(): UseSaveWorkoutResult {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const saveWorkout = async ({ name, exercises, meta = {} }: SaveWorkoutOptions) => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        throw new Error('You must be logged in to save workouts.');
      }

      await saveGeneratorWorkout({
        name,
        exercises,
        meta,
        user_id: user.id,
      });

      setSaved(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save workout');
      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setSaved(false);
    setIsSaving(false);
  }, []);

  return { saveWorkout, isSaving, error, saved, reset };
}
