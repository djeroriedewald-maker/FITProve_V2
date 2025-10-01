import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Clock, Flame, BookOpen, Wrench, ArrowUp, ArrowDown } from 'lucide-react';
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
  link: string;
}

const defaultWorkoutCategories: WorkoutCategory[] = [
  {
    id: 'workout-generator',
    title: 'Workout Generator',
    description: 'Laat ons een workout voor je bouwen! Beantwoord een paar vragen en krijg een persoonlijk plan.',
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
    link: '/workout-generator',
  },
  {
    id: 'community-workouts',
    title: 'Community Workouts',
    description: 'Browse and join workouts created by other users. Only public workouts are shown, including the creator name.',
    icon: Library,
    color: 'text-yellow-500',
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
    link: '/modules/workout/community',
  },
  {
    id: 'exercise-library',
    title: 'Exercise Library',
    description: 'Comprehensive collection of exercises with detailed instructions, proper form guidance, and muscle targeting information.',
    icon: Library,
    color: 'text-blue-500',
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
    link: '/modules/workout/exercise-library',
  },
  {
    id: 'workout-library',
    title: 'Workout Library',
    description: 'Pre-designed complete workout routines created by fitness experts for different goals and fitness levels.',
    icon: BookOpen,
    color: 'text-green-500',
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
    link: '/modules/workout/workout-library',
  },
  {
    id: 'workout-creator',
    title: 'Workout Creator',
    description: 'Build custom workout routines by selecting exercises from our library. Perfect for creating personalized training sessions.',
    icon: Wrench,
    color: 'text-purple-500',
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
    link: '/modules/workout/workout-creator',
  },
];

