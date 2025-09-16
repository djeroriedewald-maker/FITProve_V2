import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface CommunityWorkout {
  id: string;
  name: string;
  description: string;
  hero_image_url?: string;
  creator_name?: string;
  creator_username?: string;
}

export function CommunityWorkoutsPage() {
  const [workouts, setWorkouts] = useState<CommunityWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkouts() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('custom_workouts')
          .select(`id, name, description, hero_image_url, is_public, user_id, profiles!custom_workouts_user_id_fkey(display_name, username)`) // join profiles for creator info
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        // Map creator info
        const mapped = (data || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          description: w.description,
          hero_image_url: w.hero_image_url,
          creator_name: w.profiles?.display_name,
          creator_username: w.profiles?.username
        }));
        setWorkouts(mapped);
      } catch (err: any) {
        setError('Failed to load community workouts.');
      } finally {
        setLoading(false);
      }
    }
    fetchWorkouts();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading community workouts...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Community Workouts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map((workout) => (
          <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex flex-col">
            {workout.hero_image_url && (
              <img src={workout.hero_image_url} alt={workout.name} className="w-full h-40 object-cover rounded-lg mb-4" />
            )}
            <h2 className="text-xl font-semibold mb-2">{workout.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-3">{workout.description}</p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Created by: <span className="font-medium">{workout.creator_name || workout.creator_username || 'Unknown'}</span>
            </div>
            <Link to={`/modules/workout/execute/${workout.id}`} className="mt-auto inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center font-semibold">Start Workout</Link>
          </div>
        ))}
      </div>
      {workouts.length === 0 && <div className="text-center text-gray-500 mt-8">No community workouts found.</div>}
    </div>
  );
}
