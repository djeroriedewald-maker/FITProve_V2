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
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { BackButton } from "../components/ui/BackButton";

interface QuickStat {
  icon: React.ElementType;
  label: string;
  value: string | number;
  gradient: string;
}

interface WorkoutCategory {
  id: "workout-generator" | "workout-creator" | "community-workouts" | "exercise-library" | "workout-library";
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  accentGradient: string;
  features: string[];
  stats: {
    count: number;
    label: string;
  };
  comingSoon?: boolean;
  link: string;
}

function QuickStatCard({ stat }: { stat: QuickStat }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

        <div className="relative flex items-center gap-4">
          {/* Icon with gradient background */}
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-xl blur opacity-50`} />
            <div className={`relative p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <p className="text-white/60 text-xs font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const colorGradients = {
  "workout-generator": {
    gradient: "from-orange-600 to-pink-600",
    accentGradient: "from-orange-500/30 to-pink-500/30",
  },
  "workout-creator": {
    gradient: "from-purple-600 to-pink-600",
    accentGradient: "from-purple-500/30 to-pink-500/30",
  },
  "community-workouts": {
    gradient: "from-green-600 to-emerald-600",
    accentGradient: "from-green-500/30 to-emerald-500/30",
  },
  "exercise-library": {
    gradient: "from-cyan-600 to-blue-600",
    accentGradient: "from-cyan-500/30 to-blue-500/30",
  },
  "workout-library": {
    gradient: "from-amber-600 to-yellow-600",
    accentGradient: "from-amber-500/30 to-yellow-500/30",
  },
} as const;

