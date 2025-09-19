import { useState, useEffect } from 'react';
import OnboardingFlow from '../../components/onboarding/OnboardingFlow';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Play } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TagInput } from '../../components/ui/TagInput';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { ExerciseSelector } from '../../components/workout-creator/ExerciseSelector';
import { WorkoutBuilder } from '../../components/workout-creator/WorkoutBuilder';
import { useScrollToTop } from '../../hooks/useScroll';
import { useAuth } from '../../contexts/AuthContext';
import { Exercise } from '../../types/exercise.types';
import { WorkoutFormData, WorkoutExerciseFormData } from '../../types/workout-creator.types';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';
import { ExerciseService } from '../../lib/exercise.service';

export function WorkoutCreatorPage() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  useScrollToTop();
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
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  useEffect(() => {
    loadExerciseLibrary();
    if (editId) {
      // Load workout for editing
      (async () => {
        const workout = await WorkoutCreatorService.getWorkoutById(editId);
        if (workout) {
          setWorkoutData({
            name: workout.name || '',
            description: workout.description || '',
            difficulty: workout.difficulty || 'intermediate',
            tags: workout.tags || [],
            hero_image_url: workout.hero_image_url,
            is_public: workout.is_public || false,
            exercises: (workout.exercises || []).map((ex: any) => ({
              exercise_id: ex.exercise_id,
              sets: ex.sets,
              reps: ex.reps,
              weight_suggestion: ex.weight_suggestion,
              rest_seconds: ex.rest_seconds,
              notes: ex.notes,
              is_warmup: ex.is_warmup,
              is_cooldown: ex.is_cooldown,
              superset_group: ex.superset_group,
            })),
          });
        } else {
          toast.error('Failed to load workout for editing');
        }
      })();
    }
  }, [editId]);

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
    const existingIndex = workoutData.exercises.findIndex((ex) => ex.exercise_id === exercise.id);
    if (existingIndex >= 0) {
      toast('Exercise already added to workout');
      return;
    }
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
    if (!workoutData.name.trim()) {
      toast.error('Please enter a workout name');
      return;
    }
    if (workoutData.exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }
    setSaving(true);
    try {
      const { supabase } = await import('../../lib/supabase');
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        toast.error('Authentication error. Please try again.');
        return;
      }
      if (!session?.user) {
        toast.error('Please sign in to save workouts');
        navigate('/signin');
        return;
      }
      const directUserId = session.user.id;
      const savedWorkout = await WorkoutCreatorService.createWorkout(workoutData, directUserId);
      if (savedWorkout) {
        toast('Workout saved successfully!');
        navigate('/modules/workout/my-workouts');
      } else {
        toast('Failed to save workout. Check console for details.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
    const authenticatedUserId = user?.id || profile?.id;
    if (!authenticatedUserId) {
      toast('Authentication required. Please sign in to start workouts.');
      return;
    }
    if (workoutData.exercises.length === 0) {
      toast('Please add exercises before starting workout');
      return;
    }
    if (workoutData.name.trim()) {
      await handleSaveWorkout();
    }
    toast('Workout execution coming soon!');
  };

  const addSampleExercises = () => {
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

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Image Section */}
      <div className="relative w-full h-64 md:h-80 flex items-center justify-center mb-6">
        <img
          src={import.meta.env.BASE_URL + 'images/workout_creator.webp'}
          alt="Workout Creator Hero"
          className="absolute inset-0 w-full h-full object-cover object-center rounded-b-3xl shadow-lg"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
          <span className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg dark:text-gray-100 px-8 py-4 rounded-2xl">
            Workout creator
          </span>
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 dark:from-black/60 dark:to-black/70 rounded-b-3xl"
          style={{ zIndex: 1.5 }}
        />
      </div>

      {/* Main Workout Creator Form */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-6 flex flex-col gap-4">
            <input
              type="text"
              className="w-full text-2xl font-bold bg-transparent border-b-2 border-orange-200 dark:border-orange-700 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 text-gray-900 dark:text-white mb-2"
              placeholder="Workout name"
              value={workoutData.name}
              onChange={(e) => setWorkoutData((prev) => ({ ...prev, name: e.target.value }))}
              maxLength={60}
            />
            <textarea
              className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-orange-400 text-gray-700 dark:text-gray-200 resize-none min-h-[48px]"
              placeholder="Describe your workout (optional)"
              value={workoutData.description}
              onChange={(e) => setWorkoutData((prev) => ({ ...prev, description: e.target.value }))}
              maxLength={200}
            />
          </div>
          <div className="mb-4">
            <TagInput
              tags={workoutData.tags}
              onChange={(tags) => setWorkoutData((prev) => ({ ...prev, tags }))}
              placeholder="Add tags (e.g. strength, HIIT, legs)"
            />
          </div>
          <div className="mb-4">
            <ImageUpload
              imageUrl={workoutData.hero_image_url}
              onChange={(url) => setWorkoutData((prev) => ({ ...prev, hero_image_url: url }))}
            />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="isPublic" className="text-gray-700 dark:text-gray-200 font-medium">
              Public workout
            </label>
            <input
              id="isPublic"
              type="checkbox"
              checked={workoutData.is_public}
              onChange={(e) => setWorkoutData((prev) => ({ ...prev, is_public: e.target.checked }))}
              className="w-5 h-5 accent-orange-600"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {workoutData.is_public ? 'Visible to all users' : 'Private (only you can see)'}
            </span>
          </div>
        </div>

        {/* Workout Builder Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Exercises ({workoutData.exercises.length})
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 dark:border-blue-700 rounded px-3 py-1 transition-colors"
              >
                Add Exercise
              </button>
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
          </div>
          <WorkoutBuilder
            exercises={workoutData.exercises}
            onExercisesChange={(exercises) => setWorkoutData((prev) => ({ ...prev, exercises }))}
            exerciseLibrary={exerciseLibrary}
          />
        </div>
      </div>

      {/* Action Buttons at the Bottom */}
      <div className="max-w-3xl mx-auto px-4 pb-16 flex flex-col md:flex-row gap-4 justify-end items-center">
        <button
          onClick={handleSaveWorkout}
          disabled={saving || !isWorkoutValid}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Workout'}
        </button>
        <button
          onClick={handleStartWorkout}
          disabled={!isWorkoutValid}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
        >
          <Play className="w-5 h-5" />
          Start Workout
        </button>
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
