import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CommunityWorkoutCard } from '../components/workout/CommunityWorkoutCard';
import { supabase } from '../lib/supabase';

interface CommunityWorkout {
  id: string;
  name: string;
  description: string;
  hero_image_url?: string;
  creator_name?: string;
  creator_username?: string;
  tags?: string[];
}

export function CommunityWorkoutsPage() {
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
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
          .select(
            `id, name, description, hero_image_url, tags, is_public, user_id, profiles!custom_workouts_user_id_fkey(display_name, username)`
          ) // join profiles for creator info
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        // Map creator info
        const mapped = (data || []).map((w: unknown) => {
          const workout = w as {
            id: string;
            name: string;
            description: string;
            hero_image_url?: string;
            profiles?: { display_name?: string; username?: string };
            tags?: string[];
          };
          return {
            id: workout.id,
            name: workout.name,
            description: workout.description,
            hero_image_url: workout.hero_image_url,
            creator_name: workout.profiles?.display_name,
            creator_username: workout.profiles?.username,
            tags: workout.tags || [],
          };
        });
        setWorkouts(mapped);
      } catch (err: unknown) {
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
    <>
      {/* Hero Image Section */}
      <div className="w-full relative">
        <img
          src="/images/community_workout.webp"
          alt="Community Workouts Hero"
          className="w-full h-64 object-cover object-center shadow-lg"
          style={{ maxHeight: 320 }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-center">
          <h1 className="w-full text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Community Workouts
          </h1>
          <p className="w-full mt-2 text-lg md:text-2xl text-gray-100 font-medium drop-shadow">
            Discover and join workouts from the community
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Intro Text */}
        <div className="mb-8 text-center">
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
            Welcome to the Community Workouts page! Here you can discover, join, and get inspired by
            workouts created and shared by other fitness enthusiasts. Browse a variety of routines,
            find new challenges, and connect with the community to support your fitness journey.
          </p>
        </div>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg border bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Go back"
        >
          <span className="text-xl">←</span> Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
            <CommunityWorkoutCard key={workout.id} {...workout} />
          ))}
        </div>
        {workouts.length === 0 && (
          <div className="text-center text-gray-500 mt-8">No community workouts found.</div>
        )}
      </div>
    </>
  );
}
