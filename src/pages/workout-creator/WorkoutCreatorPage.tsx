/**
 * WorkoutCreatorPage - Main workout creation interface
 * Combines exercise selection, workout building, and saving functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Play, Plus, Dumbbell, Clock, Target, Users, Lock, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BackButton } from '../../components/ui/BackButton';
import { TagInput } from '../../components/ui/TagInput';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { ExerciseSelector } from '../../components/workout-creator/ExerciseSelector';
import { WorkoutBuilder } from '../../components/workout-creator/WorkoutBuilder';
import { useScrollToTop } from '../../hooks/useScroll';
import { useAuth } from '../../contexts/AuthContext';
import { Exercise } from '../../types/exercise.types';
import {
  WorkoutFormData,
  WorkoutExerciseFormData,
  WorkoutDifficulty,
} from '../../types/workout-creator.types';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';
import { ExerciseService } from '../../lib/exercise.service';

export function WorkoutCreatorPage() {
  useScrollToTop(); // Automatically scroll to top when page loads

  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  const [workoutData, setWorkoutData] = useState<WorkoutFormData>({
    name: '',
    description: '',
    difficulty: 'intermediate',
    tags: [],
    hero_image_url: undefined,
    is_public: false,
    exercises: [],
  });

  // Load exercise library on component mount
  useEffect(() => {
    loadExerciseLibrary();
  }, []);

  const loadExerciseLibrary = async () => {
    try {
      const result = await ExerciseService.getExercises();
      setExerciseLibrary(result.exercises);
    } catch (error) {
      console.error('Error loading exercise library:', error);
      toast('Failed to load exercise library');
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    // Check if exercise is already added
    const existingIndex = workoutData.exercises.findIndex((ex) => ex.exercise_id === exercise.id);
    if (existingIndex >= 0) {
      toast('Exercise already added to workout');
      return;
    }

    // Create new exercise with default values
    const newExercise: WorkoutExerciseFormData = {
      exercise_id: exercise.id,
      sets: exercise.recommended_sets || 3,
      reps: exercise.recommended_reps || '8-12',
      weight_suggestion: undefined,
      rest_seconds: exercise.rest_time || 60,
      notes: '',
      is_warmup: false,
      is_cooldown: false,
      superset_group: undefined,
    };

    setWorkoutData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));

    toast(`${exercise.name} added to workout`);
  };

  const handleSaveWorkout = async () => {
    // Check authentication - prioritize profile over user for compatibility
    console.log('💾 Save workout clicked');

    // Basic validation
    if (!workoutData.name.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    if (workoutData.exercises.length === 0) {
      console.log('❌ Validation failed: No exercises');
      toast.error('Please add at least one exercise');
      return;
    }

    console.log('✅ Validation passed, saving workout:', workoutData);
    setSaving(true);

    try {
      // Use the existing supabase client to maintain session consistency
      console.log('🔄 Checking session with existing supabase client...');
      const { supabase } = await import('../../lib/supabase');
      
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError.message);
        toast.error('Authentication error. Please try again.');
        return;
      }
      
      if (!session?.user) {
        console.log('❌ No user session found - user needs to sign in');
        toast.error('Please sign in to save workouts');
        // Redirect to sign in page
        navigate('/signin');
        return;
      }
      
      const directUserId = session.user.id;
      console.log('✅ SUPABASE SESSION SUCCESS:', session.user.email, 'ID:', directUserId);
      
      // Use the session userId
      console.log('🔄 Calling WorkoutCreatorService with userId:', directUserId);
      const savedWorkout = await WorkoutCreatorService.createWorkout(workoutData, directUserId);
      console.log('📡 Service response:', savedWorkout);

      if (savedWorkout) {
        console.log('✅ Workout saved successfully!');
        toast('Workout saved successfully!');
        navigate('/modules/workout/my-workouts');
      } else {
        console.log('❌ Service returned null/false');
        toast('Failed to save workout. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Error saving workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error details:', errorMessage);
      
      // User-friendly error messages
      if (errorMessage.includes('Authentication required')) {
        toast('Please sign in to save workouts');
      } else if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        toast('Database schema issue - please contact support');
      } else if (errorMessage.includes('RLS')) {
        toast('Permission error - please try again or contact support');
      } else {
        toast(`Failed to save workout: ${errorMessage}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStartWorkout = async () => {
    // Check authentication - prioritize profile over user for compatibility
    const authenticatedUserId = user?.id || profile?.id;
    
    if (!authenticatedUserId) {
      toast('Authentication required. Please sign in to start workouts.');
      return;
    }

    if (workoutData.exercises.length === 0) {
      toast('Please add exercises before starting workout');
      return;
    }

    // Save workout first if it has a name, otherwise save as draft
    if (workoutData.name.trim()) {
      await handleSaveWorkout();
    }

    // Navigate to workout execution (to be implemented)
    toast('Workout execution coming soon!');
  };

  const addSampleExercises = () => {
    // Add some popular exercises as a quick start
    const sampleExerciseIds = exerciseLibrary.slice(0, 4).map((ex) => ex.id);

    const sampleExercises: WorkoutExerciseFormData[] = sampleExerciseIds.map((id) => ({
      exercise_id: id,
      sets: 3,
      reps: '8-12',
      rest_seconds: 60,
      notes: '',
      is_warmup: false,
      is_cooldown: false,
    }));

    setWorkoutData((prev) => ({
      ...prev,
      exercises: sampleExercises,
    }));

    toast('Sample exercises added');
  };

  const isWorkoutValid = workoutData.name.trim() && workoutData.exercises.length > 0;
  const selectedExerciseIds = workoutData.exercises.map((ex) => ex.exercise_id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton text="Back to Workouts" to="/modules/workout" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Workout Creator
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Build your custom workout routine
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Exercise
              </button>

              {isWorkoutValid && (
                <>
                  <button
                    onClick={handleStartWorkout}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Workout
                  </button>

                  <button
                    onClick={handleSaveWorkout}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Workout Details Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Workout Details
              </h2>

              <div className="space-y-4">
                {/* Workout Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workout Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Upper Body Strength, Morning Cardio"
                    value={workoutData.name}
                    onChange={(e) => setWorkoutData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your workout goals and any special instructions..."
                    value={workoutData.description}
                    onChange={(e) =>
                      setWorkoutData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <TagInput
                    tags={workoutData.tags}
                    onChange={(tags) => setWorkoutData((prev) => ({ ...prev, tags }))}
                    maxTags={4}
                    placeholder="Add workout tags (e.g., strength, cardio, upper-body)"
                  />
                </div>

                {/* Hero Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Workout Hero Image
                  </label>
                  <ImageUpload
                    imageUrl={workoutData.hero_image_url}
                    onChange={(imageUrl) =>
                      setWorkoutData((prev) => ({ ...prev, hero_image_url: imageUrl }))
                    }
                    maxSizeMB={1}
                  />
                </div>

                {/* Difficulty & Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={workoutData.difficulty}
                      onChange={(e) =>
                        setWorkoutData((prev) => ({
                          ...prev,
                          difficulty: e.target.value as WorkoutDifficulty,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Visibility
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!workoutData.is_public}
                          onChange={() => setWorkoutData((prev) => ({ ...prev, is_public: false }))}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <Lock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="visibility"
                          checked={workoutData.is_public}
                          onChange={() => setWorkoutData((prev) => ({ ...prev, is_public: true }))}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Builder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Exercises ({workoutData.exercises.length})
                </h2>

                {workoutData.exercises.length === 0 && (
                  <button
                    onClick={addSampleExercises}
                    disabled={loadingExercises || exerciseLibrary.length === 0}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
                  >
                    Add Sample Exercises
                  </button>
                )}
              </div>

              <WorkoutBuilder
                exercises={workoutData.exercises}
                onExercisesChange={(exercises) =>
                  setWorkoutData((prev) => ({ ...prev, exercises }))
                }
                exerciseLibrary={exerciseLibrary}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setShowExerciseSelector(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Exercises</span>
                </button>

                {/* Authentication Notice */}
                {!(user || profile) && (
                  <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5" />
                      <span className="font-medium">Sign In Required</span>
                    </div>
                    <p className="text-sm mb-3">
                      You need to be signed in to save and start workouts.
                    </p>
                    <button
                      onClick={() => navigate('/signin')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Sign In
                    </button>
                  </div>
                )}

                {isWorkoutValid && (
                  <>
                    <button
                      onClick={handleSaveWorkout}
                      disabled={saving}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      <span className="font-medium">{saving ? 'Saving...' : 'Save Workout'}</span>
                    </button>

                    <button
                      onClick={handleStartWorkout}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      <span className="font-medium">Start Workout</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Workout Tips */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-400 mb-4">
                💡 Workout Tips
              </h3>

              <div className="space-y-3 text-sm text-orange-800 dark:text-orange-300">
                <div className="flex gap-2">
                  <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Target 2-3 muscle groups per workout for optimal results</span>
                </div>
                <div className="flex gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Rest 60-90s between sets for strength, 30-45s for endurance</span>
                </div>
                <div className="flex gap-2">
                  <Dumbbell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Start with compound movements, then isolations</span>
                </div>
                <div className="flex gap-2">
                  <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Make workouts public to share with the community</span>
                </div>
              </div>
            </div>

            {/* Workout Stats Preview */}
            {workoutData.exercises.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Workout Preview
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Exercises:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workoutData.exercises.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Sets:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {workoutData.exercises.reduce((sum, ex) => sum + ex.sets, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Est. Duration:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(
                        workoutData.exercises.reduce((total, ex) => {
                          const workTime = ex.sets * 45; // ~45 seconds per set
                          const restTime = ex.sets * ex.rest_seconds;
                          return total + (workTime + restTime);
                        }, 0) / 60
                      )}
                      min
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onExerciseSelect={handleExerciseSelect}
        selectedExercises={selectedExerciseIds}
      />
    </div>
  );
}
