/**
 * WorkoutExecutePage - Simple workout execution interface
 * Guides users through workout exercises with timer and progress tracking
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Target, Dumbbell, Plus, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BackButton } from '../../components/ui/BackButton';
import { useScrollToTop } from '../../hooks/useScroll';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';
import {
  WorkoutDetails,
  WorkoutSession,
  WorkoutExerciseResult,
  SetResult,
} from '../../types/workout-creator.types';

export function WorkoutExecutePage() {
  useScrollToTop(); // Automatically scroll to top when page loads

  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState<WorkoutDetails | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [sessionStartTime] = useState(new Date());
  const [exerciseResults, setExerciseResults] = useState<{ [key: string]: SetResult[] }>({});
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId]);

  useEffect(() => {
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, []);

  const loadWorkout = async () => {
    if (!workoutId) return;

    try {
      const workoutData = await WorkoutCreatorService.getWorkoutById(workoutId);
      if (workoutData) {
        setWorkout(workoutData);
        startSession(workoutData);
      } else {
        toast('Workout not found');
        navigate('/modules/workout/my-workouts');
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      toast('Failed to load workout');
    }
  };

  const startSession = async (workoutData: WorkoutDetails) => {
    try {
      const sessionData = await WorkoutCreatorService.startWorkoutSession(workoutData.id);
      if (sessionData) {
        setSession(sessionData);
        toast('Workout session started!');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast('Failed to start workout session');
    }
  };

  const startRestTimer = (seconds: number) => {
    setIsResting(true);
    setRestTimeRemaining(seconds);

    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining((prev) => {
        if (prev <= 1) {
          if (restTimerRef.current) {
            clearInterval(restTimerRef.current);
          }
          setIsResting(false);
          toast('Rest period complete!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipRest = () => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    setIsResting(false);
    setRestTimeRemaining(0);
  };

  const logSet = (reps: number, weight?: number, rpe?: number) => {
    if (!workout) return;

    const currentExercise = workout.exercises?.[currentExerciseIndex];
    if (!currentExercise) return;

    const setResult: SetResult = {
      set: currentSet,
      reps,
      weight,
      rpe,
      completed_at: new Date().toISOString(),
    };

    setExerciseResults((prev) => ({
      ...prev,
      [currentExercise.exercise_id]: [...(prev[currentExercise.exercise_id] || []), setResult],
    }));

    // Move to next set or exercise
    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      startRestTimer(currentExercise.rest_seconds);
    } else {
      // Exercise completed, move to next
      if (currentExerciseIndex < (workout.exercises?.length || 0) - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
        toast(`${currentExercise.exercise.name} completed!`);
      } else {
        // Workout completed
        completeWorkout();
      }
    }
  };

  const completeWorkout = async () => {
    if (!session) return;

    try {
      const exerciseResults: WorkoutExerciseResult[] = (workout?.exercises || []).map(
        (exercise, index) => ({
          id: `result-${index}`,
          workout_session_id: session.id,
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.exercise.name,
          order_index: index,
          total_sets: exercise.sets,
          total_reps: 0, // Could calculate from set results
          total_weight: 0,
          max_weight: 0,
          average_rpe: 0,
          notes: '',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          exercise_duration: 0,
          set_results: [], // Empty set results for now
        })
      );

      await WorkoutCreatorService.completeWorkoutSession(session.id, exerciseResults);

      setIsWorkoutCompleted(true);
      toast('Workout completed! Great job! 🎉');
    } catch (error) {
      console.error('Error completing workout:', error);
      toast('Failed to save workout completion');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workout || !workout.exercises) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (isWorkoutCompleted) {
    return <WorkoutCompletedScreen workout={workout} sessionStartTime={sessionStartTime} />;
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <BackButton text="Exit Workout" to="/modules/workout/my-workouts" />

            {/* Progress */}
            <div className="flex-1 mx-8">
              <div className="text-center mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Session Time</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isResting ? (
          <RestScreen
            timeRemaining={restTimeRemaining}
            onSkip={skipRest}
            nextExercise={workout.exercises[currentExerciseIndex]}
          />
        ) : (
          <ExerciseScreen
            exercise={currentExercise}
            currentSet={currentSet}
            onLogSet={logSet}
            previousSets={exerciseResults[currentExercise.exercise_id] || []}
          />
        )}
      </div>
    </div>
  );
}

