// src/routes/modules/workouts/index.tsx (example path)
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  BookOpen,
  Wrench,
  Zap,
  Library as LibraryIcon,
  ArrowRight,
  ChevronRight,
  Flame,
  Users,
  Dumbbell,
  Flame as Fire,
  Heart,
  Trophy,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { BackButton } from "../components/ui/BackButton";
import { GlassCard } from "../components/ui/GlassCard";

interface QuickStat {
  icon: React.ElementType;
  label: string;
  value: string | number;
  /** tailwind classes for color styling, e.g. 'bg-orange-500/20 text-orange-500' */
  color: string;
}

interface WorkoutCategory {
  id: "workout-generator" | "workout-creator" | "community-workouts" | "exercise-library" | "workout-library";
  title: string;
  description: string;
  icon: React.ElementType;
  /** tailwind color for legacy use (kept for compatibility) */
  color: string;
  /** tailwind gradient tokens used for background accents */
  gradient: string;
  features: string[];
  stats: {
    count: number;
    label: string;
  };
  comingSoon?: boolean;
  /** route link */
  link: string;
}

function QuickStatCard({ stat }: { stat: QuickStat }) {
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${stat.color} bg-white/10`}>
          <stat.icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white/80 text-sm font-medium">{stat.label}</p>
          <p className="text-white font-bold text-xl">{stat.value}</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to convert hex color to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Color map per category for neon accents
const colorMap = {
  "workout-generator": {
    primary: "#f97316",
    secondary: "#f43f5e",
  },
  "workout-creator": {
    primary: "#a855f7",
    secondary: "#ec4899",
  },
  "community-workouts": {
    primary: "#10b981",
    secondary: "#22c55e",
  },
  "exercise-library": {
    primary: "#06b6d4",
    secondary: "#3b82f6",
  },
  "workout-library": {
    primary: "#f59e0b",
    secondary: "#eab308",
  },
} as const;

const defaultWorkoutCategories: WorkoutCategory[] = [
  {
    id: "workout-generator",
    title: "Workout Generator",
    description:
      "Let us build a workout for you! Answer a few questions and get a personalized plan.",
    icon: Flame,
    color: "text-orange-500",
    gradient: "from-orange-400/20 to-red-400/20",
    features: [
      "Personalized onboarding",
      "Smart workout recommendations",
      "Goal & equipment based plans",
      "Beginner to advanced",
      "Fast and easy",
      "No account required",
    ],
    stats: {
      count: 500,
      label: "Generated",
    },
    link: "/workout-generator",
  },
  {
    id: "workout-creator",
    title: "Workout Creator",
    description:
      "Build your own workouts with our intuitive drag & drop interface. Fully customizable.",
    icon: Wrench,
    color: "text-purple-500",
    gradient: "from-purple-400/20 to-pink-400/20",
    features: [
      "Drag & drop interface",
      "Custom exercise selection",
      "Sets, reps & timing",
      "Save & share workouts",
      "Template library",
      "Progress tracking",
    ],
    stats: {
      count: 1200,
      label: "Custom Workouts",
    },
    link: "/modules/workout/workout-creator",
  },
  {
    id: "community-workouts",
    title: "Community Workouts",
    description:
      "Discover workouts shared by our community. Ratings, reviews, and personal experiences.",
    icon: BookOpen,
    color: "text-emerald-500",
    gradient: "from-emerald-400/20 to-green-400/20",
    features: [
      "Community created",
      "User ratings & reviews",
      "Difficulty levels",
      "Popular & trending",
      "Save favorites",
      "Share your own",
    ],
    stats: {
      count: 800,
      label: "Community",
    },
    link: "/modules/workout/community",
  },
  {
    id: "exercise-library",
    title: "Exercise Library",
    description:
      "Comprehensive database of exercises with instructions, tips, and demonstration videos.",
    icon: LibraryIcon,
    color: "text-cyan-500",
    gradient: "from-cyan-400/20 to-blue-400/20",
    features: [
      "Detailed instructions",
      "Video demonstrations",
      "Muscle group targeting",
      "Equipment filters",
      "Difficulty ratings",
      "Progress tracking",
    ],
    stats: {
      count: 2500,
      label: "Exercises",
    },
    link: "/modules/workout/exercise-library",
  },
  {
    id: "workout-library",
    title: "Workout Library",
    description:
      "Pre-made workouts by fitness experts. Tested, optimized, and ready to use.",
    icon: BookOpen,
    color: "text-amber-500",
    gradient: "from-amber-400/20 to-yellow-400/20",
    features: [
      "Expert designed",
      "Tested & optimized",
      "Various goals",
      "Time-based filters",
      "Equipment options",
      "Progress tracking",
    ],
    stats: {
      count: 300,
      label: "Workouts",
    },
    link: "/modules/workout/workout-library",
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
  const colors = colorMap[category.id] || {
    primary: "#ffffff",
    secondary: "#f3f4f6",
  };
  const neon = colors.primary;

  const bgImage =
    {
      "workout-generator": "/images/workout_generator.webp",
      "workout-creator": "/images/workout_creator1.webp",
      "community-workouts": "/images/community_workout1.webp",
      "exercise-library": "/images/exercise_library1.webp",
      "workout-library": "/images/workout_library1.webp",
    }[category.id] ?? "";

  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{
        scale: 1.02,
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="relative h-full glass-card border border-white/10 overflow-hidden group-hover:border-white/20 transition-all duration-500">
        {/* Background image */}
        {bgImage && (
          <motion.img
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
            src={bgImage}
            alt={`${category.title} Background`}
            initial={{ scale: 1 }}
          />
        )}

        {/* Glass overlay & neon glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%), radial-gradient(ellipse at center, ${hexToRgba(
              colors.primary,
              0.1
            )} 0%, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Top bar */}
          <div className="flex justify-between items-start mb-4">
            {(onMoveUp || onMoveDown) && (
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  className="p-1 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveUp?.();
                  }}
                  disabled={!canMoveUp}
                  style={{ opacity: canMoveUp ? 1 : 0.3 }}
                  aria-label="Move card up"
                >
                  <ArrowUp className="h-3 w-3 text-white" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveDown?.();
                  }}
                  disabled={!canMoveDown}
                  style={{ opacity: canMoveDown ? 1 : 0.3 }}
                  aria-label="Move card down"
                >
                  <ArrowDown className="h-3 w-3 text-white" />
                </button>
              </div>
            )}

            {category.comingSoon && (
              <div className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full">
                <span className="text-orange-300 text-xs font-medium">Coming Soon</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-right">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  {React.createElement(category.icon, {
                    className: "h-5 w-5",
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

          {/* Title / description */}
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
            <p className="text-white/80 text-sm mb-4 leading-relaxed">
              {category.description}
            </p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              {category.features.slice(0, 3).map((feature, index) => (
                <motion.div
                  key={feature}
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

          {/* Footer row */}
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

        {/* Hover veil */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

        {/* Floating orb */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${hexToRgba(
              colors.primary,
              0.2
            )} 0%, transparent 70%)`,
          }}
        />
      </div>
    </motion.div>
  );
}

