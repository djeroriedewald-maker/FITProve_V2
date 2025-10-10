import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Settings,
  Trash2,
  GripVertical,
  Check,
  Save,
  Play,
  Share2,
  ChevronRight,
  Target,
  Clock,
  Zap,
  Trophy,
  Dumbbell,
  ArrowLeft,
  Edit3,
  Eye,
  EyeOff,
  Users,
  Upload,
  X,
  Calendar,
  ArrowRight,
} from 'lucide-react';

import { BottomSheet, useHaptic } from '../../components/ui/BottomSheet';
import { useAuth } from '../../contexts/AuthContext';
import { Exercise } from '../../types/exercise.types';
import {
  WorkoutFormData,
  WorkoutExerciseFormData,
  WorkoutDifficulty,
  TrainingType,
} from '../../types/workout-creator.types';
import { WorkoutCreatorService } from '../../lib/workout-creator.service';
import { ImageUploadService } from '../../lib/image-upload.service';
import { TRAINING_TYPES } from '../../constants/trainingTypes';
import { WORKOUT_DIFFICULTIES } from '../../constants/workoutDifficulty';

// Types
interface ExerciseWithConfig extends Exercise {
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  is_warmup: boolean;
  is_cooldown: boolean;
  superset_group?: number;
  weight_suggestion?: number;
}

// Quick preset configurations
const QUICK_PRESETS = [
  { label: '3×12', sets: 3, reps: '12', rest: 60 },
  { label: '4×10', sets: 4, reps: '10', rest: 90 },
  { label: '5×5', sets: 5, reps: '5', rest: 180 },
  { label: 'Custom', sets: 3, reps: '8-12', rest: 60 },
];

