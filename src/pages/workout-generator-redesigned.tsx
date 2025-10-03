import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToTop } from '../utils/scroll';
import { useAuth } from '../contexts/AuthContext';
import { saveGeneratorWorkout } from '../lib/generator-workout.service';
import { Exercise } from '../types/exercise.types';
import { ExerciseService } from '../lib/exercise.service';
import {
  Interactive3DCard,
  FloatingProgressRing,
  AnimatedStepIndicator,
  ParticleSystem,
  HolographicButton,
} from '../components/ui/WorkoutGenerator3D';
import { GlassCard } from '../components/ui/GlassCard';
import { FloatingElements, Glass3DCard, GlowEffect } from '../components/ui/Advanced3D';
import {
  Sparkles,
  Target,
  Zap,
  Users,
  Heart,
  Trophy,
  Flame,
  ArrowRight,
  ArrowLeft,
  Save,
  Calendar,
  Play,
  Star,
  Dumbbell,
  Activity,
} from 'lucide-react';
import rawManFrontSvg from '../assets/man-front.svg?raw';
import rawManBackSvg from '../assets/man-back.svg?raw';

// Utility to strip width/height attributes from SVG root
function stripSvgSizeAttributes(svg: string) {
  return svg.replace(
    /(<svg\b[^>]*)(?:(?:\swidth="[^"]*")|(?:\sheight="[^"]*"))+([^>]*>)/gi,
    (_m, p1, p2) => `${p1}${p2}`
  );
}

const manFrontSvg = stripSvgSizeAttributes(rawManFrontSvg);
const manBackSvg = stripSvgSizeAttributes(rawManBackSvg);

// Muscle group types and mappings (keeping the existing logic)
type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abdominals'
  | 'obliques'
  | 'lowerBack'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'serratusAnterior';

const MUSCLE_MAP: Record<MuscleGroup, string[]> = {
  chest: ['muscle-0', 'muscle-24'],
  back: ['bMuscle-0', 'bMuscle-18', 'bMuscle-3', 'bMuscle-19', 'bMuscle-32', 'bMuscle-33'],
  shoulders: ['muscle-3', 'muscle-25', 'bMuscle-18', 'bMuscle-0'],
  biceps: ['muscle-41', 'muscle-19'],
  triceps: ['muscle-5', 'muscle-27', 'bMuscle-15', 'bMuscle-28'],
  forearms: ['muscle-6', 'muscle-28', 'muscle-22', 'muscle-44', 'bMuscle-29', 'bMuscle-16'],
  abdominals: [
    'muscle-10',
    'muscle-32',
    'muscle-33',
    'muscle-34',
    'muscle-35',
    'muscle-11',
    'muscle-12',
    'muscle-13',
  ],
  obliques: ['muscle-9', 'muscle-31', 'muscle-8', 'muscle-30'],
  lowerBack: ['bMuscle-4', 'bMuscle-34'],
  glutes: ['bMuscle-7', 'bMuscle-22', 'bMuscle-21', 'bMuscle-6'],
  quadriceps: [
    'muscle-21',
    'muscle-43',
    'muscle-23',
    'muscle-45',
    'muscle-20',
    'muscle-42',
    'bMuscle-36',
    'bMuscle-35',
    'bMuscle-38',
    'bMuscle-8',
  ],
  hamstrings: ['bMuscle-17', 'bMuscle-37'],
  calves: ['muscle-14', 'bMuscle-9', 'bMuscle-10', 'muscle-36', 'bMuscle-24', 'bMuscle-23'],
  serratusAnterior: ['muscle-7', 'muscle-29'],
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abdominals: 'Abdominals',
  obliques: 'Obliques',
  lowerBack: 'Lower Back',
  glutes: 'Glutes',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
  serratusAnterior: 'Serratus Anterior',
};

function getMuscleGroupByPathId(pathId: string): MuscleGroup | undefined {
  return (Object.keys(MUSCLE_MAP) as MuscleGroup[]).find((group) =>
    MUSCLE_MAP[group].includes(pathId)
  );
}

