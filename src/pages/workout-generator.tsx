import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useGenerateWorkout, WorkoutGenerationParams } from '../hooks/useGenerateWorkout';
import { ExerciseService } from '../lib/exercise.service';
import { Exercise, MuscleGroup } from '../types/exercise.types';
import { MuscleMapSelector } from '../components/ui/MuscleMapSelector';
import { useUserHistory } from '../hooks/useUserHistory';
import { useSaveWorkout } from '../hooks/useSaveWorkout';
import { useNavigate } from 'react-router-dom';
import { buildPlannerSchedulePayload } from '../lib/planner-payload';
import { SaveTemplateModal } from '../components/ui/SaveTemplateModal';
import { TemplateModal } from '../components/ui/TemplateModal';
import { useAuth } from '../contexts/AuthContext';
import type { WorkoutTemplate } from '../types/template.types';
import toast from 'react-hot-toast';

/* ----------------------------- Types & Data ------------------------------ */

type GenderOption = 'male' | 'female' | 'non-binary' | 'prefer-not';

interface WorkoutPreferences {
  gender: GenderOption | null;
  age: number;
  goal: string;
  eventType?: string;
  eventDate?: Date;
  experienceLevel: string;
  equipment: string[];
  duration: number;
  frequency: {
    days: string[];
    preferredTime?: string;
  };
  limitations: string[];
  workoutStyle: string;
  music?: string;
  tracking: {
    social: boolean;
    metrics: string[];
  };
  muscles: string[];
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string;
  recommendedFrequency: number;
  minDuration: number;
  equipment: string[];
  tips: string[];
}

const EVENTS: EventItem[] = [
  {
    id: 'hyrox',
    title: 'HYROX',
    description: 'High-intensity race combining running with functional workouts',
    image: '/images/creator-flow/event-hyrox.webp',
    recommendedFrequency: 4,
    minDuration: 45,
    equipment: ['sled', 'rower', 'skierg', 'sandbag', 'wallballs'],
    tips: ['Focus on endurance', 'Practice transitions', 'Build pulling strength'],
  },
  {
    id: 'spartan',
    title: 'Spartan Race',
    description: 'Obstacle course race testing strength and endurance',
    image: '/images/creator-flow/event-spartan.webp',
    recommendedFrequency: 4,
    minDuration: 45,
    equipment: ['pull-up-bar', 'rope', 'weights'],
    tips: ['Build grip strength', 'Practice climbing', 'Improve running endurance'],
  },
  {
    id: 'marathon',
    title: 'Marathon',
    description: '26.2 mile endurance running event',
    image: '/images/creator-flow/event-marathon.webp',
    recommendedFrequency: 5,
    minDuration: 60,
    equipment: ['running-shoes'],
    tips: ['Build weekly mileage', 'Include recovery runs', 'Practice nutrition'],
  },
  {
    id: 'triathlon',
    title: 'Triathlon',
    description: 'Multi-sport event combining swimming, cycling, and running',
    image: '/images/creator-flow/event-triathlon.webp',
    recommendedFrequency: 6,
    minDuration: 60,
    equipment: ['bike', 'swim-gear', 'running-shoes'],
    tips: ['Practice transitions', 'Build discipline endurance', 'Focus on weakest sport'],
  },
  {
    id: 'crossfit',
    title: 'CrossFit Competition',
    description: 'High-intensity functional fitness competition',
    image: '/images/creator-flow/event-crossfit.webp',
    recommendedFrequency: 5,
    minDuration: 60,
    equipment: ['barbell', 'pull-up-bar', 'kettlebell', 'rower'],
    tips: ['Master Olympic lifts', 'Build engine', 'Practice complex movements'],
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: '0-6 months experience',
    image: '/images/creator-flow/exp-beginner.webp',
    tips: ['Focus on form', 'Start slow', 'Build consistency'],
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: '6 months - 2 years',
    image: '/images/creator-flow/exp-intermediate.webp',
    tips: ['Increase intensity', 'Try complex movements', 'Track progress'],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: '2+ years',
    image: '/images/creator-flow/exp-advanced.webp',
    tips: ['Optimize performance', 'Focus on weaknesses', 'Advanced techniques'],
  },
];

const WORKOUT_GOALS = [
  {
    id: 'general',
    title: 'General Fitness',
    description: 'Balanced workouts for overall health and fitness',
    imageSrc: '/images/creator-flow/goal-general.webp',
    stats: [
      { label: 'Focus', value: 'Balance' },
      { label: 'Duration', value: '30-45m' },
    ],
  },
  {
    id: 'strength',
    title: 'Build Strength',
    description: 'Focus on building muscle and increasing strength',
    imageSrc: '/images/creator-flow/goal-strength.webp',
    stats: [
      { label: 'Focus', value: 'Power' },
      { label: 'Duration', value: '45-60m' },
    ],
  },
  {
    id: 'endurance',
    title: 'Improve Endurance',
    description: 'Enhance stamina and cardiovascular fitness',
    imageSrc: '/images/creator-flow/goal-endurance.webp',
    stats: [
      { label: 'Focus', value: 'Cardio' },
      { label: 'Duration', value: '30-45m' },
    ],
  },
  {
    id: 'weight-loss',
    title: 'Weight Loss',
    description: 'Targeted workouts to help you burn fat and lose weight',
    imageSrc: '/images/creator-flow/goal-weight-loss.webp',
    stats: [
      { label: 'Focus', value: 'Fat Loss' },
      { label: 'Duration', value: '40-50m' },
    ],
  },
  {
    id: 'event',
    title: 'Train for Event',
    description: 'Prepare for a specific competition or event',
    imageSrc: '/images/creator-flow/goal-event.webp',
    stats: [
      { label: 'Focus', value: 'Specific' },
      { label: 'Duration', value: 'Varied' },
    ],
  },
];

const GENDER_OPTIONS: Array<{
  id: GenderOption;
  label: string;
  description: string;
  image: string;
}> = [
  {
    id: 'female',
    label: 'Female',
    description: 'Personalized recommendations built around female physiology',
    image: '/images/female_selection.webp',
  },
  {
    id: 'male',
    label: 'Male',
    description: 'Optimized progression and intensity calibrated for male athletes',
    image: '/images/male_selection.webp',
  },
  {
    id: 'non-binary',
    label: 'Non-binary',
    description: 'Gender-affirming guidance that puts your goals first',
    image: '/images/onboarding.webp',
  },
  {
    id: 'prefer-not',
    label: 'Prefer Not to Say',
    description: 'Skip gender-specific adjustments and keep things neutral',
    image: '/images/creator-flow/goal-general.webp',
  },
];

