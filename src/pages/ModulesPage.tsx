import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  Utensils,
  Heart,
  Brain,
  ArrowRight,
  Star,
  Clock,
  Users,
  Zap,
  Trophy,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ExerciseService } from '../lib/exercise.service';

interface ModuleCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  accentGradient: string;
  stats: {
    exercises?: number;
    workouts?: number;
    recipes?: number;
    sessions?: number;
    duration?: string;
  };
  comingSoon?: boolean;
}

const baseModuleCategories: ModuleCategory[] = [
  {
    id: 'workout',
    title: 'Workout',
    description:
      'Exercise library and workout programs to build strength, endurance, and achieve your fitness goals.',
    image: '/images/workout_1.webp',
    icon: Dumbbell,
    color: 'text-orange-400',
    gradient: 'from-orange-600 to-pink-600',
    accentGradient: 'from-orange-500/30 to-pink-500/30',
    stats: {
      exercises: 0,
      workouts: 45,
      duration: '15-60 min',
    },
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'Healthy recipes, meal plans, and nutrition guidance to fuel your body optimally.',
    image: '/images/food.webp',
    icon: Utensils,
    color: 'text-green-400',
    gradient: 'from-green-600 to-emerald-600',
    accentGradient: 'from-green-500/30 to-emerald-500/30',
    stats: {
      recipes: 200,
      duration: '10-45 min',
    },
    comingSoon: true,
  },
  {
    id: 'recovery',
    title: 'Recovery',
    description:
      'Stretching routines, mobility exercises, and recovery techniques for optimal performance.',
    image: '/images/recovering.webp',
    icon: Heart,
    color: 'text-rose-400',
    gradient: 'from-rose-600 to-pink-600',
    accentGradient: 'from-rose-500/30 to-pink-500/30',
    stats: {
      sessions: 80,
      duration: '5-30 min',
    },
    comingSoon: true,
  },
  {
    id: 'zen',
    title: 'Zen',
    description:
      'Meditation practices, yoga sessions, and mindfulness exercises for mental wellness.',
    image: '/images/mindset.webp',
    icon: Brain,
    color: 'text-purple-400',
    gradient: 'from-purple-600 to-blue-600',
    accentGradient: 'from-purple-500/30 to-blue-500/30',
    stats: {
      sessions: 60,
      duration: '5-45 min',
    },
    comingSoon: true,
  },
];

function ModuleCard({ module }: { module: ModuleCategory }) {
  const Icon = module.icon;

  return (
    <Link
      to={`/modules/${module.id}`}
      className={`block ${module.comingSoon ? 'pointer-events-none' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative h-full"
      >
        {/* Glass Card */}
        <div className="relative h-full overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Image Background */}
          <div className="relative h-72 overflow-hidden">
            <motion.img
              src={module.image}
              alt={module.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-br ${module.accentGradient}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Glow Effect on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

            {/* Coming Soon Badge */}
            {module.comingSoon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 z-10"
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
            <div className="absolute top-4 left-4">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} rounded-xl blur opacity-50`} />
                <div className={`relative p-3 rounded-xl bg-gradient-to-br ${module.gradient}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="relative p-6">
            {/* Title */}
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-white/70 transition-all">
              {module.title}
            </h3>

            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-2">
              {module.description}
            </p>

            {/* Stats Grid */}
            <div className="flex flex-wrap gap-2 mb-4">
              {'exercises' in module.stats && typeof module.stats.exercises === 'number' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 backdrop-blur-sm">
                  <Dumbbell className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-medium">{module.stats.exercises} exercises</span>
                </div>
              )}
              {'workouts' in module.stats && typeof module.stats.workouts === 'number' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 backdrop-blur-sm">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="font-medium">{module.stats.workouts} workouts</span>
                </div>
              )}
              {'recipes' in module.stats && typeof module.stats.recipes === 'number' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 backdrop-blur-sm">
                  <Utensils className="w-3.5 h-3.5 text-green-400" />
                  <span className="font-medium">{module.stats.recipes}+ recipes</span>
                </div>
              )}
              {'sessions' in module.stats && typeof module.stats.sessions === 'number' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 backdrop-blur-sm">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-medium">{module.stats.sessions} sessions</span>
                </div>
              )}
              {module.stats.duration && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 backdrop-blur-sm">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-medium">{module.stats.duration}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {!module.comingSoon && (
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            )}
          </div>

          {/* Bottom Gradient Border */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </motion.div>
    </Link>
  );
}

export function ModulesPage() {
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);
  const [moduleCategories, setModuleCategories] = useState<ModuleCategory[]>(baseModuleCategories);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    async function fetchCounts() {
      try {
        const res = await ExerciseService.getExercises({ page: 1, pageSize: 1 });
        if (typeof res?.total_count === 'number') {
          setExerciseCount(res.total_count);
          setModuleCategories((prev) =>
            prev.map((m) =>
              m.id === 'workout' ? { ...m, stats: { ...m.stats, exercises: res.total_count } } : m
            )
          );
        }
      } catch {
        setExerciseCount(null);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Section - Compact Premium Design */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative -mx-4 mb-12"
      >
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/training_modules.webp"
              alt="Training Modules"
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

          {/* Content */}
          <div className="relative px-8 py-16 md:py-20 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
                  Premium Training Modules
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Transform Your
                <span className="block bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Lifestyle
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Embark on a journey of transformation with our expertly crafted training modules.
                From intense workouts to mindful wellness.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white font-semibold shadow-lg shadow-orange-500/25 flex items-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  Pro Programs
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  Fast Results
                </motion.button>
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
        {[
          { icon: Dumbbell, label: 'Exercises', value: exerciseCount || '...', color: 'from-orange-500 to-pink-500' },
          { icon: Utensils, label: 'Recipes', value: '200+', color: 'from-green-500 to-emerald-500' },
          { icon: Heart, label: 'Recovery', value: '80+', color: 'from-rose-500 to-pink-500' },
          { icon: Brain, label: 'Mindfulness', value: '60+', color: 'from-purple-500 to-blue-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group"
          >
            <div className="relative h-full overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-5 shadow-xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

              <div className="relative">
                <div className="relative inline-block mb-3">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl blur opacity-50`} />
                  <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div>
                  <p className="text-white/60 text-xs font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Module Grid */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-orange-400" />
                Choose Your Path
              </h2>
              <p className="text-white/60">
                Start your transformation with our specialized modules
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {moduleCategories.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ModuleCard module={module} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16"
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

          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Transform{' '}
              </span>
              ?
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Join thousands of others who have already started their fitness journey. Our
              workout module is the perfect starting point!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = '/modules/workout')}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold shadow-2xl shadow-orange-500/25 flex items-center gap-2 group"
              >
                <Dumbbell className="w-5 h-5" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>1000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-orange-400" />
                <span>Pro Trainers</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
