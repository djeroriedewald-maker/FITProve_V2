import React from 'react';
import { Link } from 'react-router-dom';
import {
  Library,
  Clock,
  Flame,
  BookOpen,
  Wrench,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { supabase } from '../lib/supabase';

interface WorkoutCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  features: string[];
  stats: {
    count: number;
    label: string;
  };
  comingSoon?: boolean;
}

const defaultWorkoutCategories: WorkoutCategory[] = [
  {
    id: 'workout-generator',
    title: 'Workout Generator',
    description:
      'Let us build a workout for you! Answer a few quick questions and get a personalized plan with our smart onboarding flow.',
    icon: Flame,
    color: 'text-orange-500',
    gradient: 'from-orange-400/20 to-red-400/20',
    features: [
      'Personalized onboarding',
      'Smart workout recommendations',
      'Goal & equipment based plans',
      'Beginner to advanced',
      'Fast and easy',
      'No account required',
    ],
    stats: {
      count: 0,
      label: 'Generated Workouts',
    },
    comingSoon: false,
  },
  {
    id: 'community-workouts',
    title: 'Community Workouts',
    description:
      'Browse and join workouts created by other users. Only public workouts are shown, including the creator name.',
    icon: Library,
    color: 'text-orange-600',
    gradient: 'from-orange-500/20 to-yellow-500/20',
    features: [
      'User-created routines',
      'See who created each workout',
      'Join and track community workouts',
      'Public workouts only',
    ],
    stats: {
      count: 0,
      label: 'Community Workouts',
    },
    comingSoon: false,
  },
  {
    id: 'exercise-library',
    title: 'Exercise Library',
    description:
      'Comprehensive collection of exercises with detailed instructions, proper form guidance, and muscle targeting information.',
    icon: Library,
    color: 'text-blue-600',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    features: [
      'Detailed exercise instructions',
      'Proper form guidance',
      'Muscle group targeting',
      'Difficulty levels',
      'Equipment requirements',
      'Video demonstrations',
    ],
    stats: {
      count: 0,
      label: 'Exercises',
    },
  },
  {
    id: 'workout-library',
    title: 'Workout Library',
    description:
      'Pre-designed complete workout routines created by fitness experts for different goals and fitness levels.',
    icon: BookOpen,
    color: 'text-green-600',
    gradient: 'from-green-500/20 to-emerald-500/20',
    features: [
      'Expert-designed routines',
      'Goal-specific workouts',
      'Progressive difficulty',
      'Time-efficient sessions',
      'Equipment variations',
      'Performance tracking',
    ],
    stats: {
      count: 0,
      label: 'Workouts',
    },
  },
  {
    id: 'workout-creator',
    title: 'Workout Creator',
    description:
      'Build custom workout routines by selecting exercises from our library. Perfect for creating personalized training sessions.',
    icon: Wrench,
    color: 'text-purple-600',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    features: [
      'Drag & drop interface',
      'Custom exercise selection',
      'Set and rep customization',
      'Rest time configuration',
      'Save personal routines',
      'Share with community',
    ],
    stats: {
      count: 0,
      label: 'Custom Workouts',
    },
    comingSoon: false,
  },
];

interface WorkoutCategoryCardProps {
  category: WorkoutCategory;
}