const EQUIPMENT_OPTIONS = [
  { id: 'bodyweight', label: 'Bodyweight Only', image: '/images/noequipment.webp' },
  { id: 'dumbbells', label: 'Dumbbells', image: '/images/dumbbells.webp' },
  { id: 'kettlebell', label: 'Kettlebell', image: '/images/kettlebell.webp' },
  { id: 'barbell', label: 'Barbell', image: '/images/barbell.webp' },
  { id: 'bench', label: 'Bench', image: '/images/bench.webp' },
  { id: 'pull_up_bar', label: 'Pull-Up Bar', image: '/images/Pull-up Bar.webp' },
  { id: 'resistance_bands', label: 'Resistance Bands', image: '/images/resistance Bands.webp' },
  { id: 'cable_machine', label: 'Cable Machine', image: '/images/creator-flow/goal-strength.webp' },
];

const EQUIPMENT_LABEL_LOOKUP: Record<string, string> = EQUIPMENT_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.id] = option.label;
    return acc;
  },
  {}
);

const MUSCLE_UI_TO_CANONICAL: Partial<Record<string, MuscleGroup>> = {
  chest: 'chest',
  shoulders: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  abs: 'abs',
  quads: 'quadriceps',
  calves: 'calves',
  forearms: 'forearms',
  neck: 'shoulders',
  adductors: 'quadriceps',
};

const mapUiMusclesToCanonical = (values: string[]): MuscleGroup[] => {
  const mapped = values
    .map((key) => MUSCLE_UI_TO_CANONICAL[key])
    .filter((value): value is MuscleGroup => Boolean(value));
  return Array.from(new Set(mapped));
};

const mapPreferencesToParams = (prefs: WorkoutPreferences): WorkoutGenerationParams => ({
  gender: prefs.gender ?? 'prefer-not',
  age: prefs.age,
  goal: prefs.goal,
  fitnessLevel: prefs.experienceLevel,
  equipment: Array.from(new Set(prefs.equipment.filter(Boolean))),
  muscles: mapUiMusclesToCanonical(prefs.muscles),
  sessionMinutes: prefs.duration,
  limitations: prefs.limitations,
  frequencyDays: prefs.frequency.days,
  preferredTime: prefs.frequency.preferredTime,
  progressionLevel: Math.max(0, (prefs.frequency.days.length || 0) - 2),
});

type StepKey =
  | 'goal-event' // 🎬 NEW: Netflix-style carousel combining goal + event
  | 'goal'
  | 'event'
  | 'profile-experience' // 🌟 Merged mega-step (profile + experience)
  | 'experience'
  | 'profile'
  | 'equipment'
  | 'duration'
  | 'frequency'
  | 'limitations'
  | 'muscles'
  | 'summary';

const STEP_LABELS: Record<StepKey, string> = {
  'goal-event': 'Your Goal', // 🎬 NEW
  goal: 'Goal',
  event: 'Event',
  'profile-experience': 'About You', // 🌟
  experience: 'Experience',
  profile: 'Profile',
  equipment: 'Equipment',
  duration: 'Duration',
  frequency: 'Schedule',
  limitations: 'Limitations',
  muscles: 'Muscles',
  summary: 'Review',
};

/* ------------------------------- UI Bits -------------------------------- */

type Stat = { label: string; value: string };