// Enhanced Muscle Map Selector with 3D effects
const Enhanced3DMuscleMapSelector: React.FC<{
  value: MuscleGroup[];
  onChange: (muscles: MuscleGroup[]) => void;
}> = ({ value, onChange }) => {
  function getHighlightedSvg(svg: string) {
    let highlightedSvg = svg;
    Object.entries(MUSCLE_MAP).forEach(([group, ids]) => {
      if (value.includes(group as MuscleGroup)) {
        ids.forEach((id) => {
          const regex = new RegExp(
            `<path([^>]*\\bid=['"]${id}['"][^>]*)fill=['"][^'"]*['"]([^>]*)>`,
            'g'
          );
          highlightedSvg = highlightedSvg.replace(
            regex,
            `<path$1fill="url(#muscleGradient)"$2 style="filter: drop-shadow(0 0 8px #00E5FF);">`
          );
        });
      }
    });
    return highlightedSvg;
  }

  function handleSvgClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as Element;
    if (target && target.tagName.toLowerCase() === 'path') {
      const pathId = (target as SVGPathElement).id;
      if (pathId) {
        const group = getMuscleGroupByPathId(pathId);
        if (group) {
          onChange(value.includes(group) ? value.filter((g) => g !== group) : [...value, group]);
        }
      }
    }
  }

  return (
    <GlowEffect color="cyan" intensity="high">
      <Glass3DCard className="p-8 bg-gradient-to-br from-white/20 to-white/5">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Target Muscle Groups
          </h3>
          <p className="text-white/70">Click on the body or select from buttons below</p>
        </div>

        {/* 3D Muscle Maps */}
        <div className="flex justify-center items-end gap-8 mb-6">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h4 className="text-lg font-semibold text-white/90 mb-3">Front View</h4>
            <div
              className="relative cursor-pointer select-none bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border border-white/20 hover:border-primary/50 transition-all duration-300"
              onClick={handleSvgClick}
              dangerouslySetInnerHTML={{
                __html:
                  getHighlightedSvg(manFrontSvg) +
                  `
                <defs>
                  <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00E5FF" />
                    <stop offset="50%" stop-color="#B400FF" />
                    <stop offset="100%" stop-color="#FF6B35" />
                  </linearGradient>
                </defs>
              `,
              }}
            />
          </motion.div>

          <motion.div
            className="text-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h4 className="text-lg font-semibold text-white/90 mb-3">Back View</h4>
            <div
              className="relative cursor-pointer select-none bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-4 border border-white/20 hover:border-primary/50 transition-all duration-300"
              onClick={handleSvgClick}
              dangerouslySetInnerHTML={{ __html: getHighlightedSvg(manBackSvg) }}
            />
          </motion.div>
        </div>

        {/* Interactive Muscle Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {(Object.keys(MUSCLE_MAP) as MuscleGroup[]).map((group) => (
            <motion.button
              key={group}
              className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                value.includes(group)
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
              onClick={() =>
                onChange(
                  value.includes(group) ? value.filter((g) => g !== group) : [...value, group]
                )
              }
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              animate={
                value.includes(group)
                  ? {
                      boxShadow: [
                        '0 0 20px rgba(0,229,255,0.3)',
                        '0 0 30px rgba(0,229,255,0.6)',
                        '0 0 20px rgba(0,229,255,0.3)',
                      ],
                    }
                  : {}
              }
              transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
            >
              {MUSCLE_LABELS[group]}
              {value.includes(group) && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Star className="w-2 h-2 text-white fill-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Selection Summary */}
        <motion.div
          className="text-center p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-white/20"
          animate={{ scale: value.length > 0 ? 1 : 0.95 }}
        >
          <p className="text-white font-semibold">
            <Zap className="w-4 h-4 inline mr-2 text-accent" />
            Selected: {value.length ? value.map((g) => MUSCLE_LABELS[g]).join(', ') : 'None'}
          </p>
        </motion.div>
      </Glass3DCard>
    </GlowEffect>
  );
};

// Enhanced selection data with icons and better visuals
const steps = ['Gender', 'Age', 'Goal', 'Level', 'Equipment', 'Muscles', 'Generate'] as const;

const genderOptions = [
  {
    value: 'male',
    src: '/images/male_selection.webp',
    label: 'Male',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'female',
    src: '/images/female_selection.webp',
    label: 'Female',
    icon: Heart,
    gradient: 'from-pink-500 to-purple-500',
  },
];