interface RestScreenProps {
  timeRemaining: number;
  onSkip: () => void;
  nextExercise: any;
}

function RestScreen({ timeRemaining, onSkip, nextExercise }: RestScreenProps) {
  return (
    <div className="text-center">
      <div className="bg-blue-500 rounded-full w-48 h-48 mx-auto mb-8 flex items-center justify-center">
        <div className="text-white">
          <Clock className="w-16 h-16 mx-auto mb-4" />
          <div className="text-4xl font-bold">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-lg">Rest Time</div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Take a Rest</h2>

      <p className="text-gray-600 dark:text-gray-400 mb-8">Next up: {nextExercise.exercise.name}</p>

      <button
        onClick={onSkip}
        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        Skip Rest
      </button>
    </div>
  );
}

interface ExerciseScreenProps {
  exercise: any;
  currentSet: number;
  onLogSet: (reps: number, weight?: number, rpe?: number) => void;
  previousSets: SetResult[];
}

function ExerciseScreen({ exercise, currentSet, onLogSet, previousSets }: ExerciseScreenProps) {
  const [reps, setReps] = useState(parseInt(exercise.reps) || 8);
  const [weight, setWeight] = useState(exercise.weight_suggestion || '');
  const [rpe, setRpe] = useState(7);

  const handleLogSet = () => {
    onLogSet(reps, weight ? Number(weight) : undefined, rpe);
  };

  return (
    <div className="space-y-8">
      {/* Exercise Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {exercise.exercise.name}
        </h1>

        <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{exercise.exercise.primary_muscles.join(', ')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Dumbbell className="w-4 h-4" />
            <span>{exercise.exercise.equipment.join(', ')}</span>
          </div>
        </div>

        <div className="text-lg font-semibold text-orange-600 mb-4">
          Set {currentSet} of {exercise.sets}
        </div>

        {/* Exercise Image */}
        {exercise.exercise.image_url && (
          <img
            src={exercise.exercise.image_url}
            alt={exercise.exercise.name}
            className="w-64 h-40 object-cover rounded-lg mx-auto"
          />
        )}
      </div>

      {/* Set Logging */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Log Your Set
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Reps */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reps
            </label>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold text-gray-900 dark:text-white w-16 text-center">
                {reps}
              </span>
              <button
                onClick={() => setReps(reps + 1)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weight */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* RPE */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RPE (1-10)
            </label>
            <select
              value={rpe}
              onChange={(e) => setRpe(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Complete Set Button */}
        <button
          onClick={handleLogSet}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
        >
          <CheckCircle className="w-5 h-5" />
          Complete Set
        </button>
      </div>

      {/* Previous Sets */}
      {previousSets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Previous Sets
          </h4>
          <div className="space-y-2">
            {previousSets.map((set, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
              >
                <span className="text-gray-600 dark:text-gray-400">Set {set.set}</span>
                <div className="flex gap-4 text-sm">
                  <span>{set.reps} reps</span>
                  {set.weight && <span>{set.weight} lbs</span>}
                  {set.rpe && <span>RPE {set.rpe}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkoutCompletedScreenProps {
  workout: WorkoutDetails;
  sessionStartTime: Date;
}

function WorkoutCompletedScreen({ workout, sessionStartTime }: WorkoutCompletedScreenProps) {
  const navigate = useNavigate();
  const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="bg-green-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Workout Complete! 🎉
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          You crushed "{workout.name}" in {duration} minutes!
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{workout.exercises?.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{duration}m</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/modules/workout/my-workouts')}
            className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Back to My Workouts
          </button>

          <button
            onClick={() => navigate('/modules/social')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Share Your Achievement
          </button>
        </div>
      </div>
    </div>
  );
}
