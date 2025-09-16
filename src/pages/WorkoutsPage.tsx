
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Target, Calendar, Dumbbell } from 'lucide-react';
import { WorkoutCreatorService } from '../lib/workout-creator.service';
import { CustomWorkout } from '../types/workout-creator.types';

export function WorkoutsPage() {
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {workout.name || workout.title || 'Untitled Workout'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      (workout.difficulty_level || workout.level) === 'beginner' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : (workout.difficulty_level || workout.level) === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {workout.difficulty_level || workout.level || 'Unknown'}
                    </span>
                  </div>

                  {workout.goal && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {workout.goal}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {workout.duration_min && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{workout.duration_min} min</span>
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
                    <div className="flex flex-wrap gap-2 mb-4">
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

                  <div className="flex gap-2">
                    <button className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                      Start Workout
                    </button>
                    <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
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