const goalOptions = [
  {
    value: 'buildmuscle',
    label: 'Build Muscle',
    description: 'Gain strength and muscle mass',
    icon: Dumbbell,
    gradient: 'from-red-500 to-orange-500',
    src: { male: '/images/buildmuscle_men.webp', female: '/images/buildmuscle_women.webp' },
  },
  {
    value: 'endurance',
    label: 'Endurance',
    description: 'Improve cardiovascular fitness',
    icon: Activity,
    gradient: 'from-green-500 to-emerald-500',
    src: { male: '/images/endurance_male.webp', female: '/images/endurance_female.webp' },
  },
  {
    value: 'getfitter',
    label: 'Get Fitter',
    description: 'Overall fitness improvement',
    icon: Target,
    gradient: 'from-blue-500 to-indigo-500',
    src: { male: '/images/getfitter_male.webp', female: '/images/getfitter_female.webp' },
  },
  {
    value: 'weightloss',
    label: 'Weight Loss',
    description: 'Burn calories and lose weight',
    icon: Flame,
    gradient: 'from-orange-500 to-yellow-500',
    src: { male: '/images/losefat_male.webp', female: '/images/losefat_female.webp' },
  },
];

const levelOptions = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to fitness training',
    gradient: 'from-green-400 to-green-600',
    src: { male: '/images/beginner_male.webp', female: '/images/beginner_female.webp' },
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some fitness experience',
    gradient: 'from-yellow-400 to-orange-500',
    src: { male: '/images/Intermediate_male.webp', female: '/images/Intermediate_female.webp' },
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Experienced fitness enthusiast',
    gradient: 'from-red-500 to-purple-600',
    src: { male: '/images/Advanced_male.webp', female: '/images/Advanced_female.webp' },
  },
];

const equipmentOptions = [
  { value: 'bodyweight', src: '/images/noequipment.webp', label: 'Bodyweight', icon: '🏃' },
  { value: 'barbell', src: '/images/barbell.webp', label: 'Barbell', icon: '🏋️' },
  { value: 'bench', src: '/images/bench.webp', label: 'Bench', icon: '🪑' },
  { value: 'dumbbells', src: '/images/dumbbells.webp', label: 'Dumbbells', icon: '💪' },
  { value: 'kettlebell', src: '/images/kettlebell.webp', label: 'Kettlebell', icon: '⚡' },
  { value: 'pullupbar', src: '/images/Pull-up Bar.webp', label: 'Pull-up Bar', icon: '🔗' },
  {
    value: 'resistancebands',
    src: '/images/resistance Bands.webp',
    label: 'Resistance Bands',
    icon: '🔄',
  },
];