export function WorkoutPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [quickStats] = useState<QuickStat[]>([
    {
      icon: Fire,
      label: "Active Users",
      value: "2.5k+",
      color: "bg-orange-500/20 text-orange-500",
    },
    {
      icon: Dumbbell,
      label: "Total Workouts",
      value: "15k+",
      color: "bg-blue-500/20 text-blue-500",
    },
    {
      icon: Heart,
      label: "Calories Burned",
      value: "1.2M+",
      color: "bg-red-500/20 text-red-500",
    },
    {
      icon: Trophy,
      label: "Goals Achieved",
      value: "8.5k+",
      color: "bg-yellow-500/20 text-yellow-500",
    },
  ]);

  const [workoutCards, setWorkoutCards] = useState<WorkoutCategory[]>(() => {
    try {
      const saved = localStorage.getItem("fitprove_card_order_v1");
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids)) {
          const map = Object.fromEntries(
            defaultWorkoutCategories.map((c) => [c.id, c])
          );
          return ids
            .map((id) => map[id as WorkoutCategory["id"]])
            .filter(Boolean) as WorkoutCategory[];
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading saved card order:", error);
    }
    return defaultWorkoutCategories;
  });

  const moveCard = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= workoutCards.length) return;

    const newCards = [...workoutCards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, movedCard);

    setWorkoutCards(newCards);
    localStorage.setItem(
      "fitprove_card_order_v1",
      JSON.stringify(newCards.map((c) => c.id))
    );
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative h-screen w-screen overflow-hidden -mx-4 md:-mx-8 mb-32">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/workout_office_1.webp"
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-transparent" />
        </div>

        <div className="relative h-full w-full max-w-[1920px] mx-auto px-4 md:px-8 pt-24 pb-48 flex flex-col justify-center items-center text-center z-20">
          <BackButton className="fixed top-6 left-6 z-50" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8">
              Transform Your Body,
              <div className="mt-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Transform Your Life
              </div>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed px-4">
              Access expert-designed workouts, create custom routines, and join a
              thriving community on your journey to a healthier lifestyle.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/workout-generator"
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Get Started Now
              </Link>
              <Link
                to="/modules/workout/exercise-library"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                Explore Exercises
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {quickStats.map((stat, index) => (
                <QuickStatCard key={index} stat={stat} />
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Categories */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.1 }}
        >
          {workoutCards.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * idx }}
            >
              <Link to={category.link} className="block h-full">
                <WorkoutCategoryCard
                  category={category}
                  onMoveUp={() => moveCard(idx, idx - 1)}
                  onMoveDown={() => moveCard(idx, idx + 1)}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < workoutCards.length - 1}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Weekly Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <GlassCard className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20" />
            <div className="relative p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Weekly Challenge 🔥
                  </h2>
                  <p className="text-white/80 mb-4 max-w-xl">
                    Join this week&apos;s community challenge! Complete 5 different
                    workouts and earn exclusive badges and rewards.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/modules/workout/challenges"
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                    >
                      Join Challenge
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                      type="button"
                      className="px-6 py-3 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      Learn more
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center px-6 py-4 bg-black/30 rounded-xl">
                    <Calendar className="w-6 h-6 text-white mb-2 mx-auto" />
                    <p className="text-white/70 text-sm">Days Left</p>
                    <p className="text-white font-bold text-2xl">5</p>
                  </div>
                  <div className="text-center px-6 py-4 bg-black/30 rounded-xl">
                    <Users className="w-6 h-6 text-white mb-2 mx-auto" />
                    <p className="text-white/70 text-sm">Participants</p>
                    <p className="text-white font-bold text-2xl">1.2k</p>
                  </div>
                  <div className="text-center px-6 py-4 bg-black/30 rounded-xl">
                    <Trophy className="w-6 h-6 text-white mb-2 mx-auto" />
                    <p className="text-white/70 text-sm">Prize Pool</p>
                    <p className="text-white font-bold text-2xl">500</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

export default WorkoutPage;