interface WorkoutCategoryCardProps {
  category: WorkoutCategory;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

function WorkoutCategoryCard({
  category,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: WorkoutCategoryCardProps) {
  const Icon = category.icon;
  const isGenerator = category.id === 'workout-generator';
  const isCommunity = category.id === 'community-workouts';
  const isExerciseLibrary = category.id === 'exercise-library';
  const isWorkoutLibrary = category.id === 'workout-library';
  const isCreator = category.id === 'workout-creator';

  // Neon kleuren per kaart
  const neon = isGenerator
    ? '#FF9100'
    : isCreator
    ? '#B620FF'
    : isCommunity
    ? '#FFD600'
    : isExerciseLibrary
    ? '#00E0FF'
    : isWorkoutLibrary
    ? '#00FF90'
    : '#fff';

  // Achtergrondafbeelding per kaart
  const bgImage =
    isGenerator
      ? '/images/workout_generator.webp'
      : isCreator
      ? '/images/workout_creator1.webp'
      : isCommunity
      ? '/images/community_workout1.webp'
      : isExerciseLibrary
      ? '/images/exercise_library1.webp'
      : isWorkoutLibrary
      ? '/images/workout_library1.webp'
      : undefined;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
      {/* Achtergrondafbeelding + overlay */}
      {bgImage && (
        <>
          <img
            src={bgImage}
            alt={`${category.title} Background`}
            className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
            style={{ pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
        </>
      )}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-50`} />

      {/* Re-order buttons rechtsonder */}
      {(onMoveUp || onMoveDown) && (
        <div className="absolute bottom-2 right-2 z-30 flex flex-col items-center gap-2">
          <span className="text-xs font-semibold text-white bg-black/60 rounded px-2 py-0.5 mb-1 select-none" style={{ textShadow: '0 2px 8px #000' }}>Re-order</span>
          <button
            aria-label="Move up"
            className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 shadow"
            onClick={e => { e.stopPropagation(); e.preventDefault(); onMoveUp && onMoveUp(); }}
            disabled={!canMoveUp}
            style={{ opacity: canMoveUp ? 1 : 0.3 }}
            tabIndex={-1}
            type="button"
          >
            <ArrowUp className="w-7 h-7" />
          </button>
          <button
            aria-label="Move down"
            className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 shadow"
            onClick={e => { e.stopPropagation(); e.preventDefault(); onMoveDown && onMoveDown(); }}
            disabled={!canMoveDown}
            style={{ opacity: canMoveDown ? 1 : 0.3 }}
            tabIndex={-1}
            type="button"
          >
            <ArrowDown className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Coming Soon Badge */}
      {category.comingSoon && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-semibold rounded-full z-10">
          Coming Soon
        </div>
      )}

      {/* Content */}
      <div
        className="relative p-6 z-20"
        style={{
          color: '#fff',
          textShadow: '0 2px 8px #000, 0 0 2px #000',
          fontWeight: 700,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl backdrop-blur-sm bg-black/70">
            <Icon
              className="h-8 w-8"
              style={{
                color: neon,
                filter: `drop-shadow(0 0 8px ${neon})`,
              }}
            />
          </div>
          <div className="text-right">
            <div
              style={{
                color: neon,
                textShadow: `0 0 8px ${neon}, 0 2px 8px #000`,
              }}
              className="text-2xl font-bold"
            >
              {category.stats.count}+
            </div>
            <div className="text-sm" style={{ color: '#fff' }}>
              {category.stats.label}
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <h3
          className="text-xl font-bold mb-3"
          style={{
            color: '#fff',
            textShadow: '0 2px 8px #000, 0 0 2px #000',
          }}
        >
          {category.title}
        </h3>
        <p
          className="text-sm mb-4 line-clamp-3"
          style={{
            color: '#fff',
            textShadow: '0 2px 8px #000',
          }}
        >
          {category.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {category.features.slice(0, 3).map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
              style={{
                color: '#fff',
                textShadow: '0 2px 8px #000',
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${neon} 0%, #fff 100%)`,
                }}
              />
              <span>{feature}</span>
            </div>
          ))}
          {category.features.length > 3 && (
            <div
              className="text-xs ml-3"
              style={{
                color: '#fff',
                textShadow: '0 2px 8px #000',
              }}
            >
              +{category.features.length - 3} more features
            </div>
          )}
        </div>

        {/* Action Button / Info */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-sm"
            style={{
              color: '#fff',
              textShadow: '0 2px 8px #000',
            }}
          >
            <Clock
              className="h-4 w-4"
              style={{
                color: neon,
                filter: `drop-shadow(0 0 8px ${neon})`,
              }}
            />
            <span>5-60 min</span>
          </div>
        </div>
      </div>
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );
}

export function WorkoutPage() {
  const STORAGE_KEY = 'fitprove_card_order_v1';
  const [categories, setCategories] = React.useState<WorkoutCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids)) {
          const map = Object.fromEntries(defaultWorkoutCategories.map(c => [c.id, c]));
          return ids.map((id: string) => map[id]).filter(Boolean).concat(
            defaultWorkoutCategories.filter(c => !ids.includes(c.id))
          );
        }
      }
    } catch {}
    return defaultWorkoutCategories;
  });

  // Live statistieken state
  const [stats, setStats] = React.useState({
    exercises: 0,
    workouts: 0,
    customWorkouts: 0,
    communityWorkouts: 0,
    generatedWorkouts: 0,
  });

  React.useEffect(() => {
    async function fetchStats() {
      const [{ count: exercises }, { count: workouts }, { count: customWorkouts }] = await Promise.all([
        supabase.from('exercises').select('id', { count: 'exact', head: true }),
        supabase.from('workouts').select('id', { count: 'exact', head: true }),
        supabase.from('custom_workouts').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        exercises: exercises ?? 0,
        workouts: workouts ?? 0,
        customWorkouts: customWorkouts ?? 0,
        communityWorkouts: customWorkouts ?? 0, // Pas aan als je een aparte tabel hebt
        generatedWorkouts: workouts ?? 0, // Pas aan als je een aparte tabel hebt
      });
    }
    fetchStats();
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories.map(c => c.id)));
  }, [categories]);

  const moveCard = (from: number, to: number) => {
    if (to < 0 || to >= categories.length) return;
    const updated = [...categories];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setCategories(updated);
  };

  const getStatCount = (category: WorkoutCategory) => {
    switch (category.id) {
      case 'exercise-library':
        return stats.exercises;
      case 'workout-library':
        return stats.workouts;
      case 'workout-creator':
        return stats.customWorkouts;
      case 'community-workouts':
        return stats.communityWorkouts;
      case 'workout-generator':
        return stats.generatedWorkouts;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black pb-8">
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center mb-8">
        <img
          src="/images/workout_1.webp"
          alt="Workouts Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-black/30" style={{ zIndex: 1 }} />
        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center m-0 p-0" style={{ textShadow: 'none' }}>Workouts</h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <p className="text-center text-base sm:text-lg text-gray-800 dark:text-gray-200">
          Ontdek, genereer of bouw je eigen workouts. Sleep de kaarten om je favoriete modules bovenaan te zetten. Klik op een kaart om direct te starten!
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-4">
        <BackButton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <div key={category.id} className="relative h-full">
              <Link to={category.link} className="h-full" style={{ textDecoration: 'none' }}>
                <WorkoutCategoryCard
                  category={{
                    ...category,
                    stats: {
                      ...category.stats,
                      count: getStatCount(category),
                    },
                  }}
                  onMoveUp={() => moveCard(idx, idx - 1)}
                  onMoveDown={() => moveCard(idx, idx + 1)}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < categories.length - 1}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