export const MobileWorkoutCreatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const haptic = useHaptic();

  // Workflow state
  const [currentStep, setCurrentStep] = useState<'start' | 'details' | 'exercises' | 'configure' | 'summary' | 'success'>('start');
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);

  // Workout data
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty>('intermediate');
  const [trainingType, setTrainingType] = useState<TrainingType | ''>('');
  const [isPublic, setIsPublic] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');

  // Exercise management
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithConfig[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number | null>(null);

  // UI state
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showConfigSheet, setShowConfigSheet] = useState(false);
  const [showSummarySheet, setShowSummarySheet] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hero image state
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [heroImagePath, setHeroImagePath] = useState<string>('');

  // Edit mode
  const editWorkoutId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState(false);

  // Load workout for editing
  useEffect(() => {
    const loadWorkoutForEdit = async () => {
      if (!editWorkoutId) return;

      setLoadingWorkout(true);
      setIsEditMode(true);

      try {
        const workout = await WorkoutCreatorService.getWorkoutById(editWorkoutId);

        if (!workout) {
          toast.error('Workout not found');
          navigate('/modules/workout/my-workouts');
          return;
        }

        // Verify ownership
        if (workout.user_id !== user?.id) {
          toast.error('You can only edit your own workouts');
          navigate('/modules/workout/my-workouts');
          return;
        }

        // Pre-fill workout details
        setWorkoutName(workout.name);
        setWorkoutDescription(workout.description || '');
        setDifficulty(workout.difficulty);
        setIsPublic(workout.is_public);
        setHeroImageUrl(workout.hero_image_url || '');
        setSavedWorkoutId(workout.id);

        // Load exercises with their configurations
        if (workout.exercises && workout.exercises.length > 0) {
          const exercisesWithConfig: ExerciseWithConfig[] = workout.exercises.map((ex: any) => ({
            ...ex.exercise,
            sets: ex.sets,
            reps: ex.reps,
            rest_seconds: ex.rest_seconds,
            weight_suggestion: ex.weight_suggestion,
            notes: ex.notes || '',
            is_warmup: ex.is_warmup || false,
            is_cooldown: ex.is_cooldown || false,
            superset_group: ex.superset_group,
          }));
          setSelectedExercises(exercisesWithConfig);
        }

        // Set to exercises step
        setCurrentStep('exercises');
        toast.success('Workout loaded for editing');
      } catch (error) {
        console.error('Error loading workout:', error);
        toast.error('Failed to load workout');
        navigate('/modules/workout/my-workouts');
      } finally {
        setLoadingWorkout(false);
      }
    };

    loadWorkoutForEdit();
  }, [editWorkoutId, user, navigate]);

  // Restore workout details from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('workout-creator-details');
    if (saved) {
      try {
        const details = JSON.parse(saved);
        if (details.workoutName) setWorkoutName(details.workoutName);
        if (details.workoutDescription) setWorkoutDescription(details.workoutDescription);
        if (details.difficulty) setDifficulty(details.difficulty);
        if (details.trainingType) setTrainingType(details.trainingType);
        if (details.isPublic !== undefined) setIsPublic(details.isPublic);
        if (details.heroImageUrl) setHeroImageUrl(details.heroImageUrl);
        if (details.heroImagePreview) setHeroImagePreview(details.heroImagePreview);
        if (details.heroImagePath) setHeroImagePath(details.heroImagePath);
      } catch (error) {
        console.error('Error restoring workout details:', error);
      }
    }
  }, []);

  // Load exercises from navigation state
  useEffect(() => {
    if (location.state?.selectedExercises) {
      const exercises = location.state.selectedExercises as Exercise[];
      const exercisesWithConfig: ExerciseWithConfig[] = exercises.map((ex) => ({
        ...ex,
        sets: 3,
        reps: '12',
        rest_seconds: 60,
        notes: '',
        is_warmup: false,
        is_cooldown: false,
      }));
      setSelectedExercises(exercisesWithConfig);
      setCurrentStep('configure');
    }
  }, [location.state]);

  // Persist workout details to sessionStorage
  useEffect(() => {
    if (workoutName || workoutDescription || heroImageUrl) {
      const workoutDetails = {
        workoutName,
        workoutDescription,
        difficulty,
        trainingType,
        isPublic,
        heroImageUrl,
        heroImagePreview,
        heroImagePath,
      };
      sessionStorage.setItem('workout-creator-details', JSON.stringify(workoutDetails));
    }
  }, [workoutName, workoutDescription, difficulty, trainingType, isPublic, heroImageUrl, heroImagePreview, heroImagePath]);

  // Calculate workout stats
  const calculateStats = () => {
    const totalExercises = selectedExercises.length;
    const totalSets = selectedExercises.reduce((sum, ex) => sum + ex.sets, 0);

    // Calculate estimated duration
    const duration = selectedExercises.reduce((total, ex) => {
      const workTime = ex.sets * 45; // ~45 seconds per set
      const restTime = ex.sets * ex.rest_seconds;
      return total + workTime + restTime;
    }, 0);
    const durationMinutes = Math.round(duration / 60);

    // Estimate calories (rough: 5 cal/min for moderate intensity)
    const calories = Math.round(durationMinutes * 5);

    // Get muscle groups
    const muscleGroups = new Set<string>();
    selectedExercises.forEach((ex) => {
      if (Array.isArray(ex.primary_muscles)) {
        ex.primary_muscles.forEach((m) => muscleGroups.add(m));
      }
    });

    return {
      totalExercises,
      totalSets,
      durationMinutes,
      calories,
      muscleGroups: Array.from(muscleGroups),
    };
  };

  const stats = calculateStats();

  // Handle adding exercises
  const handleAddExercises = () => {
    haptic.light();
    navigate('/modules/workout/workout-creator/select-exercises', {
      state: { selectedExercises },
    });
  };

  // Handle exercise configuration
  const handleConfigureExercise = (index: number) => {
    haptic.light();
    setCurrentExerciseIndex(index);
    setShowConfigSheet(true);
  };

  // Handle quick preset selection
  const applyQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    if (currentExerciseIndex === null) return;

    haptic.medium();
    const updated = [...selectedExercises];
    updated[currentExerciseIndex] = {
      ...updated[currentExerciseIndex],
      sets: preset.sets,
      reps: preset.reps,
      rest_seconds: preset.rest,
    };
    setSelectedExercises(updated);
  };

  // Update current exercise config
  const updateCurrentExercise = (updates: Partial<ExerciseWithConfig>) => {
    if (currentExerciseIndex === null) return;

    const updated = [...selectedExercises];
    updated[currentExerciseIndex] = {
      ...updated[currentExerciseIndex],
      ...updates,
    };
    setSelectedExercises(updated);
  };

  // Delete exercise
  const handleDeleteExercise = (index: number) => {
    haptic.heavy();
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle hero image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    haptic.light();

    try {
      // Show preview immediately
      const previewUrl = await ImageUploadService.fileToDataUrl(file);
      setHeroImagePreview(previewUrl);

      // Compress and upload
      const compressedFile = await ImageUploadService.compressImage(file);
      const result = await ImageUploadService.uploadWorkoutHeroImage(compressedFile, user.id);

      if (result) {
        setHeroImageUrl(result.url);
        setHeroImagePath(result.path);
        toast.success('Hero image uploaded!');
        haptic.success();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
      setHeroImagePreview('');
      haptic.error();
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove hero image
  const handleRemoveImage = async () => {
    if (heroImagePath) {
      await ImageUploadService.deleteWorkoutHeroImage(heroImagePath);
    }
    setHeroImageUrl('');
    setHeroImagePreview('');
    setHeroImagePath('');
    toast.success('Image removed');
    haptic.light();
  };

  // Save workout
  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      toast.error('Please enter a workout name first');
      setShowSummarySheet(false);
      setShowDetailsSheet(true);
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    setIsSaving(true);
    haptic.medium();

    try {
      const workoutData: WorkoutFormData = {
        name: workoutName,
        description: workoutDescription,
        difficulty,
        trainingType: trainingType || undefined,
        tags: [],
        hero_image_url: heroImageUrl || undefined,
        is_public: isPublic,
        exercises: selectedExercises.map((ex) => ({
          exercise_id: ex.id,
          sets: ex.sets,
          reps: ex.reps,
          weight_suggestion: ex.weight_suggestion,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes,
          is_warmup: ex.is_warmup,
          is_cooldown: ex.is_cooldown,
          superset_group: ex.superset_group,
        })),
      };

      let savedWorkout;

      if (isEditMode && savedWorkoutId) {
        // Update existing workout
        savedWorkout = await WorkoutCreatorService.updateWorkout(savedWorkoutId, workoutData, user?.id);
        toast.success('Workout updated successfully!');
      } else {
        // Create new workout
        savedWorkout = await WorkoutCreatorService.createWorkout(workoutData, user?.id);
        toast.success('Workout created successfully!');
      }

      if (savedWorkout) {
        haptic.success();
        setSavedWorkoutId(savedWorkout.id);
        setShowSummarySheet(false);

        // Clear sessionStorage
        sessionStorage.removeItem('workout-creator-details');

        if (isEditMode) {
          // Navigate back to My Workouts after editing
          navigate('/modules/workout/my-workouts');
        } else {
          // Navigate to success screen for new workouts
          setCurrentStep('success');
        }
      } else {
        throw new Error(isEditMode ? 'Failed to update workout' : 'Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      haptic.error();
      toast.error('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Render based on current step
  const renderStartScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-center justify-center px-6 py-12">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-orange-600/20"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2), rgba(251, 146, 60, 0.2))',
              'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(251, 146, 60, 0.2), rgba(6, 182, 212, 0.2))',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center"
          >
            <Dumbbell className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Create Your
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              Perfect Workout
            </span>
          </h1>

          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            Build custom workouts, share with the community, and track your progress
          </p>

          {/* Quick Stats */}
          <div className="flex justify-center gap-4 mb-12">
            {[
              { icon: Dumbbell, label: 'Custom Sets', color: 'from-cyan-500 to-blue-600' },
              { icon: Target, label: 'Target Muscles', color: 'from-purple-500 to-pink-600' },
              { icon: Trophy, label: 'Share Public', color: 'from-orange-500 to-red-600' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-white/60">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Action */}
      <div className="p-6 bg-gradient-to-t from-black to-transparent">
        <motion.button
          onClick={() => {
            haptic.medium();
            setShowDetailsSheet(true);
          }}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-6 h-6" />
          Start Building
        </motion.button>
      </div>
    </div>
  );

  const renderWorkoutBuilder = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-lg font-bold text-white">Build Workout</h1>

          <button
            onClick={() => {
              haptic.light();
              setShowDetailsSheet(true);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Workout Info Card */}
      <div className="px-4 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                {workoutName || 'Untitled Workout'}
              </h2>
              {workoutDescription && (
                <p className="text-sm text-white/60">{workoutDescription}</p>
              )}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
              difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {difficulty}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-black/30 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-cyan-400">{stats.totalExercises}</div>
              <div className="text-xs text-white/60">Exercises</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-purple-400">{stats.durationMinutes}m</div>
              <div className="text-xs text-white/60">Duration</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-400">{stats.calories}</div>
              <div className="text-xs text-white/60">Calories</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-400">{stats.totalSets}</div>
              <div className="text-xs text-white/60">Sets</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Exercise List */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Exercises ({selectedExercises.length})</h3>
          <button
            onClick={handleAddExercises}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white text-sm font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {selectedExercises.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-10 h-10 text-white/40" />
            </div>
            <p className="text-white/60 mb-4">No exercises added yet</p>
            <button
              onClick={handleAddExercises}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
            >
              Add Your First Exercise
            </button>
          </motion.div>
        ) : (
          <Reorder.Group
            axis="y"
            values={selectedExercises}
            onReorder={setSelectedExercises}
            className="space-y-3"
          >
            <AnimatePresence>
              {selectedExercises.map((exercise, index) => (
                <Reorder.Item
                  key={exercise.id}
                  value={exercise}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileDrag={{ scale: 1.05, zIndex: 100 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-5 h-5 text-white/40" />
                    </div>

                    {/* Exercise Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white mb-1 truncate">{exercise.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>{exercise.sets} × {exercise.reps}</span>
                        <span>•</span>
                        <span>{exercise.rest_seconds}s rest</span>
                      </div>
                      {(exercise.is_warmup || exercise.is_cooldown) && (
                        <div className="flex gap-1 mt-1">
                          {exercise.is_warmup && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                              Warm-up
                            </span>
                          )}
                          {exercise.is_cooldown && (
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                              Cool-down
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleConfigureExercise(index)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-cyan-400" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <motion.button
            onClick={() => {
              haptic.medium();
              setShowSummarySheet(true);
            }}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Check className="w-6 h-6" />
            Review & Save
          </motion.button>
        </div>
      )}
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center px-6 py-12">
      {/* Animated Success Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-cyan-600/20 to-purple-600/20"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(34, 197, 94, 0.2), rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2))',
            'linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2), rgba(34, 197, 94, 0.2))',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Check className="w-16 h-16 text-white" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl font-black text-white mb-4">
            Workout Saved! 🎉
          </h1>
          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            {isPublic
              ? "Your workout is now live in the community! Others can discover and use it."
              : "Your workout has been saved to your library."
            }
          </p>
        </motion.div>

        {/* Workout Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8 max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-4">{workoutName}</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <Dumbbell className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.totalExercises}</div>
              <div className="text-xs text-white/60">Exercises</div>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <Clock className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.durationMinutes}m</div>
              <div className="text-xs text-white/60">Duration</div>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <Zap className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.calories}</div>
              <div className="text-xs text-white/60">Calories</div>
            </div>
          </div>
        </motion.div>

        {/* Program Builder Promotion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6 max-w-md mx-auto"
        >
          <button
            onClick={() => {
              haptic.medium();
              navigate('/modules/workout/create-program');
            }}
            className="w-full p-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-2 border-purple-500/50 rounded-2xl hover:border-purple-400 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-bold text-sm mb-1">Build a Training Program</p>
                <p className="text-white/60 text-xs">Combine workouts into multi-week programs</p>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3 w-full max-w-md mx-auto"
        >
          {isPublic && (
            <motion.button
              onClick={() => {
                haptic.medium();
                navigate('/modules/workout/community');
              }}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-6 h-6" />
              View in Community
            </motion.button>
          )}

          <button
            onClick={() => {
              haptic.medium();
              navigate(`/modules/workout/workout-start/${savedWorkoutId}`);
            }}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-cyan-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6" />
            Start Workout Now
          </button>

          <button
            onClick={() => {
              haptic.light();
              navigate('/modules/workout');
            }}
            className="w-full py-3 bg-white/10 rounded-xl text-white font-semibold"
          >
            Back to Workouts
          </button>

          <button
            onClick={() => {
              haptic.light();
              // Reset form
              setWorkoutName('');
              setWorkoutDescription('');
              setSelectedExercises([]);
              setIsPublic(false);
              setSavedWorkoutId(null);
              setCurrentStep('start');
            }}
            className="w-full py-3 bg-white/5 rounded-xl text-white/60 font-semibold"
          >
            Create Another Workout
          </button>
        </motion.div>

        {/* Share Options (if public) */}
        {isPublic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8"
          >
            <p className="text-sm text-white/60 mb-3">Share with friends:</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  haptic.light();
                  // TODO: Implement share to social
                  toast.success('Share link copied!');
                }}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  return (
    <>
      {currentStep === 'start' && renderStartScreen()}
      {(currentStep === 'exercises' || currentStep === 'configure') && renderWorkoutBuilder()}
      {currentStep === 'success' && renderSuccessScreen()}

      {/* Workout Details Bottom Sheet */}
      <BottomSheet
        isOpen={showDetailsSheet}
        onClose={() => setShowDetailsSheet(false)}
        title="Workout Details"
        height="auto"
      >
        <div className="space-y-4 pb-4">
          {/* Workout Name */}
          <div>
            <label className="block text-white font-medium mb-2">Workout Name *</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Upper Body Strength"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">Description</label>
            <textarea
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              placeholder="Describe your workout..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 resize-none"
              maxLength={500}
            />
          </div>

          {/* Hero Image Upload */}
          <div>
            <label className="block text-white font-medium mb-2">Hero Image (Optional)</label>

            {heroImagePreview || heroImageUrl ? (
              <div className="relative group">
                <img
                  src={heroImagePreview || heroImageUrl}
                  alt="Workout hero"
                  className="w-full h-40 object-cover rounded-xl border border-white/20"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-semibold flex items-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Remove Image
                  </button>
                </div>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-white text-sm">Uploading...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
                <div className="w-full h-40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-cyan-400 hover:bg-white/5 transition-all">
                  {isUploadingImage ? (
                    <>
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-white/60 text-sm">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-medium">Upload Hero Image</p>
                        <p className="text-white/60 text-sm mt-1">JPG, PNG or WebP • Max 5MB</p>
                      </div>
                    </>
                  )}
                </div>
              </label>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-white font-medium mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {WORKOUT_DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => {
                    setDifficulty(diff.value);
                    haptic.light();
                  }}
                  className={`py-3 rounded-xl font-semibold transition-all ${
                    difficulty === diff.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Training Type */}
          <div>
            <label className="block text-white font-medium mb-2">Training Type (Optional)</label>
            <select
              value={trainingType}
              onChange={(e) => setTrainingType(e.target.value as TrainingType)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              style={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <option value="" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                Select a type...
              </option>
              {TRAINING_TYPES.map((type) => (
                <option key={type.value} value={type.value} style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {isPublic ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-white/60" />}
                <span className="font-medium text-white">Public Workout</span>
              </div>
              <p className="text-sm text-white/60">Share with the FitProve community</p>
            </div>
            <button
              onClick={() => {
                setIsPublic(!isPublic);
                haptic.light();
              }}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isPublic ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <motion.div
                animate={{ x: isPublic ? 26 : 2 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowDetailsSheet(false)}
              className="flex-1 py-3 bg-white/10 rounded-xl text-white font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!workoutName.trim()) {
                  toast.error('Please enter a workout name');
                  return;
                }
                haptic.medium();
                setShowDetailsSheet(false);
                setCurrentStep('exercises');
              }}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
            >
              Next
              <ChevronRight className="w-5 h-5 inline-block ml-1" />
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Exercise Configuration Bottom Sheet */}
      <BottomSheet
        isOpen={showConfigSheet}
        onClose={() => {
          setShowConfigSheet(false);
          setShowAdvanced(false);
        }}
        title={currentExerciseIndex !== null ? `Configure ${selectedExercises[currentExerciseIndex]?.name}` : 'Configure Exercise'}
        height="auto"
      >
        {currentExerciseIndex !== null && (
          <div className="space-y-4 pb-4">
            {/* Quick Presets */}
            <div>
              <label className="block text-white font-medium mb-2">Quick Presets</label>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyQuickPreset(preset)}
                    className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sets */}
            <div>
              <label className="block text-white font-medium mb-2">Sets</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    updateCurrentExercise({ sets: Math.max(1, selectedExercises[currentExerciseIndex].sets - 1) });
                    haptic.light();
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white text-xl font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={selectedExercises[currentExerciseIndex].sets}
                  onChange={(e) => updateCurrentExercise({ sets: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="flex-1 text-center py-3 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-bold focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    updateCurrentExercise({ sets: selectedExercises[currentExerciseIndex].sets + 1 });
                    haptic.light();
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white text-xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reps */}
            <div>
              <label className="block text-white font-medium mb-2">Reps</label>
              <input
                type="text"
                value={selectedExercises[currentExerciseIndex].reps}
                onChange={(e) => updateCurrentExercise({ reps: e.target.value })}
                placeholder="e.g., 12 or 8-12"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Rest Time */}
            <div>
              <label className="block text-white font-medium mb-2">Rest (seconds)</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    updateCurrentExercise({ rest_seconds: Math.max(0, selectedExercises[currentExerciseIndex].rest_seconds - 15) });
                    haptic.light();
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white text-xl font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={selectedExercises[currentExerciseIndex].rest_seconds}
                  onChange={(e) => updateCurrentExercise({ rest_seconds: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="flex-1 text-center py-3 bg-white/5 border border-white/20 rounded-xl text-white text-lg font-bold focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    updateCurrentExercise({ rest_seconds: selectedExercises[currentExerciseIndex].rest_seconds + 15 });
                    haptic.light();
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white text-xl font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-3 bg-white/5 rounded-xl text-white font-medium flex items-center justify-between px-4"
            >
              <span>Advanced Options</span>
              <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
                <ChevronRight className="w-5 h-5 transform rotate-90" />
              </motion.div>
            </button>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Weight Suggestion */}
                  <div>
                    <label className="block text-white font-medium mb-2">Suggested Weight (lbs)</label>
                    <input
                      type="number"
                      value={selectedExercises[currentExerciseIndex].weight_suggestion || ''}
                      onChange={(e) => updateCurrentExercise({ weight_suggestion: parseFloat(e.target.value) || undefined })}
                      placeholder="e.g., 135"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-white font-medium mb-2">Notes</label>
                    <textarea
                      value={selectedExercises[currentExerciseIndex].notes}
                      onChange={(e) => updateCurrentExercise({ notes: e.target.value })}
                      placeholder="Add notes about form, tempo, etc."
                      rows={2}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Exercise Tags */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExercises[currentExerciseIndex].is_warmup}
                        onChange={(e) => updateCurrentExercise({ is_warmup: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-white">Warm-up exercise</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExercises[currentExerciseIndex].is_cooldown}
                        onChange={(e) => updateCurrentExercise({ is_cooldown: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-white">Cool-down exercise</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  haptic.heavy();
                  handleDeleteExercise(currentExerciseIndex);
                  setShowConfigSheet(false);
                  setShowAdvanced(false);
                }}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => {
                  haptic.success();
                  setShowConfigSheet(false);
                  setShowAdvanced(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Summary & Save Bottom Sheet */}
      <BottomSheet
        isOpen={showSummarySheet}
        onClose={() => setShowSummarySheet(false)}
        title="Review Workout"
        height="full"
      >
        <div className="space-y-6 pb-4">
          {/* Workout Header */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl p-4 border border-cyan-400/30">
            <h3 className="text-2xl font-bold text-white mb-2">{workoutName}</h3>
            {workoutDescription && (
              <p className="text-white/70 mb-3">{workoutDescription}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {difficulty}
              </span>
              {trainingType && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-500/20 text-orange-400">
                  {TRAINING_TYPES.find(t => t.value === trainingType)?.label}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isPublic ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {isPublic ? 'Public' : 'Private'}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                <span className="text-white/60 text-sm">Exercises</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalExercises}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <span className="text-white/60 text-sm">Duration</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.durationMinutes}m</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-white/60 text-sm">Calories</span>
              </div>
              <div className="text-2xl font-bold text-white">~{stats.calories}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-green-400" />
                <span className="text-white/60 text-sm">Total Sets</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalSets}</div>
            </div>
          </div>

          {/* Muscle Groups */}
          {stats.muscleGroups.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-semibold">Target Muscles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.muscleGroups.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm capitalize"
                  >
                    {muscle.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Exercise List */}
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-cyan-400" />
              Exercises ({selectedExercises.length})
            </h4>
            <div className="space-y-2">
              {selectedExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-white/5 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{exercise.name}</div>
                    <div className="text-sm text-white/60">
                      {exercise.sets} × {exercise.reps} • {exercise.rest_seconds}s rest
                    </div>
                  </div>
                  {(exercise.is_warmup || exercise.is_cooldown) && (
                    <div className="flex flex-col gap-1">
                      {exercise.is_warmup && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                          Warm-up
                        </span>
                      )}
                      {exercise.is_cooldown && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                          Cool-down
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSaveWorkout}
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Save className="w-6 h-6" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Workout
                </>
              )}
            </button>

            <button
              onClick={() => setShowSummarySheet(false)}
              className="w-full py-3 bg-white/10 rounded-xl text-white font-semibold"
            >
              Back to Editing
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
