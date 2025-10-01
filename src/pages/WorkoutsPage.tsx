import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Calendar, Dumbbell } from 'lucide-react';
import { WorkoutCreatorService } from '../lib/workout-creator.service';
import { CustomWorkout } from '../types/workout-creator.types';

export function WorkoutsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);
  const [workouts, setWorkouts] = useState<CustomWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading user workouts...');
      
      const userWorkouts = await WorkoutCreatorService.getUserWorkouts();
      console.log('✅ Loaded workouts:', userWorkouts);
      
      setWorkouts(userWorkouts);
    } catch (err) {
      console.error('❌ Error loading workouts:', err);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            My Workouts
          </h1>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-gray-600 dark:text-gray-400">Loading workouts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            My Workouts
          </h1>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadWorkouts}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <div
        className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-12"
        style={{
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            My Workouts
          </h1>
          <Link
            to="/modules/workout/workout-creator"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Workout
          </Link>
        </div>

        {/* Workout Generator Module Card */}
        <div className="mb-8">
          <Link
            to="/workout-generator"
            className="block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-6 border border-orange-200 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-500"
          >
            <div className="flex items-center gap-4">
              <Dumbbell className="w-10 h-10 text-orange-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Workout Generator</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Let us build a workout for you with our smart onboarding flow. Answer a few questions and get a personalized plan!</p>
              </div>
            </div>
          </Link>
        </div>

        {workouts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No workouts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first workout to get started on your fitness journey!
            </p>
            <Link
              to="/modules/workout/workout-creator"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Workout
            </Link>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{
              width: '100%',
              maxWidth: '100%',
              margin: 0,
              padding: 0,
              overflowX: 'visible',
            }}
          >
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                style={{
                  minWidth: 0,
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'visible',
                  wordBreak: 'break-word',
                }}
              >
                <div
                  className="p-4 sm:p-6"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    minWidth: 0,
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white break-words max-w-full">
                      {workout.name || 'Untitled Workout'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      workout.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : workout.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {workout.difficulty || 'Unknown'}
                    </span>
                  </div>

                  {workout.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-4 line-clamp-2 break-words max-w-full">
                      {workout.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {typeof workout.estimated_duration === 'number' && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{workout.estimated_duration} min</span>
                      </div>
                    )}
                    {workout.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(workout.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {workout.tags && workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                      {workout.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {workout.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded">
                          +{workout.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-auto">
                    <button className="w-full sm:w-auto flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm sm:text-base">
                      Start Workout
                    </button>
                    <button className="w-full sm:w-auto flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