const defaultWorkoutCategories: WorkoutCategory[] = [
  {
    id: "workout-generator",
    title: "Workout Generator",
    description:
      "Let us build a workout for you! Answer a few questions and get a personalized plan.",
    icon: Flame,
    color: "text-orange-400",
    gradient: "from-orange-600 to-pink-600",
    accentGradient: "from-orange-500/30 to-pink-500/30",
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
    color: "text-purple-400",
    gradient: "from-purple-600 to-pink-600",
    accentGradient: "from-purple-500/30 to-pink-500/30",
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
    color: "text-green-400",
    gradient: "from-green-600 to-emerald-600",
    accentGradient: "from-green-500/30 to-emerald-500/30",
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
    color: "text-cyan-400",
    gradient: "from-cyan-600 to-blue-600",
    accentGradient: "from-cyan-500/30 to-blue-500/30",
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
    color: "text-amber-400",
    gradient: "from-amber-600 to-yellow-600",
    accentGradient: "from-amber-500/30 to-yellow-500/30",
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative h-full"
    >
      {/* Card Container */}
      <div className="relative h-full overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* Background Image */}
        {bgImage && (
          <div className="absolute inset-0">
            <motion.img
              className="w-full h-full object-cover"
              src={bgImage}
              alt={category.title}
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/50" />
            <div className={`absolute inset-0 bg-gradient-to-br ${category.accentGradient}`} />
          </div>
        )}

        {/* Glow Effect on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col min-h-[450px]">
          {/* Top Bar */}
          <div className="flex justify-between items-start mb-4">
            {/* Move Buttons */}
            {(onMoveUp || onMoveDown) && (
              <div className="flex flex-col gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveUp?.();
                  }}
                  disabled={!canMoveUp}
                  style={{ opacity: canMoveUp ? 1 : 0.3 }}
                  aria-label="Move card up"
                >
                  <ArrowUp className="h-3.5 w-3.5 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMoveDown?.();
                  }}
                  disabled={!canMoveDown}
                  style={{ opacity: canMoveDown ? 1 : 0.3 }}
                  aria-label="Move card down"
                >
                  <ArrowDown className="h-3.5 w-3.5 text-white" />
                </motion.button>
              </div>
            )}

            {/* Coming Soon Badge */}
            {category.comingSoon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full blur" />
                  <div className="relative px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    COMING SOON
                  </div>
                </div>
              </motion.div>
            )}

            {/* Icon Badge */}
            <div className="ml-auto">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-xl blur opacity-50`} />
                <div className={`relative p-3 rounded-xl bg-gradient-to-br ${category.gradient}`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-grow mb-6">
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-white/70 transition-all">
              {category.title}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              {category.description}
            </p>

            {/* Features - First 3 */}
            <div className="space-y-2">
              {category.features.slice(0, 3).map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-xs text-white/70"
                >
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.gradient}`} />
                  <span>{feature}</span>
                </motion.div>
              ))}
              {category.features.length > 3 && (
                <p className="text-xs text-white/50 pl-3.5">
                  +{category.features.length - 3} more features
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              {/* Duration */}
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>5-60 min</span>
              </div>

              {/* Stats Badge */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-lg font-bold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`}>
                    {category.stats.count}+
                  </div>
                  <div className="text-xs text-white/60">{category.stats.label}</div>
                </div>
              </div>
            </div>

            {/* Explore Button */}
            {!category.comingSoon && (
              <motion.div
                whileHover={{ x: 4 }}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Gradient Border */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
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
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Dumbbell,
      label: "Total Workouts",
      value: "15k+",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Heart,
      label: "Calories Burned",
      value: "1.2M+",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: Trophy,
      label: "Goals Achieved",
      value: "8.5k+",
      gradient: "from-yellow-500 to-amber-500",
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
        className="fixed top-[72px] left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 z-40 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section - Compact Premium */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative -mx-4 mb-12"
      >
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="/images/workout_office_1.webp"
              alt="Workout Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20" />
          </div>

          {/* Animated Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-10 left-10 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 8, repeat: Infinity, delay: 1 }}
              className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"
            />
          </div>

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <BackButton />
          </div>

          {/* Content */}
          <div className="relative px-8 py-20 md:py-24 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="w-6 h-6 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
                  Workout Hub
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Transform Your Body,
                <span className="block bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Transform Your Life
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Access expert-designed workouts, create custom routines, and join a
                thriving community on your journey to a healthier lifestyle.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/workout-generator"
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Get Started Now
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/modules/workout/exercise-library"
                    className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                  >
                    Explore Exercises
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </motion.section>

      {/* Quick Stats - Premium Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <QuickStatCard stat={stat} />
          </motion.div>
        ))}
      </motion.section>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            Choose Your Path
          </h2>
          <p className="text-white/60">
            Explore our workout tools and find the perfect fit for your goals
          </p>
        </div>
      </div>

      {/* Workout Category Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {workoutCards.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
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

      {/* Weekly Challenge - Premium CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10" />

          {/* Animated Orb */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-3xl"
          />

          <div className="relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-orange-400" />
                  <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
                    Weekly Challenge
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Join This Week's Challenge
                </h2>
                <p className="text-white/80 mb-6 max-w-xl leading-relaxed">
                  Complete 5 different workouts and earn exclusive badges and rewards.
                  Compete with the community and push your limits!
                </p>

                <div className="flex flex-wrap gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/modules/workout/challenges"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2"
                    >
                      Join Challenge
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                  <button
                    type="button"
                    className="px-6 py-3 text-white/70 hover:text-white flex items-center gap-2 transition-colors"
                  >
                    Learn more
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Right Stats */}
              <div className="flex gap-4">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="text-center px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <Calendar className="w-6 h-6 text-orange-400 mb-2 mx-auto" />
                  <p className="text-white/60 text-sm mb-1">Days Left</p>
                  <p className="text-white font-bold text-2xl">5</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="text-center px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <Users className="w-6 h-6 text-pink-400 mb-2 mx-auto" />
                  <p className="text-white/60 text-sm mb-1">Participants</p>
                  <p className="text-white font-bold text-2xl">1.2k</p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="text-center px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <Trophy className="w-6 h-6 text-yellow-400 mb-2 mx-auto" />
                  <p className="text-white/60 text-sm mb-1">Prize Pool</p>
                  <p className="text-white font-bold text-2xl">500</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WorkoutPage;
