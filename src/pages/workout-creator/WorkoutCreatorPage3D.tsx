import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Save,
  Play,
  Plus,
  Settings,
  Zap,
  Trophy,
  Star,
  Sparkles,
  Flame,
  Activity,
  Users,
  Heart,
  Copy,
  Trash2,
  Grip,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Edit3,
  Image as ImageIcon,
  Tag,
  Eye,
  EyeOff,
  Shuffle,
  Target,
  Clock,
  Dumbbell,
  FileText,
  Upload,
  Download,
  Share2,
  Award,
  Layers,
  TrendingUp,
  Maximize2,
  Minimize2,
  Palette,
} from 'lucide-react';

import {
  Glass3DCard,
  HolographicButton,
  FloatingElement,
  ExerciseCard3D,
} from './WorkoutCreator3D';
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

// Particle System Component
const ParticleSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#00E5FF', '#B400FF', '#FF6B35'];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.3 }}
    />
  );
};

// 3D Hero Section Component
const Hero3D: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  return (
    <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-orange-600/20"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2), rgba(251, 146, 60, 0.2))',
            'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(251, 146, 60, 0.2), rgba(6, 182, 212, 0.2))',
            'linear-gradient(45deg, rgba(251, 146, 60, 0.2), rgba(6, 182, 212, 0.2), rgba(147, 51, 234, 0.2))',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating 3D Elements */}
      <div className="absolute inset-0">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-1/4 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl opacity-20 transform rotate-12" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <div className="absolute top-32 right-1/4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute bottom-32 left-1/3 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-lg opacity-20 transform -rotate-12" />
        </FloatingElement>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 mb-6 tracking-tight">
            {title}
          </h1>
          <motion.p
            className="text-2xl md:text-3xl text-white/80 font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Animated Icons */}
        <motion.div
          className="flex justify-center gap-8 mt-12"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {[Dumbbell, Target, Trophy, Zap].map((Icon, index) => (
            <FloatingElement key={index} delay={index * 0.2}>
              <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </FloatingElement>
          ))}
        </motion.div>
      </div>

      {/* 3D Border Effect */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm" />
    </div>
  );
};

// Enhanced Form Input Component
interface EnhancedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'number';
  icon?: React.ElementType;
  rows?: number;
  maxLength?: number;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon: Icon,
  rows = 3,
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Glass3DCard className="p-4" selected={isFocused}>
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-white" />
            </div>
          )}
          <label className="text-white font-medium">{label}</label>
        </div>

        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none backdrop-blur-sm"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all backdrop-blur-sm"
          />
        )}
      </Glass3DCard>
    </motion.div>
  );
};

// Enhanced Dropdown Component
interface EnhancedDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
  icon?: React.ElementType;
}

const EnhancedDropdown: React.FC<EnhancedDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <Glass3DCard className="p-4" selected={isOpen}>
        <div className="flex items-center gap-3 mb-3">
          {Icon && (
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon className="w-4 h-4 text-white" />
            </div>
          )}
          <label className="text-white font-medium">{label}</label>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-left text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all backdrop-blur-sm flex items-center justify-between"
          >
            <span>{selectedOption?.label || 'Select an option...'}</span>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </motion.div>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden z-50"
              >
                {options.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-white/60 mt-1">{option.description}</div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedOption?.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-cyan-500/10 border border-cyan-400/20 rounded-lg"
          >
            <p className="text-sm text-cyan-200">{selectedOption.description}</p>
          </motion.div>
        )}
      </Glass3DCard>
    </motion.div>
  );
};