const SelectionCard: React.FC<{
  title: string;
  description?: string;
  imageSrc: string;
  isSelected: boolean;
  onClick: () => void;
  stats?: Stat[];
  className?: string;
}> = ({ title, description, imageSrc, isSelected, onClick, stats, className = '' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-none cursor-pointer transition-all duration-300 ${className} ${
      isSelected
        ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
        : 'hover:ring-2 hover:ring-purple-400/50'
    }`}
  >
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 z-10" />
    <img src={imageSrc} alt={title} className="w-full h-60 sm:h-48 object-cover" />
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
      <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-gray-200 text-sm mb-2">{description}</p>}
      {stats && (
        <div className="flex gap-4 mt-2">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-purple-400 font-medium">{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    {isSelected && (
      <div className="absolute top-2 right-2 z-20">
        <div className="bg-purple-500 rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    )}
  </motion.div>
);

/* --------------------------- Main Component ----------------------------- */

const WorkoutGenerator: React.FC = () => {
  const scrollToPageTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // <-- moved above useEffect
  const [showWorkout, setShowWorkout] = useState(false);

  // Scroll to top when step changes or major view toggles
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      scrollToPageTop();
    });
    return () => cancelAnimationFrame(raf);
  }, [currentStep, showWorkout, showWelcome, scrollToPageTop]);

  const [preferences, setPreferences] = useState<WorkoutPreferences>({
    gender: null,
    age: 25,
    goal: '',
    eventType: undefined,
    eventDate: undefined,
    experienceLevel: '',
    equipment: [],
    duration: 30,
    frequency: { days: [], preferredTime: undefined },
    limitations: [],
    workoutStyle: '',
    music: undefined,
    tracking: { social: false, metrics: [] },
    muscles: [],
  });

  const [workoutParams, setWorkoutParams] = useState<WorkoutGenerationParams | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { recentExerciseIds, isLoading: historyLoading } = useUserHistory(30);
  const {
    saveWorkout,
    isSaving: isSavingWorkout,
    error: saveError,
    saved: saveSuccess,
    reset: resetSaveState,
  } = useSaveWorkout();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Template modals
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);

  // Regeneration trigger
  const [regenerationKey, setRegenerationKey] = useState(0);

  const muscleOptions = useMemo(
    () => Object.keys(MUSCLE_UI_TO_CANONICAL),
    []
  );
  const shouldPromptForMuscles = useMemo(() => {
    // Skip muscle selection for purely endurance-focused flows
    return preferences.goal !== 'endurance';
  }, [preferences.goal]);

  // Fetch exercises from service (transformed & enriched)
  useEffect(() => {
    let isMounted = true;
    const fetchAllExercises = async () => {
      setLoadingExercises(true);
      setFetchError(null);
      try {
        const pageSize = 250;
        let page = 1;
        const collected: Exercise[] = [];

        while (true) {
          const result = await ExerciseService.getExercises({ page, pageSize });
          const exercises = result?.exercises ?? [];
          collected.push(...exercises);

          if (exercises.length < pageSize) {
            break;
          }
          page += 1;
        }

        if (isMounted) {
          setAllExercises(collected);
        }
      } catch (error) {
        console.error('Failed to fetch exercises for generator', error);
        if (isMounted) {
          setFetchError('Unable to load exercises right now. Please try again later.');
          setAllExercises([]);
        }
      } finally {
        if (isMounted) {
          setLoadingExercises(false);
        }
      }
    };

    fetchAllExercises();
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultParams = useMemo(() => mapPreferencesToParams(preferences), [preferences]);

  // Use the generator hook with the latest params and exercises from service
  const generatedWorkout = useGenerateWorkout({
    ...(workoutParams ?? defaultParams),
    exerciseLibrary: allExercises,
    recentExercises: recentExerciseIds,
  });
  const canScheduleWorkout = generatedWorkout.plan.length > 0;
  useEffect(() => {
    console.log('[Generator] Render state - showWorkout:', showWorkout, 'plan length:', generatedWorkout.plan.length, 'canSchedule:', canScheduleWorkout);
  }, [showWorkout, generatedWorkout.plan.length, canScheduleWorkout]);

  const ProfileStep = () => {
    const handleAgeChange = (value: number) => {
      if (Number.isNaN(value)) return;
      const clamped = Math.min(90, Math.max(13, value));
      updatePreferences({ age: clamped });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Tell Us About You</h2>
          <p className="text-gray-400">We personalize volume, recovery, and intensity from these basics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GENDER_OPTIONS.map((option) => {
            const selected = preferences.gender === option.id;
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updatePreferences({ gender: option.id })}
                className={`relative overflow-hidden rounded-xl h-56 group ${
                  selected
                    ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/40'
                    : 'hover:ring-2 hover:ring-purple-400/40'
                }`}
              >
                <img src={option.image} alt={option.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-6 text-left">
                  <h3 className="text-xl font-semibold text-white mb-1">{option.label}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{option.description}</p>
                </div>
                {selected && (
                  <div className="absolute top-3 right-3 bg-purple-500 rounded-full p-1 shadow-lg shadow-purple-500/60">
                    <CheckCircleIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 space-y-4 backdrop-blur-sm border border-gray-700/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white">Age</h3>
              <p className="text-sm text-gray-400">Helps us tune volume, recovery, and intensity</p>
            </div>
            <span className="text-3xl font-bold text-purple-400">{preferences.age}</span>
          </div>
          <input
            type="range"
            min={13}
            max={80}
            value={preferences.age}
            onChange={(e) => handleAgeChange(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={13}
              max={90}
              value={preferences.age}
              onChange={(e) => handleAgeChange(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-400">Drag or type your age (13-90)</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // 🌟 NEW: Combined Profile + Experience Mega-Step
  const ProfileExperienceMegaStep = () => {
    const handleAgeChange = (value: number) => {
      if (Number.isNaN(value)) return;
      const clamped = Math.min(90, Math.max(13, value));
      updatePreferences({ age: clamped });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            👋 Let's Build Your Perfect Workout
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto"
          >
            Tell us about yourself so we can personalize every aspect of your training
          </motion.p>
        </div>

        {/* Split Layout: Profile | Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT: Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Your Profile</h3>
                <p className="text-sm text-gray-400">Help us personalize your experience</p>
              </div>
            </div>

            {/* Gender Selection - Compact */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-cyan-300">Gender</label>
              <div className="grid grid-cols-2 gap-3">
                {GENDER_OPTIONS.map((option) => {
                  const selected = preferences.gender === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => updatePreferences({ gender: option.id })}
                      className={`relative overflow-hidden rounded-xl h-32 group transition-all ${
                        selected
                          ? 'ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/40'
                          : 'ring-1 ring-gray-700 hover:ring-cyan-400/50'
                      }`}
                    >
                      <img
                        src={option.image}
                        alt={option.label}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      <div className="relative z-10 h-full flex flex-col justify-end p-4">
                        <p className="text-lg font-bold text-white">{option.label}</p>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 bg-cyan-500 rounded-full p-1"
                        >
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Age Selector */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 space-y-4 backdrop-blur-sm border border-gray-700/40">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">Age</h4>
                  <p className="text-sm text-gray-400">Helps tune intensity & recovery</p>
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {preferences.age}
                </span>
              </div>
              <input
                type="range"
                min={13}
                max={80}
                value={preferences.age}
                onChange={(e) => handleAgeChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${((preferences.age - 13) / (80 - 13)) * 100}%, #374151 ${((preferences.age - 13) / (80 - 13)) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>13</span>
                <span>80+</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Experience Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl">
                💪
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Experience Level</h3>
                <p className="text-sm text-gray-400">Where are you in your fitness journey?</p>
              </div>
            </div>

            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => {
                const selected = preferences.experienceLevel === level.id;
                return (
                  <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updatePreferences({ experienceLevel: level.id })}
                    className={`w-full text-left rounded-xl p-5 transition-all ${
                      selected
                        ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 ring-2 ring-purple-400 shadow-lg shadow-purple-500/30'
                        : 'bg-gray-800/40 hover:bg-gray-800/60 ring-1 ring-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{level.title}</h4>
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircleIcon className="w-6 h-6 text-purple-400" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{level.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {level.tips.map((tip, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              {tip}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 opacity-40">
                        <img
                          src={level.image}
                          alt={level.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Encouraging Footer */}
        {preferences.gender && preferences.experienceLevel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30"
          >
            <p className="text-lg text-cyan-300">
              ✨ Perfect! A <span className="font-bold">{preferences.age}-year-old {EXPERIENCE_LEVELS.find(l => l.id === preferences.experienceLevel)?.title.toLowerCase()}</span> ready to crush it!
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const EquipmentSelectionStep = () => {
    const toggleEquipment = (id: string) => {
      setPreferences((prev) => {
        const hasItem = prev.equipment.includes(id);
        const next = hasItem ? prev.equipment.filter((item) => item !== id) : [...prev.equipment, id];
        return { ...prev, equipment: next };
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">What Equipment Do You Have?</h2>
          <p className="text-gray-400">Select everything you can access - mix and match freely.</p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              setPreferences((prev) => ({
                ...prev,
                equipment: Array.from(new Set(EQUIPMENT_OPTIONS.map((option) => option.id))),
              }))
            }
            className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setPreferences((prev) => ({ ...prev, equipment: [] }))}
            className="px-4 py-2 rounded-full bg-gray-800 text-gray-200 text-sm font-semibold border border-gray-700 hover:border-purple-400/70 hover:text-white transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {EQUIPMENT_OPTIONS.map((option) => {
            const selected = preferences.equipment.includes(option.id);
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleEquipment(option.id)}
                className={`relative rounded-xl p-4 flex flex-col items-center justify-center gap-3 text-center border transition-all ${
                  selected
                    ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                    : 'border-gray-700 bg-gray-800/40 hover:border-purple-400/60'
                }`}
              >
                <img src={option.image} alt={option.label} className="w-16 h-16 object-contain rounded-lg" />
                <span className="text-sm font-semibold text-white">{option.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/40 text-sm text-gray-300">
          {preferences.equipment.length > 0 ? (
            <>
              <span className="text-white font-semibold">Selected:</span>{' '}
              {preferences.equipment
                .map((item) => EQUIPMENT_LABEL_LOOKUP[item] ?? item.replace(/_/g, ' '))
                .join(', ')}
            </>
          ) : (
            <span>Select at least one option to help us match movements and equipment.</span>
          )}
        </div>
      </motion.div>
    );
  };

  const updatePreferences = (updates: Partial<WorkoutPreferences>) =>
    setPreferences((prev) => ({ ...prev, ...updates }));

  const steps = useMemo<StepKey[]>(() => {
    // 🎬 NEW PREMIUM FLOW: Start with goal-event carousel mega-step
    const sequence: StepKey[] = ['goal-event'];
    // 🌟 Then profile-experience mega-step
    sequence.push('profile-experience', 'equipment', 'duration', 'frequency', 'limitations');
    if (shouldPromptForMuscles) {
      sequence.push('muscles');
    }
    sequence.push('summary');
    return sequence;
  }, [shouldPromptForMuscles]);

  useEffect(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length) {
        return Math.max(steps.length - 1, 0);
      }
      return prev;
    });
  }, [steps]);

  const totalSteps = steps.length;
  const activeStepKey = steps[currentStep] ?? steps[0] ?? 'goal';

  const isStepComplete = (step: StepKey): boolean => {
    switch (step) {
      case 'goal-event': // 🎬 NEW: Validates goal selected AND if event goal, event selected too
        return preferences.goal.length > 0 && (preferences.goal !== 'event' || Boolean(preferences.eventType));
      case 'goal':
        return preferences.goal.length > 0;
      case 'event':
        return Boolean(preferences.eventType);
      case 'profile-experience': // 🌟 Combined validation
        return preferences.gender !== null && preferences.age > 0 && preferences.experienceLevel.length > 0;
      case 'experience':
        return preferences.experienceLevel.length > 0;
      case 'profile':
        return preferences.gender !== null && preferences.age > 0;
      case 'equipment':
        return preferences.equipment.length > 0;
      case 'duration':
        return preferences.duration > 0;
      case 'frequency':
        return preferences.frequency.days.length > 0;
      case 'muscles':
        return mapUiMusclesToCanonical(preferences.muscles).length > 0;
      default:
        return true;
    }
  };

  const canAdvance = isStepComplete(activeStepKey);
  const isLastStep = currentStep === totalSteps - 1;

  useEffect(() => {
    if (!showWorkout) {
      resetSaveState();
    }
  }, [showWorkout, resetSaveState]);

  const startOnboarding = () => {
    setShowWelcome(false);
    setShowWorkout(false);
    setCurrentStep(0);
    scrollToPageTop();
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    scrollToPageTop();
  };

  const launchWorkoutGeneration = () => {
    const params = mapPreferencesToParams(preferences);
      setWorkoutParams(params);
    scrollToPageTop();
    setShowWorkout(true);
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLastStep) {
      launchWorkoutGeneration();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      scrollToPageTop();
    }
  };

  const handleSaveGeneratedWorkout = async () => {
    console.log('[Generator] Save workout clicked');
    if (!generatedWorkout.plan.length) {
      console.warn('[Generator] No plan items to save.');
      return;
    }
    const workoutName = `Generated Workout (${preferences.goal || 'Custom'})`;
    const meta = {
      preferences,
      generatedAt: new Date().toISOString(),
      schedule: preferences.frequency,
    };
    await saveWorkout({
      name: workoutName,
      exercises: generatedWorkout.plan,
      meta,
    });
  };

  const handleScheduleGeneratedWorkout = () => {
    console.log('[Generator] Add to planner clicked', { canScheduleWorkout });
    if (!canScheduleWorkout) {
      console.warn('[Generator] Cannot schedule workout yet, plan length:', generatedWorkout.plan.length);
      return;
    }
    const workoutName = `Generated Workout (${preferences.goal || 'Custom'})`;
    const payload = buildPlannerSchedulePayload({
      name: workoutName,
      goal: preferences.goal || 'Custom',
      preferences,
      frequencyDays: preferences.frequency.days,
      equipment: preferences.equipment,
      durationMinutes: preferences.duration,
      plan: generatedWorkout.plan,
      generatedAt: new Date().toISOString(),
      suggestedTime: preferences.frequency.preferredTime,
    });
    try {
      if (typeof window === 'undefined') {
        console.warn('[Generator] Window undefined, cannot schedule planner payload');
        return;
      }

      const storageKey = `planner-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      console.log('[Generator] Storing planner payload under key:', storageKey, payload);

      window.sessionStorage.setItem(storageKey, JSON.stringify(payload));

      navigate('/modules/workout/planner', {
        state: { plannerAddWorkoutId: storageKey },
      });
    } catch (error) {
      console.error('[Generator] Failed to prepare planner payload', error);
    }
  };

  const handleScheduleFullProgram = () => {
    console.log('[Generator] Schedule full program clicked');
    if (!canScheduleWorkout) {
      console.warn('[Generator] Cannot schedule program yet, plan length:', generatedWorkout.plan.length);
      return;
    }

    if (preferences.frequency.days.length === 0) {
      console.warn('[Generator] No frequency days selected');
      return;
    }

    const workoutName = `${preferences.goal || 'Custom'} Program`;
    const payload = buildPlannerSchedulePayload({
      name: workoutName,
      goal: preferences.goal || 'Custom',
      preferences,
      frequencyDays: preferences.frequency.days,
      equipment: preferences.equipment,
      durationMinutes: preferences.duration,
      plan: generatedWorkout.plan,
      generatedAt: new Date().toISOString(),
      suggestedTime: preferences.frequency.preferredTime,
    });

    // Create program scheduling data
    const programData = {
      payload,
      scheduling: {
        type: 'multi-day-program' as const,
        days: preferences.frequency.days,
        weeks: 4, // Default, user can change in modal
        startDate: new Date().toISOString().split('T')[0],
        recurring: false,
        preferredTime: preferences.frequency.preferredTime,
      },
    };

    try {
      if (typeof window === 'undefined') {
        console.warn('[Generator] Window undefined, cannot schedule program');
        return;
      }

      const storageKey = `planner-program-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      console.log('[Generator] Storing program data under key:', storageKey, programData);

      window.sessionStorage.setItem(storageKey, JSON.stringify(programData));

      navigate('/modules/workout/planner', {
        state: { plannerProgramId: storageKey },
      });
    } catch (error) {
      console.error('[Generator] Failed to prepare program data', error);
    }
  };

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    const prefs = template.preferences;

    // Map template preferences back to our preferences state
    setPreferences({
      gender: (prefs as any).gender || null,
      age: (prefs as any).age || 25,
      goal: prefs.goal || '',
      eventType: (prefs as any).eventType,
      eventDate: (prefs as any).eventDate ? new Date((prefs as any).eventDate) : undefined,
      experienceLevel: prefs.experience || '',
      equipment: prefs.equipment || [],
      duration: prefs.duration || 30,
      frequency: prefs.frequency || { days: [], preferredTime: undefined },
      limitations: (prefs as any).limitations || [],
      workoutStyle: (prefs as any).workoutStyle || '',
      music: (prefs as any).music,
      tracking: (prefs as any).tracking || { social: false, metrics: [] },
      muscles: prefs.specificMuscles || [],
    });

    // Jump to summary step or regenerate
    setShowWelcome(false);
    setCurrentStep(steps.length - 1); // Go to final step
  };

  const handleRegenerate = () => {
    // Keep all preferences, just trigger new workout generation with new exercises
    resetSaveState();
    // Force regeneration by updating workoutParams with a timestamp
    if (workoutParams) {
      setWorkoutParams({ ...workoutParams, timestamp: Date.now() });
    }
    toast.success('🔄 Generating new workout...');
  };

  const handleModifyAndRegenerate = () => {
    // Go back to muscle selection step
    resetSaveState();
    const muscleStepIndex = steps.findIndex(s => s.key === 'muscles');
    if (muscleStepIndex !== -1) {
      setCurrentStep(muscleStepIndex);
      setShowWorkout(false);
      toast('✏️ Adjust preferences and regenerate');
    }
  };

  /* --------------------------- Local Step Views -------------------------- */

  const WelcomeScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-screen flex flex-col items-center justify-center text-white text-center px-4"
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="/images/creator-flow/hero-welcome.webp"
          alt="Welcome"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold"
        >
          Your Personal Workout Journey Begins Here
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-300"
        >
          AI-powered workouts tailored just for you, adapting to your goals and progress
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onStart}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold px-8 py-4 rounded-lg
            hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105 transition-all duration-300
            shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
          >
            Let&apos;s Get Started
          </button>
          {user && (
            <button
              onClick={() => setShowLoadTemplateModal(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-lg font-semibold px-8 py-4 rounded-lg
              hover:from-amber-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-300
              shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center gap-2 justify-center"
            >
              📋 Load Template
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  const ProgressBar = () => {
    const progress = totalSteps === 0 ? 0 : ((currentStep + 1) / totalSteps) * 100;
    const stepLabel = STEP_LABELS[activeStepKey];
    return (
      <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-black/20 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="relative h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>
              Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
            </span>
            <span className="text-purple-400">{stepLabel}</span>
          </div>
        </div>
      </div>
    );
  };

  // 🎬 NETFLIX-STYLE GOAL + EVENT CAROUSEL (Mega-Step 1)
  const GoalEventCarousel = () => {
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [showEventPicker, setShowEventPicker] = useState(false);

    // Auto-show event picker if 'event' goal is selected
    useEffect(() => {
      if (preferences.goal === 'event' && !preferences.eventType) {
        setShowEventPicker(true);
      } else if (preferences.goal && preferences.goal !== 'event') {
        setShowEventPicker(false);
      }
    }, [preferences.goal]);

    const handleGoalSelect = (goalId: string) => {
      updatePreferences({
        goal: goalId,
        eventType: goalId === 'event' ? preferences.eventType : undefined,
      });

      if (goalId === 'event') {
        // Slide to event selection
        setTimeout(() => setShowEventPicker(true), 300);
      }
    };

    const handleEventSelect = (eventId: string) => {
      updatePreferences({ eventType: eventId });
      setShowEventPicker(false);
    };

    const nextCard = () => {
      setCarouselIndex((prev) => Math.min(prev + 1, WORKOUT_GOALS.length - 1));
    };

    const prevCard = () => {
      setCarouselIndex((prev) => Math.max(prev - 1, 0));
    };

    const isGoalComplete = preferences.goal.length > 0;
    const isEventComplete = preferences.goal !== 'event' || Boolean(preferences.eventType);
    const isMegaStepComplete = isGoalComplete && isEventComplete;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full h-full min-h-[600px]"
      >
        {/* Hero Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
            🎯 What Brings You Here?
          </h1>
          <p className="text-lg text-gray-300">
            {showEventPicker
              ? "Choose your event, and we'll build your competition prep plan"
              : 'Select your primary goal to get started'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!showEventPicker ? (
            /* GOAL CAROUSEL */
            <motion.div
              key="goal-carousel"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="relative"
            >
              {/* Carousel Navigation */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={prevCard}
                  disabled={carouselIndex === 0}
                  className="p-3 rounded-full bg-gray-800/60 border border-gray-700 hover:border-purple-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeftIcon className="w-6 h-6 text-white" />
                </button>

                <div className="flex gap-2">
                  {WORKOUT_GOALS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === carouselIndex
                          ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'w-2 bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextCard}
                  disabled={carouselIndex === WORKOUT_GOALS.length - 1}
                  className="p-3 rounded-full bg-gray-800/60 border border-gray-700 hover:border-purple-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRightIcon className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Main Card Display */}
              <div className="relative w-full max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    {WORKOUT_GOALS.map((goal, idx) => {
                      if (idx !== carouselIndex) return null;

                      const isSelected = preferences.goal === goal.id;

                      return (
                        <motion.div
                          key={goal.id}
                          className={`relative rounded-3xl overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-500 shadow-2xl shadow-purple-500/40'
                              : 'border-gray-700 hover:border-purple-400/60'
                          }`}
                          onClick={() => handleGoalSelect(goal.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Hero Image */}
                          <div className="relative h-72 md:h-96 overflow-hidden">
                            <img
                              src={goal.imageSrc}
                              alt={goal.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                            {/* Selected Badge */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                                Selected
                              </motion.div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <h3 className="text-3xl md:text-4xl font-black mb-2">{goal.title}</h3>
                            <p className="text-lg text-gray-300 mb-4">{goal.description}</p>

                            {/* Stats Row */}
                            <div className="flex gap-6">
                              {goal.stats.map((stat, statIdx) => (
                                <div key={statIdx} className="flex flex-col">
                                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                                    {stat.label}
                                  </span>
                                  <span className="text-lg font-bold text-purple-400">{stat.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Quick Grid View (optional thumbnails) */}
              <div className="mt-8 flex justify-center gap-3 flex-wrap">
                {WORKOUT_GOALS.map((goal, idx) => {
                  const isSelected = preferences.goal === goal.id;
                  return (
                    <motion.button
                      key={goal.id}
                      onClick={() => {
                        setCarouselIndex(idx);
                        handleGoalSelect(goal.id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative rounded-xl overflow-hidden border-2 w-24 h-32 transition-all ${
                        isSelected
                          ? 'border-purple-500 shadow-lg shadow-purple-500/40'
                          : idx === carouselIndex
                          ? 'border-purple-400/60'
                          : 'border-gray-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={goal.imageSrc} alt={goal.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-white px-1">
                        {goal.title.split(' ')[0]}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                          <CheckCircleIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* EVENT SELECTION CAROUSEL */
            <motion.div
              key="event-carousel"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="relative"
            >
              {/* Back Button */}
              <button
                onClick={() => setShowEventPicker(false)}
                className="mb-6 px-4 py-2 rounded-lg bg-gray-800/60 border border-gray-700 hover:border-purple-400 text-white flex items-center gap-2 transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                Back to Goals
              </button>

              {/* Event Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EVENTS.map((event) => {
                  const isSelected = preferences.eventType === event.id;

                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.03, y: -5 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleEventSelect(event.id)}
                      className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 shadow-2xl shadow-purple-500/40'
                          : 'border-gray-700 hover:border-purple-400/60'
                      }`}
                    >
                      {/* Event Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full"
                          >
                            <CheckCircleIcon className="w-5 h-5" />
                          </motion.div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="p-5 bg-gray-800/60 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">{event.description}</p>

                        {/* Event Stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex flex-col bg-gray-900/60 rounded-lg p-2">
                            <span className="text-gray-500 uppercase">Training Days</span>
                            <span className="text-purple-400 font-bold">{event.recommendedFrequency}/week</span>
                          </div>
                          <div className="flex flex-col bg-gray-900/60 rounded-lg p-2">
                            <span className="text-gray-500 uppercase">Min Duration</span>
                            <span className="text-purple-400 font-bold">{event.minDuration} min</span>
                          </div>
                        </div>

                        {/* Tips Preview */}
                        <div className="mt-3 text-xs text-gray-400">
                          <span className="font-semibold text-gray-300">Key Focus:</span> {event.tips[0]}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Badge */}
        {isMegaStepComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-center"
          >
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-white mb-1">Goal Locked In! 🎯</h3>
            <p className="text-gray-300">
              {preferences.goal === 'event'
                ? `Training plan for ${EVENTS.find((e) => e.id === preferences.eventType)?.title} ready to build!`
                : `Let&apos;s build your ${WORKOUT_GOALS.find((g) => g.id === preferences.goal)?.title.toLowerCase()} program!`}
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  const GoalSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">What&apos;s Your Main Fitness Goal?</h2>
        <p className="text-gray-400">Select the primary focus for your training</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full">
        {WORKOUT_GOALS.map((goal) => (
          <SelectionCard
            key={goal.id}
            title={goal.title}
            description={goal.description}
            imageSrc={goal.imageSrc}
            isSelected={preferences.goal === goal.id}
            onClick={() => {
              updatePreferences({
                goal: goal.id,
                eventType: goal.id === 'event' ? preferences.eventType : undefined,
              });
            }}
            stats={goal.stats}
            className="w-full h-full"
          />
        ))}
      </div>
    </motion.div>
  );

  const EventSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Select Your Event</h2>
        <p className="text-gray-400">We’ll tailor your plan to this competition</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EVENTS.map((evt) => {
          const selected = preferences.eventType === evt.id;
          return (
            <motion.button
              key={evt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                updatePreferences({
                  eventType: evt.id,
                  duration: Math.max(preferences.duration, evt.minDuration),
                });
              }}
              className={`relative overflow-hidden rounded-xl aspect-[4/3] group ${
                selected
                  ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
                  : 'hover:ring-2 hover:ring-purple-400/50'
              }`}
            >
              <img
                src={evt.image}
                alt={evt.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                <h3 className="text-xl font-semibold text-white mb-2">{evt.title}</h3>
                <p className="text-gray-300 text-sm">{evt.description}</p>
              </div>
              {selected && (
                <div className="absolute top-4 right-4">
                  <CheckCircleIcon className="w-6 h-6 text-purple-500" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  const ExperienceSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Your Experience Level</h2>
        <p className="text-sm sm:text-base text-gray-400">
          Help us tailor the difficulty of your workouts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EXPERIENCE_LEVELS.map((level) => {
          const selected = preferences.experienceLevel === level.id;
          return (
            <motion.button
              key={level.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                updatePreferences({ experienceLevel: level.id });
              }}
              className={`relative overflow-hidden rounded-xl aspect-video group ${
                selected
                  ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
                  : 'hover:ring-2 hover:ring-purple-400/50'
              }`}
            >
              <img
                src={level.image}
                alt={level.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                <h3 className="text-xl font-semibold text-white mb-2">{level.title}</h3>
                <p className="text-gray-300 text-sm mb-4">{level.description}</p>
                <div className="space-y-2">
                  {level.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircleIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selected && (
                <div className="absolute top-4 right-4">
                  <CheckCircleIcon className="w-6 h-6 text-purple-500" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );

  const DurationSelection = () => {
    const durations = [15, 30, 45, 60];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Choose Your Workout Duration</h2>
          <p className="text-gray-400">How long would you like your workouts to be?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {durations.map((duration) => {
            const selected = preferences.duration === duration;
            return (
              <motion.button
                key={duration}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              onClick={() => {
                updatePreferences({ duration });
              }}
              className={`relative p-6 rounded-xl ${
                selected
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
                  : 'bg-gray-800/50 hover:bg-gray-800/80'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{duration} min</div>
                  <div className="text-gray-400 text-sm">
                    ~{Math.round(duration * 4.5)} calories
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const FrequencySelection = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    const timeSlots = ['Morning', 'Afternoon', 'Evening'] as const;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Plan Your Week</h2>
          <p className="text-gray-400">Select your preferred workout days and time</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const isSelected = preferences.frequency.days.includes(day);
              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const nextDays = isSelected
                      ? preferences.frequency.days.filter((d) => d !== day)
                      : [...preferences.frequency.days, day];
                    updatePreferences({ frequency: { ...preferences.frequency, days: nextDays } });
                  }}
                  className={`p-4 rounded-xl ${
                    isSelected
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
                      : 'bg-gray-800/50 hover:bg-gray-800/80'
                  }`}
                >
                  <span className="text-white font-medium">{day}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Preferred Time</h3>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => {
                const isSelected = preferences.frequency.preferredTime === time;
                return (
                  <motion.button
                    key={time}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      updatePreferences({
                        frequency: {
                          ...preferences.frequency,
                          preferredTime: isSelected ? undefined : time,
                        },
                      });
                    }}
                    className={`p-3 rounded-lg ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 ring-2 ring-purple-500/50'
                        : 'bg-black/20 hover:bg-black/30'
                    }`}
                  >
                    <span className="text-white text-sm">{time}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const LimitationsSelection = () => {
    const options = [
      { id: 'none', label: 'No Limitations' },
      { id: 'knee', label: 'Knee Issues' },
      { id: 'back', label: 'Back Problems' },
      { id: 'shoulder', label: 'Shoulder Injury' },
      { id: 'other', label: 'Other (Please Specify)' },
    ] as const;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Any Physical Limitations?</h2>
          <p className="text-gray-400">Help us customize your workouts for safety</p>
        </div>

        <div className="space-y-4">
          {options.map((opt) => {
            const isSelected = preferences.limitations.includes(opt.id);
            return (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (opt.id === 'none') {
                    updatePreferences({ limitations: ['none'] });
                  } else {
                    const next = isSelected
                      ? preferences.limitations.filter((l) => l !== opt.id)
                      : [...preferences.limitations.filter((l) => l !== 'none'), opt.id];
                    updatePreferences({ limitations: next });
                  }
                }}
                className={`w-full p-4 rounded-xl ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 ring-2 ring-purple-500/50'
                    : 'bg-gray-800/50 hover:bg-gray-800/80'
                }`}
              >
                <span className="text-white">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const MuscleSelectionStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white">Select Muscles to Focus On</h2>
        <p className="text-gray-400">Choose one or more muscle groups</p>
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() =>
            setPreferences((prev) => ({ ...prev, muscles: muscleOptions }))
          }
          className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={() => setPreferences((prev) => ({ ...prev, muscles: [] }))}
          className="px-4 py-2 rounded-full bg-gray-800 text-gray-200 text-sm font-semibold border border-gray-700 hover:border-purple-400/70 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
      <MuscleMapSelector
        value={preferences.muscles}
        onChange={(muscles) => setPreferences((p) => ({ ...p, muscles }))}
      />
    </motion.div>
  );

  const SummaryStep = () => {
    const genderLabel =
      preferences.gender === null
        ? 'Not specified'
        : GENDER_OPTIONS.find((option) => option.id === preferences.gender)?.label ??
          preferences.gender.replace(/-/g, ' ');
    const eventLabel = preferences.eventType
      ? EVENTS.find((evt) => evt.id === preferences.eventType)?.title ?? preferences.eventType
      : null;
    const equipmentSummary =
      preferences.equipment.length > 0
        ? preferences.equipment
            .map((id) => EQUIPMENT_LABEL_LOOKUP[id] ?? id.replace(/_/g, ' '))
            .join(', ')
        : 'Bodyweight only';
    const muscleSummary =
      preferences.muscles.length > 0
        ? preferences.muscles
            .map((muscle) => muscle.replace(/_/g, ' '))
            .map((label) => label.charAt(0).toUpperCase() + label.slice(1))
            .join(', ')
        : 'No muscles selected';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Ready to Generate Your Workout!</h2>
          <p className="text-gray-400">Review your preferences below</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 space-y-6 backdrop-blur-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Your Profile</h3>
              <p className="text-gray-300">
                Gender:{' '}
                <span className="text-white font-semibold">{genderLabel}</span>
              </p>
              <p className="text-gray-300">
                Age:{' '}
                <span className="text-white font-semibold">{preferences.age || 'Not shared'}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Your Goal</h3>
              <p className="text-gray-300 capitalize">{preferences.goal || 'Not selected'}</p>
              {eventLabel && (
                <p className="text-purple-400">Event Focus: {eventLabel}</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Experience Level</h3>
              <p className="text-gray-300 capitalize">
                {preferences.experienceLevel || 'Not selected'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Equipment</h3>
              <p className="text-gray-300">{equipmentSummary}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <h3 className="text-lg font-semibold text-white">Workout Schedule</h3>
              <p className="text-gray-300">
                {preferences.duration} minutes per session{' - '}
                {preferences.frequency.days.length > 0
                  ? `${preferences.frequency.days.length} day(s) per week`
                  : 'No days selected yet'}
              </p>
              <p className="text-gray-300">
                {preferences.frequency.days.length > 0
                  ? preferences.frequency.days.join(', ')
                  : 'Choose the days you prefer to train'}
              </p>
              {preferences.frequency.preferredTime && (
                <p className="text-purple-400">
                  Preferred time: {preferences.frequency.preferredTime}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <h3 className="text-lg font-semibold text-white">Muscle Focus</h3>
              <p className="text-gray-300">{muscleSummary}</p>
            </div>

            {preferences.limitations.length > 0 && (
              <div className="space-y-2 md:col-span-2">
                <h3 className="text-lg font-semibold text-white">Limitations</h3>
                <p className="text-gray-300">{preferences.limitations.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };
  /* ------------------------------ Renderer ------------------------------- */

  const renderCurrentStep = () => {
    if (showWelcome) return <WelcomeScreen onStart={startOnboarding} />;

    switch (activeStepKey) {
      case 'goal-event': // 🎬 NEW: Netflix-style carousel
        return <GoalEventCarousel />;
      case 'goal':
        return <GoalSelection />;
      case 'event':
        return <EventSelection />;
      case 'profile-experience': // 🌟 Use merged mega-step
        return <ProfileExperienceMegaStep />;
      case 'experience':
        return <ExperienceSelection />;
      case 'profile':
        return <ProfileStep />;
      case 'equipment':
        return <EquipmentSelectionStep />;
      case 'duration':
        return <DurationSelection />;
      case 'frequency':
        return <FrequencySelection />;
      case 'limitations':
        return <LimitationsSelection />;
      case 'muscles':
        return <MuscleSelectionStep />;
      case 'summary':
        return <SummaryStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F1C] bg-gradient-to-b from-purple-900/20 to-indigo-900/20 relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-slow-spin" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl animate-slow-spin-reverse" />
      </div>

      {!showWelcome && <ProgressBar />}

      {!showWelcome && fetchError && (
        <div className="relative z-20 mt-20 px-4">
          <div className="mx-auto w-full max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-lg shadow-red-900/20">
            {fetchError}
          </div>
        </div>
      )}

      {!showWelcome && !fetchError && loadingExercises && (
        <div className="relative z-20 mt-20 px-4">
          <div className="mx-auto w-full max-w-2xl rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-200 shadow-lg shadow-purple-900/20">
            Loading your exercise library...
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col w-full">
        {!showWorkout && (
          <main className="flex-1 flex items-center justify-center">
            <div className="w-full">
              <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>
            </div>
          </main>
        )}

        {!showWelcome && !showWorkout && totalSteps > 0 && (
          <div className="sticky bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm w-full">
            <div className="w-full flex justify-between gap-4">
              {currentStep > 0 && (
                <button
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg
                    hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-300
                    shadow-lg shadow-gray-500/30 hover:shadow-gray-500/50"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={!canAdvance}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg ml-auto transition-all duration-300 ${
                  canAdvance
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transform hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLastStep ? (
                  'Generate My Workout'
                ) : (
                  <>
                    Next
                    <ChevronRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render generated workout summary */}
      {showWorkout && (
        <div className="w-full max-w-2xl mx-auto mt-10">
          <h2 className="text-2xl font-bold text-white mb-4">Your Generated Workout</h2>
          {historyLoading && (
            <div className="mb-4 text-sm text-gray-400">
              Personalizing using your recent workouts…
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {preferences.frequency.days.length > 0 && (
              <button
                type="button"
                onClick={handleScheduleFullProgram}
                disabled={!canScheduleWorkout}
                className={`px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  !canScheduleWorkout
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-white hover:from-emerald-400 hover:via-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transform hover:scale-105'
                }`}
                title={`Plan ${preferences.frequency.days.length} days/week for multiple weeks`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Full Program ({preferences.frequency.days.length}x/week)
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Generator] Add Single Workout clicked', { canScheduleWorkout, planLength: generatedWorkout.plan.length });
                handleScheduleGeneratedWorkout();
              }}
              disabled={!canScheduleWorkout}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !canScheduleWorkout
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
              }`}
            >
              Add Single Workout
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Generator] Save Workout clicked');
                handleSaveGeneratedWorkout();
              }}
              disabled={!generatedWorkout.plan.length || isSavingWorkout}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !generatedWorkout.plan.length || isSavingWorkout
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : saveSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
              }`}
            >
              {isSavingWorkout ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save Workout'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Generator] Save as Template clicked');
                setShowSaveTemplateModal(true);
              }}
              disabled={!generatedWorkout.plan.length || !user}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                !generatedWorkout.plan.length || !user
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
              }`}
              title="Save your current preferences as a reusable template"
            >
              💾 Save as Template
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Generator] Regenerate clicked');
                handleRegenerate();
              }}
              disabled={!workoutParams}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                !workoutParams
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-cyan-600 hover:border-cyan-400'
              }`}
              title="Generate new workout with same preferences"
            >
              🔄 Regenerate
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Generator] Modify & Regenerate clicked');
                handleModifyAndRegenerate();
              }}
              disabled={!workoutParams}
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                !workoutParams
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-700 text-white border border-purple-600 hover:border-purple-400'
              }`}
              title="Go back to adjust preferences"
            >
              ✏️ Modify & Regenerate
            </button>
            {saveError && <span className="text-sm text-red-400">{saveError}</span>}
            {saveSuccess && <span className="text-sm text-green-400">Workout saved to your account.</span>}
          </div>
          {generatedWorkout && generatedWorkout.plan.length > 0 ? (
            <ul className="space-y-6">
              {generatedWorkout.plan.map((item, idx) => {
                const listKey = item.exercise.id ?? `${item.exercise.name}-${idx}`;
                const section = item.section as 'warmup' | 'main' | 'cooldown' | undefined;
                const sectionStyles: Record<string, string> = {
                  warmup: 'bg-amber-500/20 text-amber-300 border-amber-300/40',
                  main: 'bg-purple-500/20 text-purple-300 border-purple-300/40',
                  cooldown: 'bg-blue-500/20 text-blue-300 border-blue-300/40',
                };
                const sectionLabel =
                  section === 'warmup' ? 'Warm-Up' : section === 'cooldown' ? 'Cool-Down' : section === 'main' ? 'Main' : null;

                return (
                  <li
                    key={listKey}
                    className="bg-gradient-to-br from-gray-800/90 to-black/80 rounded-2xl p-4 flex gap-4 items-center shadow-lg border border-gray-700"
                  >
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-900 border-2 border-accent shadow">
                      {item.exercise.image_url ? (
                        <img
                          src={item.exercise.image_url}
                          alt={item.exercise.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-white drop-shadow-md">
                            {item.exercise.name}
                          </span>
                          {item.exercise.difficulty && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                item.exercise.difficulty === 'beginner'
                                  ? 'bg-green-700 text-green-200'
                                  : item.exercise.difficulty === 'intermediate'
                                  ? 'bg-yellow-700 text-yellow-200'
                                  : 'bg-red-700 text-red-200'
                              }`}
                            >
                              {item.exercise.difficulty}
                            </span>
                          )}
                        </div>
                        {sectionLabel && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              section ? sectionStyles[section] : ''
                            }`}
                          >
                            {sectionLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-2">
                        {typeof item.sets === 'number' && (
                          <span>
                            Sets: <strong className="text-white">{item.sets}</strong>
                          </span>
                        )}
                        {item.reps && (
                          <span>
                            Reps: <strong className="text-white">{item.reps}</strong>
                          </span>
                        )}
                        {item.distance && (
                          <span>
                            Distance: <strong className="text-white">{item.distance}</strong>
                          </span>
                        )}
                        {item.time && (
                          <span>
                            Time: <strong className="text-white">{item.time}</strong>
                          </span>
                        )}
                        {typeof item.rest === 'number' && (
                          <span>
                            Rest: <strong className="text-white">{item.rest}s</strong>
                          </span>
                        )}
                      </div>
                      {item.reason && <div className="text-xs text-purple-300 mb-2">{item.reason}</div>}
                      <div className="text-xs text-gray-400 flex flex-wrap gap-4">
                        {item.exercise.primary_muscles?.length ? (
                          <span>
                            <span className="text-gray-500 uppercase tracking-wide mr-1">Primary</span>
                            {item.exercise.primary_muscles.join(', ')}
                          </span>
                        ) : null}
                        {item.exercise.secondary_muscles?.length ? (
                          <span>
                            <span className="text-gray-500 uppercase tracking-wide mr-1">Secondary</span>
                            {item.exercise.secondary_muscles.join(', ')}
                          </span>
                        ) : null}
                        {item.exercise.equipment?.length ? (
                          <span>
                            <span className="text-gray-500 uppercase tracking-wide mr-1">Equipment</span>
                            {item.exercise.equipment.join(', ')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-red-400">No workout could be generated. Try different options.</div>
          )}
          <button
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl"
            onClick={() => {
              startOnboarding();
              setPreferences({
                gender: null,
                age: 25,
                goal: '',
                eventType: undefined,
                eventDate: undefined,
                experienceLevel: '',
                equipment: [],
                duration: 30,
                frequency: { days: [], preferredTime: undefined },
                limitations: [],
                workoutStyle: '',
                music: undefined,
                tracking: { social: false, metrics: [] },
                muscles: [],
              });
              setWorkoutParams(null);
            }}
          >
            Back to Onboarding
          </button>
        </div>
      )}

      {/* Template Modals */}
      {user && (
        <>
          <SaveTemplateModal
            isOpen={showSaveTemplateModal}
            onClose={() => setShowSaveTemplateModal(false)}
            preferences={{
              goal: preferences.goal,
              duration: preferences.duration,
              frequency: preferences.frequency,
              equipment: preferences.equipment,
              experience: preferences.experienceLevel,
              specificMuscles: preferences.muscles,
              gender: preferences.gender || undefined,
              age: preferences.age,
              eventType: preferences.eventType,
              eventDate: preferences.eventDate?.toISOString(),
              limitations: preferences.limitations,
              workoutStyle: preferences.workoutStyle,
              music: preferences.music,
              tracking: preferences.tracking,
            }}
            userId={user.id}
            defaultName={`${preferences.goal || 'Custom'} Workout`}
          />

          <TemplateModal
            isOpen={showLoadTemplateModal}
            onClose={() => setShowLoadTemplateModal(false)}
            onSelectTemplate={handleLoadTemplate}
            userId={user.id}
          />
        </>
      )}
    </div>
  );
};

export default WorkoutGenerator;







