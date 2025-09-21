// Delete a generator workout by id
export async function deleteGeneratorWorkout(id: string, user_id: string) {
  const { error } = await supabase
    .from('generator_workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id);
  if (error) throw error;
}
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export async function saveGeneratorWorkout({ name, exercises, meta, user_id }: {
  name: string;
  exercises: any[];
  meta?: any;
  user_id: string;
}) {
  const { error } = await supabase.from('generator_workouts').insert({
    id: uuidv4(),
    user_id,
    name,
    created_at: new Date().toISOString(),
    exercises,
    meta: meta || {},
  });
  if (error) throw error;
}

export async function getMyGeneratorWorkouts(user_id: string) {
  const { data, error } = await supabase
    .from('generator_workouts')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
