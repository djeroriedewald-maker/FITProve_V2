import { useState, useEffect } from 'react';
// import WorkoutGenerator from '../workout-generator';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Save, Play } from 'lucide-react';
import { FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { TagInput } from '../../components/ui/TagInput';
import { ImageUpload } from '../../components/ui/ImageUpload';

import { WorkoutBuilder } from '../../components/workout-creator/WorkoutBuilder';
import { useScrollToTop } from '../../hooks/useScroll';
import { useAuth } from '../../contexts/AuthContext';
import { Exercise } from '../../types/exercise.types';
import {
  WorkoutFormData,
  WorkoutExerciseFormData,
  TrainingType,
} from '../../types/workout-creator.types';
import { TRAINING_TYPES } from '../../constants/trainingTypes';
import { WORKOUT_DIFFICULTIES } from '../../constants/workoutDifficulty';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';
import { ExerciseService } from '../../lib/exercise.service';

export function WorkoutCreatorPage() {
  // const [showOnboarding, setShowOnboarding] = useState(true);
  useScrollToTop();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [workoutData, setWorkoutData] = useState<WorkoutFormData>({
    name: '',
    description: '',
    difficulty: 'intermediate',
    trainingType: undefined,
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
            exercises: (workout.exercises || []).map((ex: WorkoutExerciseFormData) => ({
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

  // Handle selected exercises coming back from ExerciseSelectionPage
  useEffect(() => {
    if (location.state?.selectedExercises) {
      const selectedExercises: Exercise[] = location.state.selectedExercises;
      selectedExercises.forEach(exercise => {
        const existingIndex = workoutData.exercises.findIndex((ex) => ex.exercise_id === exercise.id);
        if (existingIndex < 0) {
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
        }
      });
      
      if (selectedExercises.length > 0) {
        toast.success(`${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''} added to workout`);
      }
      
      // Clear the navigation state to prevent re-adding on page refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, workoutData.exercises, navigate, location.pathname]);

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
      let savedWorkout;
      if (editId) {
        // Overwrite the existing workout
        const { data, error } = await supabase
          .from('custom_workouts')
          .update({
            name: workoutData.name,
            description: workoutData.description,
            difficulty: workoutData.difficulty,
            trainingType: workoutData.trainingType,
            tags: workoutData.tags,
            hero_image_url: workoutData.hero_image_url,
            is_public: workoutData.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId)
          .eq('user_id', directUserId)
          .select()
          .single();
        if (error) {
          toast('Failed to update workout.');
          setSaving(false);
          return;
        }
        // Remove old exercises and insert new ones
        await supabase.from('custom_workout_exercises').delete().eq('custom_workout_id', editId);
        if (workoutData.exercises.length > 0) {
          const exerciseInserts = workoutData.exercises.map((exercise, index) => ({
            custom_workout_id: editId,
            exercise_id: exercise.exercise_id,
            order_index: index,
            sets: exercise.sets,
            reps: exercise.reps || '8-12',
            weight_suggestion: exercise.weight_suggestion ?? null,
            rest_seconds: exercise.rest_seconds,
            notes: exercise.notes || '',
            is_warmup: exercise.is_warmup || false,
            is_cooldown: exercise.is_cooldown || false,
            superset_group: exercise.superset_group ?? null,
          }));
          await supabase.from('custom_workout_exercises').insert(exerciseInserts);
        }
        savedWorkout = data;
      } else {
        savedWorkout = await WorkoutCreatorService.createWorkout(workoutData, directUserId);
      }
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


  return (
    <div className="min-h-screen bg-black dark:bg-black">
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
            {/* Difficulty Dropdown */}
            <div>
              <label
                htmlFor="difficulty"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-1"
              >
                Level of workout
              </label>
              <select
                id="difficulty"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                value={workoutData.difficulty}
                onChange={(e) =>
                  setWorkoutData((prev) => ({
                    ...prev,
                    difficulty: e.target.value as import('../../types/workout-creator.types').WorkoutDifficulty,
                  }))
                }
              >
                {WORKOUT_DIFFICULTIES.map((diff) => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
              {workoutData.difficulty && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 text-sm text-gray-800 dark:text-blue-100 rounded">
                  {WORKOUT_DIFFICULTIES.find((d) => d.value === workoutData.difficulty)
                    ?.description}
                </div>
              )}
            </div>
            {/* Trainingsvorm Dropdown */}
            <div>
              <label
                htmlFor="trainingType"
                className="block text-gray-700 dark:text-gray-200 font-medium mb-1"
              >
                Trainingsvorm
              </label>
              <select
                id="trainingType"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
                value={workoutData.trainingType || ''}
                onChange={(e) =>
                  setWorkoutData((prev) => ({
                    ...prev,
                    trainingType: e.target.value as TrainingType,
                  }))
                }
              >
                <option value="">Kies een trainingsvorm...</option>
                {TRAINING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {workoutData.trainingType && (
                <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-400 text-sm text-gray-800 dark:text-orange-100 rounded">
                  {TRAINING_TYPES.find((t) => t.value === workoutData.trainingType)?.description}
                </div>
              )}
            </div>
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
          <div className="mb-4">
            <label
              htmlFor="isPublicDropdown"
              className="block text-gray-700 dark:text-gray-200 font-medium mb-1"
            >
              Zichtbaarheid
            </label>
            <select
              id="isPublicDropdown"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500"
              value={workoutData.is_public ? 'public' : 'private'}
              onChange={(e) =>
                setWorkoutData((prev) => ({ ...prev, is_public: e.target.value === 'public' }))
              }
            >
              <option value="public">Openbaar (zichtbaar voor iedereen)</option>
              <option value="private">Privé (alleen zichtbaar voor jou)</option>
            </select>
            <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-400 text-sm text-gray-800 dark:text-orange-100 rounded">
              {workoutData.is_public ? (
                <>
                  <b>Openbaar:</b> Deze workout is zichtbaar voor alle gebruikers.<br />
                  Anderen kunnen jouw workout vinden, bekijken en eventueel gebruiken als inspiratie.<br />
                </>
              ) : (
                <>
                  <b>Privé:</b> Alleen jij kunt deze workout zien.<br />
                  Handig voor persoonlijke schema&apos;s of workouts die je (nog) niet wilt delen.<br />
                </>
              )}
            </div>
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
                onClick={() => navigate('/modules/workout/workout-creator/select-exercises', {
                  state: { selectedExercises: workoutData.exercises.map(ex => exerciseLibrary.find(lib => lib.id === ex.exercise_id)).filter(Boolean) }
                })}
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
        <button
          onClick={() => {
            if (!isWorkoutValid) return;
            navigate('/modules/workout/planner', {
              state: { plannerAddWorkout: workoutData },
            });
          }}
          disabled={!isWorkoutValid}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
        >
          <FaPlus className="w-5 h-5" />
          Save to planner
        </button>
      </div>


    </div>
  );
}