// Stats Dashboard Component
const StatsDashboard: React.FC<{ exercises: WorkoutExerciseFormData[] }> = ({ exercises }) => {
  const calculateStats = () => {
    const totalExercises = exercises.length;
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const estimatedTime =
      exercises.reduce((sum, ex) => {
        const workTime = ex.sets * 45; // 45 seconds per set
        const restTime = ex.sets * ex.rest_seconds;
        return sum + workTime + restTime;
      }, 0) / 60; // Convert to minutes

    const muscleGroups = new Set(exercises.flatMap((ex) => ex.exercise?.primary_muscles || []))
      .size;

    return { totalExercises, totalSets, estimatedTime: Math.round(estimatedTime), muscleGroups };
  };

  const stats = calculateStats();

  const statItems = [
    {
      icon: Dumbbell,
      label: 'Exercises',
      value: stats.totalExercises,
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Target,
      label: 'Total Sets',
      value: stats.totalSets,
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: Clock,
      label: 'Est. Time',
      value: `${stats.estimatedTime}m`,
      color: 'from-orange-400 to-red-500',
    },
    {
      icon: Activity,
      label: 'Muscles',
      value: stats.muscleGroups,
      color: 'from-green-400 to-emerald-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8, rotateY: -45 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ scale: 1.05, rotateY: 5 }}
        >
          <Glass3DCard className="p-4 text-center">
            <FloatingElement delay={index * 0.3}>
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </FloatingElement>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
          </Glass3DCard>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Main Workout Creator Component
export function WorkoutCreatorPage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const location = useLocation();
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);

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

  // Load exercise library and existing workout data
  useEffect(() => {
    loadExerciseLibrary();
    if (editId) {
      loadWorkoutForEditing();
    }
  }, [editId]);

  // Handle selected exercises from exercise selection page
  useEffect(() => {
    if (location.state?.selectedExercises) {
      handleSelectedExercises(location.state.selectedExercises);
    }
  }, [location.state]);

  const loadExerciseLibrary = async () => {
    try {
      const result = await ExerciseService.getExercises();
      setExerciseLibrary(result.exercises);
    } catch (error) {
      console.error('Error loading exercise library:', error);
      toast.error('Failed to load exercise library');
    } finally {
      setLoadingExercises(false);
    }
  };

  const loadWorkoutForEditing = async () => {
    if (!editId) return;

    try {
      const workout = await WorkoutCreatorService.getWorkoutById(editId);
      if (workout) {
        setWorkoutData({
          name: workout.name || '',
          description: workout.description || '',
          difficulty: workout.difficulty || 'intermediate',
          trainingType: workout.trainingType,
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
    } catch (error) {
      console.error('Error loading workout:', error);
      toast.error('Failed to load workout');
    }
  };

  const handleSelectedExercises = (selectedExercises: Exercise[]) => {
    selectedExercises.forEach((exercise) => {
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
      toast.success(
        `${selectedExercises.length} exercise${selectedExercises.length > 1 ? 's' : ''} added to workout`
      );
    }

    navigate(location.pathname, { replace: true, state: {} });
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

      if (sessionError || !session?.user) {
        toast.error('Please sign in to save workouts');
        navigate('/signin');
        return;
      }

      let savedWorkout;
      if (editId) {
        // Update existing workout
        savedWorkout = await updateExistingWorkout(session.user.id);
      } else {
        // Create new workout
        savedWorkout = await WorkoutCreatorService.createWorkout(workoutData, session.user.id);
      }

      if (savedWorkout) {
        toast.success('Workout saved successfully!');
        navigate('/modules/workout/my-workouts');
      } else {
        toast.error('Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const updateExistingWorkout = async (userId: string) => {
    const { supabase } = await import('../../lib/supabase');

    // Update workout metadata
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
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Replace exercises
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

    return data;
  };

  const handleStartWorkout = async () => {
    if (!user?.id && !profile?.id) {
      toast.error('Please sign in to start workouts');
      return;
    }

    if (workoutData.exercises.length === 0) {
      toast.error('Please add exercises before starting workout');
      return;
    }

    if (workoutData.name.trim()) {
      await handleSaveWorkout();
    }

    toast.success('Workout execution coming soon!');
  };

  const updateExercise = (index: number, updates: Partial<WorkoutExerciseFormData>) => {
    const updatedExercises = [...workoutData.exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };
    setWorkoutData((prev) => ({ ...prev, exercises: updatedExercises }));
    setEditingExerciseIndex(null);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = workoutData.exercises.filter((_, i) => i !== index);
    setWorkoutData((prev) => ({ ...prev, exercises: updatedExercises }));
    toast.success('Exercise removed');
  };

  const duplicateExercise = (index: number) => {
    const exerciseToDuplicate = { ...workoutData.exercises[index] };
    const updatedExercises = [
      ...workoutData.exercises.slice(0, index + 1),
      exerciseToDuplicate,
      ...workoutData.exercises.slice(index + 1),
    ];
    setWorkoutData((prev) => ({ ...prev, exercises: updatedExercises }));
    toast.success('Exercise duplicated');
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

    setWorkoutData((prev) => ({ ...prev, exercises: sampleExercises }));
    toast.success('Sample exercises added');
  };

  const isWorkoutValid = workoutData.name.trim() && workoutData.exercises.length > 0;

  // Add exercises with details for rendering
  const exercisesWithDetails = workoutData.exercises.map((ex) => ({
    ...ex,
    exercise: exerciseLibrary.find((lib) => lib.id === ex.exercise_id),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Particle System */}
      <ParticleSystem />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <Hero3D
          title="Workout Creator"
          subtitle="Design the ultimate fitness experience with stunning 3D precision"
        />

        {/* Main Form Container */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {/* Workout Stats Dashboard */}
          <StatsDashboard exercises={workoutData.exercises} />

          {/* Workout Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Basic Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <EnhancedInput
                label="Workout Name"
                value={workoutData.name}
                onChange={(value) => setWorkoutData((prev) => ({ ...prev, name: value }))}
                placeholder="Enter an epic workout name..."
                icon={Edit3}
                maxLength={60}
              />

              <EnhancedInput
                label="Description"
                value={workoutData.description}
                onChange={(value) => setWorkoutData((prev) => ({ ...prev, description: value }))}
                placeholder="Describe your legendary workout..."
                type="textarea"
                icon={FileText}
                maxLength={200}
              />

              <EnhancedDropdown
                label="Difficulty Level"
                value={workoutData.difficulty}
                onChange={(value) =>
                  setWorkoutData((prev) => ({ ...prev, difficulty: value as any }))
                }
                options={WORKOUT_DIFFICULTIES}
                icon={Trophy}
              />
            </motion.div>

            {/* Right Column - Advanced Settings */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <EnhancedDropdown
                label="Training Type"
                value={workoutData.trainingType || ''}
                onChange={(value) =>
                  setWorkoutData((prev) => ({ ...prev, trainingType: value as TrainingType }))
                }
                options={[
                  { value: '', label: 'Select training type...', description: 'Choose your focus' },
                  ...TRAINING_TYPES,
                ]}
                icon={Target}
              />

              {/* Tags Input */}
              <Glass3DCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-white font-medium">Tags</label>
                </div>
                <input
                  type="text"
                  placeholder="strength, HIIT, legs (comma separated)"
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all backdrop-blur-sm"
                  value={workoutData.tags.join(', ')}
                  onChange={(e) =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      tags: e.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </Glass3DCard>

              {/* Visibility Toggle */}
              <Glass3DCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {workoutData.is_public ? (
                        <Eye className="w-4 h-4 text-white" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <label className="text-white font-medium">Visibility</label>
                  </div>
                  <motion.button
                    onClick={() =>
                      setWorkoutData((prev) => ({ ...prev, is_public: !prev.is_public }))
                    }
                    className={`relative w-16 h-8 rounded-full transition-colors ${
                      workoutData.is_public
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                        : 'bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ x: workoutData.is_public ? 32 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
                <p className="text-sm text-white/60 mt-2">
                  {workoutData.is_public
                    ? 'Public - Visible to everyone'
                    : 'Private - Only visible to you'}
                </p>
              </Glass3DCard>
            </motion.div>
          </div>

          {/* Exercises Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Glass3DCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Exercises</h2>
                    <p className="text-white/60">Build your perfect routine</p>
                  </div>
                  <div className="ml-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30">
                    <span className="text-cyan-300 font-semibold">
                      {workoutData.exercises.length} exercises
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <HolographicButton
                    onClick={() =>
                      navigate('/modules/workout/workout-creator/select-exercises', {
                        state: {
                          selectedExercises: exercisesWithDetails
                            .map((ex) => ex.exercise)
                            .filter(Boolean),
                        },
                      })
                    }
                    variant="primary"
                  >
                    <Plus className="w-5 h-5" />
                    Add Exercises
                  </HolographicButton>

                  {workoutData.exercises.length === 0 &&
                    !loadingExercises &&
                    exerciseLibrary.length > 0 && (
                      <HolographicButton onClick={addSampleExercises} variant="secondary">
                        <Shuffle className="w-5 h-5" />
                        Add Samples
                      </HolographicButton>
                    )}
                </div>
              </div>

              {/* Exercise List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {exercisesWithDetails.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-16"
                    >
                      <FloatingElement>
                        <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <Dumbbell className="w-12 h-12 text-white/40" />
                        </div>
                      </FloatingElement>
                      <h3 className="text-2xl font-bold text-white/60 mb-3">No exercises yet</h3>
                      <p className="text-white/40 mb-8">
                        Add some exercises to start building your workout
                      </p>
                      <HolographicButton
                        onClick={() =>
                          navigate('/modules/workout/workout-creator/select-exercises')
                        }
                        variant="primary"
                        size="lg"
                      >
                        <Plus className="w-6 h-6" />
                        Add Your First Exercise
                      </HolographicButton>
                    </motion.div>
                  ) : (
                    exercisesWithDetails.map((exercise, index) => (
                      <ExerciseCard3D
                        key={`${exercise.exercise_id}-${index}`}
                        exercise={exercise}
                        index={index}
                        isEditing={editingExerciseIndex === index}
                        onEdit={() =>
                          setEditingExerciseIndex(editingExerciseIndex === index ? null : index)
                        }
                        onUpdate={(updates) => updateExercise(index, updates)}
                        onDuplicate={() => duplicateExercise(index)}
                        onDelete={() => removeExercise(index)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Glass3DCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center mt-12"
          >
            <HolographicButton
              onClick={handleSaveWorkout}
              disabled={saving || !isWorkoutValid}
              variant="success"
              size="lg"
            >
              <Save className="w-6 h-6" />
              {saving ? 'Saving...' : 'Save Workout'}
            </HolographicButton>

            <HolographicButton
              onClick={handleStartWorkout}
              disabled={!isWorkoutValid}
              variant="primary"
              size="lg"
            >
              <Play className="w-6 h-6" />
              Start Workout
            </HolographicButton>

            <HolographicButton
              onClick={() =>
                navigate('/modules/workout/planner', {
                  state: { plannerAddWorkout: workoutData },
                })
              }
              disabled={!isWorkoutValid}
              variant="secondary"
              size="lg"
            >
              <Plus className="w-6 h-6" />
              Add to Planner
            </HolographicButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
