import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Clock, Flame, BookOpen, Wrench, ArrowUp, ArrowDown } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import { motion } from 'framer-motion';

// Helper function to convert hex color to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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

const colorMap = {
  'workout-generator': {
    primary: '#f97316',
    secondary: '#f43f5e',
  },
  'workout-creator': {
    primary: '#a855f7',
    secondary: '#ec4899',
  },
  'community-workouts': {
    primary: '#10b981',
    secondary: '#22c55e',
  },
  'exercise-library': {
    primary: '#06b6d4',
    secondary: '#3b82f6',
  },
  'workout-library': {
    primary: '#f59e0b',
    secondary: '#eab308',
  },
};

const defaultWorkoutCategories: WorkoutCategory[] = [
  {
    id: 'workout-generator',
    title: 'Workout Generator',
    description:
      'Let us build a workout for you! Answer a few questions and get a personalized plan.',
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
      count: 500,
      label: 'Workouts',
    },
    link: '/workout-generator',
  },
  {
    id: 'workout-creator',
    title: 'Workout Creator',
    description:
      'Build your own workouts with our intuitive drag & drop interface. Fully customizable.',
    icon: Wrench,
    color: 'text-purple-500',
    gradient: 'from-purple-400/20 to-pink-400/20',
    features: [
      'Drag & drop interface',
      'Custom exercise selection',
      'Sets, reps & timing',
      'Save & share workouts',
      'Template library',
      'Progress tracking',
    ],
    stats: {
      count: 1200,
      label: 'Custom Workouts',
    },
    link: '/modules/workout/workout-creator',
  },
  {
    id: 'community-workouts',
    title: 'Community Workouts',
    description:
      'Discover workouts shared by our community. Ratings, reviews, and personal experiences.',
    icon: BookOpen,
    color: 'text-emerald-500',
    gradient: 'from-emerald-400/20 to-green-400/20',
    features: [
      'Community created',
      'User ratings & reviews',
      'Difficulty levels',
      'Popular & trending',
      'Save favorites',
      'Share your own',
    ],
    stats: {
      count: 800,
      label: 'Community',
    },
    link: '/modules/workout/community',
  },
  {
    id: 'exercise-library',
    title: 'Exercise Library',
    description:
      'Comprehensive database of exercises with instructions, tips, and demonstration videos.',
    icon: Library,
    color: 'text-cyan-500',
    gradient: 'from-cyan-400/20 to-blue-400/20',
    features: [
      'Detailed instructions',
      'Video demonstrations',
      'Muscle group targeting',
      'Equipment filters',
      'Difficulty ratings',
      'Progress tracking',
    ],
    stats: {
      count: 2500,
      label: 'Exercises',
    },
    link: '/modules/workout/exercise-library',
  },
  {
    id: 'workout-library',
    title: 'Workout Library',
    description:
      'Pre-made workouts by fitness experts. Tested, optimized, and ready to use.',
    icon: BookOpen,
    color: 'text-amber-500',
    gradient: 'from-amber-400/20 to-yellow-400/20',
    features: [
      'Expert designed',
      'Tested & optimized',
      'Various goals',
      'Time-based filters',
      'Equipment options',
      'Progress tracking',
    ],
    stats: {
      count: 300,
      label: 'Workouts',
    },
    link: '/modules/workout/workout-library',
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
  // The icon component will be used directly from the category object
  const colors = colorMap[category.id as keyof typeof colorMap] || {
    primary: '#ffffff',
    secondary: '#f3f4f6',
  };
  const neon = colors.primary;

  const bgImage = {
    'workout-generator': '/images/workout_generator.webp',
    'workout-creator': '/images/workout_creator1.webp',
    'community-workouts': '/images/community_workout1.webp',
    'exercise-library': '/images/exercise_library1.webp',
    'workout-library': '/images/workout_library1.webp',
  }[category.id];

  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.96 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
    >
      {/* Glass morphism card base */}
      <div className="relative h-full glass-card border border-white/10 overflow-hidden group-hover:border-white/20 transition-all duration-500">
        {/* Animated background image */}
        {bgImage && (
          <motion.img
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
            src={bgImage}
            alt={`${category.title} Background`}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7 }}
          />
        )}

        {/* Glass overlay gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%), radial-gradient(ellipse at center, ${hexToRgba(colors.primary, 0.1)} 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Top section with controls */}
          <div className="flex justify-between items-start mb-4">
            {/* Reorder controls */}
            {(onMoveUp || onMoveDown) && (
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="p-1 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveUp && onMoveUp();
                  }}
                  disabled={!canMoveUp}
                  style={{ opacity: canMoveUp ? 1 : 0.3 }}
                >
                  <ArrowUp className="h-3 w-3 text-white" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveDown && onMoveDown();
                  }}
                  disabled={!canMoveDown}
                  style={{ opacity: canMoveDown ? 1 : 0.3 }}
                >
                  <ArrowDown className="h-3 w-3 text-white" />
                </button>
              </div>
            )}

            {/* Coming soon badge */}
            {category.comingSoon && (
              <div className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full">
                <span className="text-orange-300 text-xs font-medium">Coming Soon</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-2 text-right">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {React.createElement(category.icon, {
                    className: 'h-5 w-5',
                    style: {
                      color: neon,
                      filter: `drop-shadow(0 0 8px ${neon})`,
                    },
                  })}
                </div>
                <div
                  className="text-lg font-bold"
                  style={{
                    color: neon,
                    textShadow: `0 0 8px ${neon}, 0 2px 8px #000`,
                  }}
                >
                  {category.stats.count}+
                </div>
                <div className="text-xs text-white/70">{category.stats.label}</div>
              </div>
            </div>
          </div>

          {/* Title and description */}
          <div className="flex-grow">
            <h3
              className="text-xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300"
              style={{
                color: neon,
                textShadow: `0 0 12px ${neon}, 0 2px 8px #000`,
              }}
            >
              {category.title}
            </h3>
            <p className="text-white/80 text-sm mb-4 leading-relaxed">{category.description}</p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              {category.features.slice(0, 3).map((feature: string, index: number) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 text-xs text-white/70"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${neon} 0%, #fff 100%)`,
                    }}
                  />
                  <span>{feature}</span>
                </motion.div>
              ))}
              {category.features.length > 3 && (
                <motion.div
                  className="text-xs text-white/50 pl-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  +{category.features.length - 3} more features
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom section - Duration */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2 text-white/70 text-sm">
              <Clock
                className="h-4 w-4"
                style={{
                  color: colors.primary,
                  filter: `drop-shadow(0 0 8px ${colors.primary})`,
                }}
              />
              <span>5-60 min</span>
            </div>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

        {/* Floating orb effect */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${hexToRgba(colors.primary, 0.2)} 0%, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function WorkoutPage() {
  const STORAGE_KEY = 'fitprove_card_order_v1';
  const [workoutCards, setWorkoutCards] = React.useState<WorkoutCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids)) {
          const map = Object.fromEntries(defaultWorkoutCategories.map((c) => [c.id, c]));
          return ids
            .map((id: string) => map[id])
            .filter(Boolean)
            .concat(defaultWorkoutCategories.filter((c) => !ids.includes(c.id)));
        }
      }
    } catch (error) {
      console.error('Error loading saved card order:', error);
    }
    return defaultWorkoutCategories;
  });

  const [stats] = React.useState({
    exercises: 0,
    workouts: 0,
    customWorkouts: 0,
  });

  React.useEffect(() => {
    const loadStats = async () => {
      // Load stats logic here
    };
    loadStats();
  }, []);

  const moveCard = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workoutCards.length) return;

    const newCards = [...workoutCards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, movedCard);

    setWorkoutCards(newCards);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards.map((c) => c.id)));
  };

  const getStatCount = (category: WorkoutCategory) => {
    switch (category.id) {
      case 'workout-generator':
        return stats.workouts || category.stats.count;
      case 'workout-creator':
        return stats.customWorkouts || category.stats.count;
      default:
        return category.stats.count;
    }
  };

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section with Glass Morphism */}
      <section className="relative -mx-4 -mt-4">
        <div className="relative w-full h-[40vh] sm:h-[50vh] overflow-hidden rounded-b-3xl">
          <img
            src="/images/workout_hero.webp"
            alt="Workout Module Hero"
            className="w-full h-full object-cover"
          />
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
      </section>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between items-center mb-8">
            <BackButton />
            <div className="flex-1 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Workout Modules
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto text-center">
                Transform your fitness journey with our complete workout system
              </p>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {workoutCards.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="h-96"
            >
              <Link to={category.link} className="block h-full">
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
                  canMoveDown={idx < workoutCards.length - 1}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
