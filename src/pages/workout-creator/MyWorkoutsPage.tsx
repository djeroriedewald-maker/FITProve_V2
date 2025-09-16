/**
 * MyWorkoutsPage - Display user's custom workouts
 * Shows created workouts with options to edit, delete, execute, or share
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  Edit,
  Trash2,
  Share2,
  Clock,
  Target,
  Dumbbell,
  Users,
  Lock,
  Globe,
  Heart,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BackButton } from '../../components/ui/BackButton';
import { useScrollToTop } from '../../hooks/useScroll';
import { WorkoutDetails } from '../../types/workout-creator.types';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';

export function MyWorkoutsPage() {
  useScrollToTop(); // Automatically scroll to top when page loads

  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<WorkoutDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadMyWorkouts();
  }, []);

  const loadMyWorkouts = async () => {
    try {
      const userWorkouts = await WorkoutCreatorService.getUserWorkouts();
      setWorkouts(userWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string, workoutName: string) => {
    if (
      !confirm(`Are you sure you want to delete "${workoutName}"? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      const success = await WorkoutCreatorService.deleteWorkout(workoutId);
      if (success) {
        setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        toast('Workout deleted successfully');
      } else {
        toast('Failed to delete workout');
      }
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast('Failed to delete workout');
    }
  };

  const handleDuplicateWorkout = async (workoutId: string, workoutName: string) => {
    try {
      const duplicated = await WorkoutCreatorService.duplicateWorkout(
        workoutId,
        `${workoutName} (Copy)`
      );
      if (duplicated) {
        toast('Workout duplicated successfully');
        loadMyWorkouts(); // Refresh the list
      } else {
        toast('Failed to duplicate workout');
      }
    } catch (error) {
      console.error('Error duplicating workout:', error);
      toast('Failed to duplicate workout');
    }
  };

  const handleStartWorkout = (workoutId: string) => {
    navigate(`/modules/workout/execute/${workoutId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <BackButton text="Back to Workouts" to="/modules/workout" />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your workouts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <BackButton text="Back to Workouts" to="/modules/workout" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Workouts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {workouts.length} custom workout{workouts.length !== 1 ? 's' : ''} created
            </p>
          </div>

          <Link
            to="/modules/workout/workout-creator"
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Workout
          </Link>
        </div>

        {workouts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onStart={() => handleStartWorkout(workout.id)}
                onEdit={() => navigate(`/modules/workout/workout-creator?edit=${workout.id}`)}
                onDelete={() => handleDeleteWorkout(workout.id, workout.name)}
                onDuplicate={() => handleDuplicateWorkout(workout.id, workout.name)}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        <Dumbbell className="w-12 h-12 text-gray-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No workouts yet</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Create your first custom workout by selecting exercises from our library and configuring
        sets, reps, and rest times.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/modules/workout/workout-creator"
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create Your First Workout
        </Link>

        <Link
          to="/modules/workout/workout-library"
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
        >
          <Users className="w-5 h-5" />
          Browse Community Workouts
        </Link>
      </div>
    </div>
  );
}

interface WorkoutCardProps {
  workout: WorkoutDetails;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

function WorkoutCard({
  workout,
  onStart,
  onEdit,
  onDelete,
  onDuplicate,
  activeDropdown,
  setActiveDropdown,
}: WorkoutCardProps) {
  const isDropdownOpen = activeDropdown === workout.id;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Hero Image */}
      {workout.hero_image_url ? (
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
          <img
            src={workout.hero_image_url}
            alt={workout.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Workout type badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
              Custom Workout
            </span>
          </div>

          {/* Difficulty badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 backdrop-blur-sm text-white text-xs font-medium rounded-full ${
              workout.difficulty === 'beginner' 
                ? 'bg-green-600/80' 
                : workout.difficulty === 'intermediate' 
                ? 'bg-yellow-600/80' 
                : 'bg-red-600/80'
            }`}>
              {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          {/* Default workout visual */}
          <div className="text-center text-white">
            <Dumbbell className="w-16 h-16 mx-auto mb-2 opacity-80" />
            <span className="text-sm font-medium opacity-90">Custom Workout</span>
          </div>
          
          {/* Difficulty badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 backdrop-blur-sm text-white text-xs font-medium rounded-full ${
              workout.difficulty === 'beginner' 
                ? 'bg-green-600/80' 
                : workout.difficulty === 'intermediate' 
                ? 'bg-yellow-600/80' 
                : 'bg-red-600/80'
            }`}>
              {workout.difficulty ? workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1) : 'Unknown'}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
              {workout.name}
            </h3>
            {workout.description && workout.description.trim() && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                  {workout.description}
                </p>
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          <div className="relative ml-3">
            <button
              onClick={() => setActiveDropdown(isDropdownOpen ? null : workout.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-10 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                <button
                  onClick={() => {
                    onEdit();
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDuplicate();
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Dumbbell className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement sharing
                    toast('Sharing feature coming soon!');
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                <button
                  onClick={() => {
                    onDelete();
                    setActiveDropdown(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{workout.total_exercises} exercises</span>
          </div>
          {workout.estimated_duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{workout.estimated_duration}m</span>
            </div>
          )}
          {!workout.hero_image_url && (
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="capitalize">{workout.difficulty}</span>
            </div>
          )}
        </div>

        {/* Muscle Groups */}
        {workout.primary_muscle_groups && workout.primary_muscle_groups.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {workout.primary_muscle_groups.slice(0, 3).map((muscle) => (
              <span
                key={muscle}
                className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium"
              >
                {muscle}
              </span>
            ))}
            {workout.primary_muscle_groups.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                +{workout.primary_muscle_groups.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          {/* Visibility & Stats */}
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            {workout.is_public ? (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Public</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Private</span>
              </div>
            )}

            {workout.like_count > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{workout.like_count}</span>
              </div>
            )}

            {workout.use_count > 0 && (
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{workout.use_count}</span>
              </div>
            )}
          </div>

          {/* Start Button */}
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