const WorkoutGenerator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const navigate = useNavigate();

  // State management
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState<number>(25);
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [muscles, setMuscles] = useState<MuscleGroup[]>([]);
  const [workout, setWorkout] = useState<Exercise[]>([]);
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState<boolean>(true);

  const workoutListRef = useRef<HTMLDivElement | null>(null);

  // Progress calculation
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  // Fetch exercises on mount
  useEffect(() => {
    let mounted = true;
    setLoadingExercises(true);
    const fetchAllExercises = async () => {
      let all: Exercise[] = [];
      let page = 1;
      const pageSize = 500;
      let keepGoing = true;
      try {
        while (keepGoing) {
          const result = await (ExerciseService as any).getExercises?.({ page, pageSize });
          const exercises: Exercise[] = result?.exercises ?? [];
          all = all.concat(exercises);
          if (exercises.length < pageSize) {
            keepGoing = false;
          } else {
            page++;
          }
        }
        if (mounted) setAllExercises(all);
      } catch {
        if (mounted) setAllExercises([]);
      } finally {
        if (mounted) setLoadingExercises(false);
      }
    };
    fetchAllExercises();
    return () => {
      mounted = false;
    };
  }, []);

  // Navigation functions
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Scroll to top on step change
  useEffect(() => {
    scrollToTop('smooth');
  }, [step]);

  // Equipment selection handler
  const handleEquipmentClick = (value: string) => {
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  // Workout generation logic
  const generateWorkout = () => {
    let filtered = allExercises.filter((ex) => {
      const primary = (ex as any).primary_muscles as string[] | undefined;
      const secondary = (ex as any).secondary_muscles as string[] | undefined;
      return muscles.some((muscle) => primary?.includes(muscle) || secondary?.includes(muscle));
    });

    if (equipment.length > 0) {
      filtered = filtered.filter((ex) => {
        const eq = (ex as any).equipment as string[] | undefined;
        return Array.isArray(eq) && eq.some((e) => equipment.includes(e));
      });
    }

    if (level) {
      filtered = filtered.filter((ex) => (ex as any).difficulty === level);
    }

    if (goal) {
      filtered = filtered.filter((ex) => {
        const cat = ((ex as any).category || '').toString().toLowerCase();
        if (goal === 'buildmuscle') return cat === 'strength';
        return cat === 'cardio' || cat === 'endurance' || cat === 'strength';
      });
    }

    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(6, shuffled.length));
    setWorkout(selected);

    setTimeout(() => {
      if (workoutListRef.current) {
        workoutListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  // Save workout handlers
  const handleSaveToPlanner = () => {
    if (!workout.length) return;
    const plannerAddWorkout = {
      name: `Generated Workout (${goal || 'Custom'})`,
      description: '',
      trainingType: goal || 'Other',
      hero_image_url: '',
      tags: [] as string[],
      exercises: workout,
      duration: 0,
    };
    navigate('/modules/workout/planner', { state: { plannerAddWorkout } });
  };

  const handleSaveWorkout = async () => {
    if (!workout.length) return;
    if (isLoading) {
      alert('Checking login status, please wait...');
      return;
    }
    if (!user) {
      alert('You must be logged in to save workouts.');
      setSaveStatus('idle');
      return;
    }
    setSaveStatus('saving');
    const workoutName = `Generated Workout (${goal || 'Custom'})`;
    const meta = { gender, age, goal, level, equipment, muscles };
    try {
      await saveGeneratorWorkout({
        name: workoutName,
        exercises: workout,
        meta,
        user_id: (user as any).id ?? user,
      });
      setSaveStatus('saved');
    } catch (_e) {
      alert('Failed to save workout.');
      setSaveStatus('idle');
    }
  };

  // Step validation
  const canContinue = () => {
    switch (step) {
      case 0:
        return !!gender;
      case 1:
        return !!age && age >= 12 && age <= 80;
      case 2:
        return !!goal;
      case 3:
        return !!level;
      case 4:
        return equipment.length > 0;
      case 5:
        return muscles.length > 0;
      default:
        return true;
    }
  };

  // Step content renderer
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <motion.h2
                className="text-4xl font-bold text-white mb-4"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Choose Your Gender
              </motion.h2>
              <p className="text-xl text-white/80 mb-8">Let's personalize your fitness journey</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {genderOptions.map((option) => (
                <Interactive3DCard
                  key={option.value}
                  selected={gender === option.value}
                  onClick={() => setGender(option.value)}
                  className="aspect-[4/5] overflow-hidden"
                  glowColor={option.value === 'female' ? '#B400FF' : '#00E5FF'}
                >
                  <div className="relative h-full flex flex-col">
                    <img
                      src={option.src}
                      alt={option.label}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-2xl" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <option.icon className="w-8 h-8 text-white mb-2" />
                      <h3 className="text-2xl font-bold text-white">{option.label}</h3>
                    </div>
                  </div>
                </Interactive3DCard>
              ))}
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            className="space-y-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">What's Your Age?</h2>
              <p className="text-xl text-white/80 mb-8">
                We'll adjust your workout intensity accordingly
              </p>
            </div>

            <GlowEffect color="cyan" intensity="medium">
              <Glass3DCard className="p-8 text-center">
                <div className="space-y-8">
                  <motion.div
                    className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5 }}
                    key={age}
                  >
                    {age} years
                  </motion.div>

                  <div className="relative">
                    <input
                      type="range"
                      min={12}
                      max={80}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #00E5FF 0%, #B400FF ${((age - 12) / (80 - 12)) * 100}%, rgba(255,255,255,0.2) ${((age - 12) / (80 - 12)) * 100}%)`,
                      }}
                    />
                    <div className="flex justify-between text-sm text-white/60 mt-2">
                      <span>12</span>
                      <span>80</span>
                    </div>
                  </div>
                </div>
              </Glass3DCard>
            </GlowEffect>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">What's Your Goal?</h2>
              <p className="text-xl text-white/80 mb-8">Define your fitness objective</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {goalOptions.map((option) => (
                <Interactive3DCard
                  key={option.value}
                  selected={goal === option.value}
                  onClick={() => setGoal(option.value)}
                  className="aspect-[4/5] overflow-hidden"
                >
                  <div className="relative h-full flex flex-col">
                    <img
                      src={option.src[gender ?? 'male']}
                      alt={option.label}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent rounded-2xl" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <option.icon className="w-8 h-8 text-white mb-3" />
                      <h3 className="text-2xl font-bold text-white mb-2">{option.label}</h3>
                      <p className="text-white/80 text-sm">{option.description}</p>
                    </div>
                  </div>
                </Interactive3DCard>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Fitness Level</h2>
              <p className="text-xl text-white/80 mb-8">How experienced are you with fitness?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {levelOptions.map((option) => (
                <Interactive3DCard
                  key={option.value}
                  selected={level === option.value}
                  onClick={() => setLevel(option.value)}
                  className="aspect-[3/4] overflow-hidden"
                >
                  <div className="relative h-full flex flex-col">
                    <img
                      src={option.src[gender ?? 'male']}
                      alt={option.label}
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent rounded-2xl" />
                    <div className="relative z-10 h-full flex flex-col justify-end p-6">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${option.gradient} flex items-center justify-center mb-3`}
                      >
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{option.label}</h3>
                      <p className="text-white/80 text-sm">{option.description}</p>
                    </div>
                  </div>
                </Interactive3DCard>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">Available Equipment</h2>
              <p className="text-xl text-white/80 mb-8">Select all equipment you have access to</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {equipmentOptions.map((option) => (
                <Interactive3DCard
                  key={option.value}
                  selected={equipment.includes(option.value)}
                  onClick={() => handleEquipmentClick(option.value)}
                  className="aspect-square overflow-hidden"
                >
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <img
                      src={option.src}
                      alt={option.label}
                      className="w-16 h-16 object-contain mb-4"
                    />
                    <div className="text-4xl mb-2">{option.icon}</div>
                    <h3 className="text-lg font-bold text-white text-center">{option.label}</h3>
                  </div>
                </Interactive3DCard>
              ))}
            </div>

            {equipment.length > 0 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-white/80">
                  <Zap className="w-5 h-5 inline mr-2 text-accent" />
                  {equipment.length} equipment type{equipment.length !== 1 ? 's' : ''} selected
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Enhanced3DMuscleMapSelector value={muscles} onChange={setMuscles} />
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            className="space-y-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-8">
              <motion.h2
                className="text-4xl font-bold text-white mb-4"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 inline mr-3 text-accent" />
                Ready to Generate!
              </motion.h2>
              <p className="text-xl text-white/80">
                Your personalized workout is just one click away
              </p>
            </div>

            {/* Summary Preview */}
            <GlowEffect color="purple" intensity="high">
              <Glass3DCard className="p-8 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-white">
                        <strong>Gender:</strong> {gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-secondary" />
                      <span className="text-white">
                        <strong>Age:</strong> {age} years
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-accent" />
                      <span className="text-white">
                        <strong>Goal:</strong> {goal}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="text-white">
                        <strong>Level:</strong> {level}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Dumbbell className="w-5 h-5 text-secondary" />
                      <span className="text-white">
                        <strong>Equipment:</strong> {equipment.length} types
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-accent" />
                      <span className="text-white">
                        <strong>Muscles:</strong> {muscles.length} groups
                      </span>
                    </div>
                  </div>
                </div>
              </Glass3DCard>
            </GlowEffect>

            {/* Generate Button */}
            <HolographicButton
              onClick={() => {
                setHasTriedGenerate(true);
                generateWorkout();
              }}
              size="lg"
              className="mx-auto"
              glowIntensity="high"
            >
              <Zap className="w-6 h-6 mr-2" />
              Generate My Workout
              <Sparkles className="w-6 h-6 ml-2" />
            </HolographicButton>

            {/* Generated Workout Display */}
            {loadingExercises ? (
              <motion.div
                className="mt-12"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-white text-xl">Loading exercises...</div>
              </motion.div>
            ) : workout.length > 0 ? (
              <motion.div
                ref={workoutListRef}
                className="mt-12 space-y-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    <Trophy className="w-8 h-8 inline mr-3 text-accent" />
                    Your Generated Workout
                  </h3>
                  <p className="text-white/80">Perfectly tailored to your preferences</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                  {workout.map((exercise, index) => (
                    <motion.div
                      key={(exercise as any).id ?? `${(exercise as any).name}-${index}`}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <GlowEffect color={index % 2 === 0 ? 'cyan' : 'purple'} intensity="medium">
                        <Glass3DCard className="h-full">
                          <div className="p-6 text-center space-y-4">
                            {(exercise as any).image_url ? (
                              <img
                                src={(exercise as any).image_url}
                                alt={(exercise as any).name}
                                className="w-24 h-24 mx-auto rounded-xl object-cover border-2 border-white/20"
                              />
                            ) : (
                              <div className="w-24 h-24 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-white/20">
                                <Dumbbell className="w-8 h-8 text-white" />
                              </div>
                            )}

                            <div>
                              <h4 className="text-lg font-bold text-white mb-1">
                                {(exercise as any).name}
                              </h4>
                              <p className="text-sm text-white/60 capitalize">
                                ({(exercise as any).difficulty})
                              </p>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="text-primary">
                                <strong>Primary:</strong>{' '}
                                {((exercise as any).primary_muscles ?? []).join(', ')}
                              </div>
                              {((exercise as any).secondary_muscles ?? []).length > 0 && (
                                <div className="text-secondary">
                                  <strong>Secondary:</strong>{' '}
                                  {((exercise as any).secondary_muscles ?? []).join(', ')}
                                </div>
                              )}
                              <div className="text-accent">
                                <strong>Equipment:</strong>{' '}
                                {((exercise as any).equipment ?? []).join(', ')}
                              </div>
                              <div className="text-white/80">
                                <strong>Sets:</strong> {(exercise as any).recommended_sets ?? 3} |
                                <strong> Reps:</strong>{' '}
                                {(exercise as any).recommended_reps ?? '8-12'}
                              </div>
                            </div>

                            {(exercise as any).youtube_id && (
                              <a
                                href={`https://youtube.com/watch?v=${(exercise as any).youtube_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-secondary transition-colors"
                              >
                                <Play className="w-4 h-4" />
                                Watch Demo
                              </a>
                            )}
                          </div>
                        </Glass3DCard>
                      </GlowEffect>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <HolographicButton
                    onClick={handleSaveWorkout}
                    disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                    variant="primary"
                    size="lg"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {saveStatus === 'idle' && 'Save Workout'}
                    {saveStatus === 'saving' && 'Saving...'}
                    {saveStatus === 'saved' && 'Saved!'}
                  </HolographicButton>

                  <HolographicButton onClick={handleSaveToPlanner} variant="secondary" size="lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    Add to Planner
                  </HolographicButton>
                </div>

                {saveStatus === 'saved' && (
                  <motion.div
                    className="text-center text-accent font-semibold"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ✨ Workout saved to My Workouts!
                  </motion.div>
                )}
              </motion.div>
            ) : hasTriedGenerate ? (
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-red-400 text-xl font-semibold">
                  No exercises found for your selection.
                  <br />
                  Try adjusting your equipment, level, or muscle choices.
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary relative overflow-hidden">
      {/* Background Effects */}
      <ParticleSystem />
      <FloatingElements />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            Workout Generator
          </motion.h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Create your perfect workout with AI-powered personalization
          </p>
        </motion.div>

        {/* Progress Ring and Step Indicator */}
        <div className="flex flex-col items-center mb-12">
          <FloatingProgressRing progress={progress} className="mb-8" />
          <AnimatedStepIndicator
            steps={steps}
            currentStep={step}
            onStepClick={(stepIndex) => {
              if (stepIndex <= step) setStep(stepIndex);
            }}
          />
        </div>

        {/* Step Content */}
        <div className="min-h-[600px] mb-8">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {step < steps.length - 1 && (
          <motion.div
            className="flex justify-center gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {step > 0 && (
              <HolographicButton onClick={prevStep} variant="secondary" size="lg">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </HolographicButton>
            )}

            <HolographicButton
              onClick={nextStep}
              disabled={!canContinue()}
              size="lg"
              glowIntensity={canContinue() ? 'high' : 'low'}
            >
              {step === steps.length - 2 ? 'Generate' : 'Next'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </HolographicButton>
          </motion.div>
        )}
      </div>

      {/* Custom Styles for Enhanced Effects */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #00E5FF, #B400FF);
          cursor: pointer;
          box-shadow: 0 0 20px rgba(0,229,255,0.5);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #00E5FF, #B400FF);
          cursor: pointer;
          box-shadow: 0 0 20px rgba(0,229,255,0.5);
          border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default WorkoutGenerator;