function WorkoutCategoryCard({ category }: WorkoutCategoryCardProps) {
  const Icon = category.icon;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
      {/* Background Pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50`} />

      {/* Coming Soon Badge */}
      {category.comingSoon && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-semibold rounded-full z-10">
          Coming Soon
        </div>
      )}

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-white/90 dark:bg-gray-800/90 rounded-xl backdrop-blur-sm`}>
            <Icon className={`h-8 w-8 ${category.color}`} />
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${category.color}`}>{category.stats.count}+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{category.stats.label}</div>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{category.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {category.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {category.features.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.gradient.replace('from-', 'from-').replace('to-', 'to-').replace('/20', '')}`}
              />
              <span>{feature}</span>
            </div>
          ))}
          {category.features.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-500 ml-3">
              +{category.features.length - 3} more features
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>5-60 min</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

const STORAGE_KEY = 'workoutCategoryOrder';

export function WorkoutPage() {
  // Restore order from localStorage, fallback to default
  const [workoutCategories, setWorkoutCategories] = React.useState<WorkoutCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const ids: string[] = JSON.parse(saved);
        // Map saved order to actual objects, fallback to default if missing
        const idToCat = Object.fromEntries(defaultWorkoutCategories.map(c => [c.id, c]));
        return ids.map(id => idToCat[id]).filter(Boolean).concat(
          defaultWorkoutCategories.filter(c => !ids.includes(c.id))
        );
      } catch {
        return defaultWorkoutCategories;
      }
    }
    return defaultWorkoutCategories;
  });

  // Save order to localStorage on change
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutCategories.map(c => c.id)));
  }, [workoutCategories]);

  // Move up/down logic
  const moveCategory = (from: number, to: number) => {
    if (to < 0 || to >= workoutCategories.length) return;
    const updated = [...workoutCategories];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setWorkoutCategories(updated);
  };

  const handleMoveUp = (index: number) => moveCategory(index, index - 1);
  const handleMoveDown = (index: number) => moveCategory(index, index + 1);

  // Fetch stats
  React.useEffect(() => {
    async function fetchCounts() {
      const { count: communityCount } = await supabase
        .from('custom_workouts')
        .select('*', { count: 'exact', head: true })
        .eq('is_public', true);

      const { count: exerciseCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

      const { count: workoutLibCount } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true });

      const { count: customCount } = await supabase
        .from('custom_workouts')
        .select('*', { count: 'exact', head: true });

      setWorkoutCategories(prev =>
        prev.map(cat => {
          if (cat.id === 'community-workouts')
            return { ...cat, stats: { ...cat.stats, count: communityCount ?? 0 } };
          if (cat.id === 'exercise-library')
            return { ...cat, stats: { ...cat.stats, count: exerciseCount ?? 0 } };
          if (cat.id === 'workout-library')
            return { ...cat, stats: { ...cat.stats, count: workoutLibCount ?? 0 } };
          if (cat.id === 'workout-creator')
            return { ...cat, stats: { ...cat.stats, count: customCount ?? 0 } };
          return cat;
        })
      );
    }
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button (consistent style) */}
      <div className="mb-4 mt-4 ml-4">
        <BackButton text="Back" to="/modules" />
      </div>

      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img src="/images/workout_1.webp" alt="Workout" className="w-full h-full object-cover" />
        {/* Brighter overlay */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Centered Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4 drop-shadow-lg">
            Workout Zone
          </h1>
        </div>
      </div>

      {/* Description below hero image */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <p className="text-xl text-gray-800 dark:text-gray-100 text-center max-w-2xl mb-6 mx-auto">
          Transform your fitness journey with our comprehensive workout system.
          <br />
          Individual exercises to complete routines and custom workout creation.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {workoutCategories.find((c) => c.id === 'exercise-library')?.stats.count ?? '...'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Exercises</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {workoutCategories.find((c) => c.id === 'workout-library')?.stats.count ?? '...'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Workouts</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600 mb-1">{workoutCategories.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {workoutCategories.find((c) => c.id === 'workout-creator')?.stats.count ?? '...'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Created workouts</div>
          </div>
        </div>

        {/* Categories Grid with Up/Down Arrows */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Choose Your Workout Experience
          </h2>
          <div className="flex flex-wrap gap-8">
            {workoutCategories.map((category, index) => (
              <div key={category.id} className="relative w-full md:w-auto">
                {/* Up/Down Arrows - absolutely positioned, bottom right, not inside Link */}
                <div className="absolute bottom-2 right-2 z-20 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 select-none">Reorder</span>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleMoveUp(index); }}
                    disabled={index === 0}
                    className={`bg-gray-200 dark:bg-gray-700 rounded-full p-3 shadow transition-all duration-150 ${index === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'} active:scale-95`}
                    aria-label="Move up"
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <ArrowUp className="h-7 w-7" />
                  </button>
                  <button
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleMoveDown(index); }}
                    disabled={index === workoutCategories.length - 1}
                    className={`bg-gray-200 dark:bg-gray-700 rounded-full p-3 shadow transition-all duration-150 ${index === workoutCategories.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-300 dark:hover:bg-gray-600'} active:scale-95`}
                    aria-label="Move down"
                    style={{ minWidth: 44, minHeight: 44 }}
                  >
                    <ArrowDown className="h-7 w-7" />
                  </button>
                </div>
                {/* Only the card content is clickable */}
                <Link
                  to={
                    category.id === 'community-workouts'
                      ? '/modules/workout/community'
                      : category.id === 'workout-generator'
                      ? '/workout-generator'
                      : `/modules/workout/${category.id}`
                  }
                  className={`block h-full ${category.comingSoon ? 'pointer-events-none' : ''}`}
                >
                  <WorkoutCategoryCard category={category} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}