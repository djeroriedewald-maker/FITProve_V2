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
} from 'lucide-react';
import { ExerciseService } from '../lib/exercise.service';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { StatsCard } from '../components/ui/WorkoutCard';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

interface ModuleCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ElementType;
  color: string; // e.g. 'text-primary'
  gradient: string; // e.g. 'from-primary/30 to-accent/20'
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
    color: 'text-primary',
    gradient: 'from-primary/30 to-accent/20',
    stats: {
      exercises: 0, // Will be replaced dynamically
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
    gradient: 'from-green-400/30 to-emerald-400/20',
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
    color: 'text-secondary',
    gradient: 'from-secondary/30 to-pink-400/20',
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
    color: 'text-accent',
    gradient: 'from-accent/30 to-yellow-400/20',
    stats: {
      sessions: 60,
      duration: '5-45 min',
    },
    comingSoon: true,
  },
];

/* --------------------------------- UI ---------------------------------- */

function ModuleCard({ module }: { module: ModuleCategory }) {
  const Icon = module.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <GlassCard className="relative overflow-hidden group">
        {/* Image */}
        <div className="relative h-56 w-full">
          <ProgressiveImage
            src={module.image}
            alt={`${module.title} cover`}
            className="w-full h-full object-cover"
          />
          {/* gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${module.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Coming soon badge */}
          {module.comingSoon && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm">
                Coming soon
              </span>
            </div>
          )}

          {/* Title + description */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-5 w-5 ${module.color}`} />
              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
            </div>
            <p className="text-sm text-white/80 line-clamp-2">{module.description}</p>

            {/* Stats chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {'exercises' in module.stats && typeof module.stats.exercises === 'number' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                  <Dumbbell className="h-3 w-3" />
                  <span>{module.stats.exercises} exercises</span>
                </div>
              )}
              {'workouts' in module.stats && typeof module.stats.workouts === 'number' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                  <Trophy className="h-3 w-3" />
                  <span>{module.stats.workouts} workouts</span>
                </div>
              )}
              {'recipes' in module.stats && typeof module.stats.recipes === 'number' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                  <Utensils className="h-3 w-3" />
                  <span>{module.stats.recipes}+ recipes</span>
                </div>
              )}
              {'sessions' in module.stats && typeof module.stats.sessions === 'number' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                  <Users className="h-3 w-3" />
                  <span>{module.stats.sessions} sessions</span>
                </div>
              )}
              {module.stats.duration && (
                <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                  <Clock className="h-3 w-3" />
                  <span>{module.stats.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subtle animated border on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ------------------------------ Page ----------------------------------- */

export function ModulesPage() {
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);
  const [moduleCategories, setModuleCategories] = useState<ModuleCategory[]>(baseModuleCategories);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Fetch exercise count safely
    async function fetchCounts() {
      try {
        const res = await ExerciseService.getExercises({ page: 1, pageSize: 1 });
        // Assume API returns { total_count: number }
        if (typeof res?.total_count === 'number') {
          setExerciseCount(res.total_count);
          setModuleCategories((prev) =>
            prev.map((m) =>
              m.id === 'workout' ? { ...m, stats: { ...m.stats, exercises: res.total_count } } : m
            )
          );
        }
      } catch {
        // On failure, keep defaults; you might want to set a fallback
        setExerciseCount(null);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-4 mb-20">
        <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden rounded-3xl flex items-center justify-center">
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <ProgressiveImage
              src="/images/training_modules.webp"
              alt="Training Modules Hero"
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Gradient overlay for readability */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,58,237,0.55) 0%, rgba(236,72,153,0.45) 50%, rgba(59,130,246,0.55) 100%)',
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Centered hero content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-4xl mx-auto"
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
                Transform Your
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {' '}
                  Lifestyle
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
                Embark on a journey of transformation with our expertly crafted training modules.
                <br />
                From intense workouts to mindful wellness, we&apos;ve got everything you need to
                reach your peak.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center">
                <button className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white font-semibold shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5" /> Pro Programs
                </button>
                <button className="px-6 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-white font-semibold shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" /> Fast Results
                </button>
                <button className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/80 text-white font-semibold shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" /> Community
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <StatsCard
              title="Exercise Library"
              value={exerciseCount !== null ? exerciseCount : '...'}
              icon={<Dumbbell className="w-6 h-6" />}
              glowColor="cyan"
              subtitle="Professional Moves"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <StatsCard
              title="Healthy Recipes"
              value="200+"
              icon={<Utensils className="w-6 h-6" />}
              glowColor="green"
              subtitle="Nutritious & Delicious"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <StatsCard
              title="Recovery Plans"
              value="80+"
              icon={<Heart className="w-6 h-6" />}
              glowColor="purple"
              subtitle="Science-backed"
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <StatsCard
              title="Mindfulness"
              value="60+"
              icon={<Brain className="w-6 h-6" />}
              glowColor="orange"
              subtitle="Guided Sessions"
            />
          </motion.div>
        </motion.div>

        {/* Decorative blobs */}
        <div className="absolute -inset-4 -z-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-8 left-1/3 w-32 h-32 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </section>

      {/* Module Grid */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Path</h2>
              <p className="text-white/70">
                Start your transformation with our specialized modules
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {moduleCategories.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Link
                  to={`/modules/${module.id}`}
                  className={`block ${module.comingSoon ? 'pointer-events-none' : ''}`}
                >
                  <ModuleCard module={module} />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GlassCard variant="workout" className="p-8 text-center relative overflow-hidden">
            {/* Animated background overlay */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 20%, var(--color-primary) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 80%, var(--color-secondary) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 80%, var(--color-accent) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 20%, var(--color-primary) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Ready to
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    {' '}
                    Transform
                  </span>
                  ?
                </h2>
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of others who have already started their fitness journey. Our
                  workout module is the perfect starting point for your transformation!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <GlassButton
                      size="lg"
                      onClick={() => (window.location.href = '/modules/workout')}
                      className="relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 transform group-hover:translate-x-full transition-transform duration-500" />
                      <div className="relative flex items-center">
                        <Dumbbell className="w-5 h-5 mr-2" />
                        Start Your Journey
                        <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </GlassButton>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/modules" className="inline-block">
                      <GlassButton variant="secondary" size="lg" className="group">
                        <div className="relative flex items-center">
                          <span>Browse All Modules</span>
                          <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </GlassButton>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Social proof */}
              <motion.div
                className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-white/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>1000+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>Pro Trainers</span>
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}
