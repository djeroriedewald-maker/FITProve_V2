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
  color: string;
  gradient: string;
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
    description:
      'Healthy recipes, meal plans, and nutrition guidance to fuel your body optimally.',
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

function ModuleCard({ module }: { module: ModuleCategory }) {
  const Icon = module.icon;

  const getGlowColor = () => {
    switch (module.color) {
      case 'text-primary': return 'cyan';
      case 'text-secondary': return 'purple';
      case 'text-accent': return 'orange';
      case 'text-green-400': return 'green';
      default: return 'cyan';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <GlassCard 
        variant="workout" 
        glowColor={getGlowColor() as any}
        className="h-full relative overflow-hidden"
      >
        {/* Background Image with Glass Overlay */}
        <div className="relative h-48 -mx-4 -mt-4 mb-4 overflow-hidden rounded-t-xl">
          <ProgressiveImage
            src={module.image}
            alt={module.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Glass morphism overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${module.gradient} to-transparent`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Coming Soon Badge */}
          {module.comingSoon && (
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-4 right-4 px-3 py-1 bg-glass-white backdrop-blur-md border border-yellow-400/50 text-yellow-300 text-xs font-semibold rounded-full"
            >
              ✨ Coming Soon
            </motion.div>
          )}

          {/* Icon with Glass Background */}
          <div className="absolute top-4 left-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 bg-glass-white backdrop-blur-xl rounded-xl border border-white/20 shadow-lg"
            >
              <Icon className={`h-6 w-6 ${module.color} drop-shadow-lg`} />
            </motion.div>
          </div>

          {/* Floating Animation Orb */}
          <motion.div
            className={`absolute bottom-4 right-4 w-8 h-8 rounded-full opacity-60`}
            style={{
              background: module.color === 'text-primary' ? '#00E5FF' :
                         module.color === 'text-secondary' ? '#B400FF' :
                         module.color === 'text-accent' ? '#FF6B35' : '#00FF87',
              filter: 'blur(8px)'
            }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
              {module.title}
            </h3>
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="h-5 w-5 text-white/60 group-hover:text-primary transition-colors" />
            </motion.div>
          </div>

          <p className="text-white/70 text-sm mb-4 line-clamp-2 leading-relaxed">
            {module.description}
          </p>

          {/* Stats with Glass Pills */}
          <div className="flex flex-wrap gap-2">
            {typeof module.stats.exercises === 'number' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                <Dumbbell className="h-3 w-3" />
                <span>{module.stats.exercises} exercises</span>
              </div>
            )}
            {typeof module.stats.workouts === 'number' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                <Star className="h-3 w-3" />
                <span>{module.stats.workouts} workouts</span>
              </div>
            )}
            {typeof module.stats.recipes === 'number' && (
              <div className="flex items-center gap-1 px-2 py-1 bg-glass-white-light rounded-full text-xs text-white/80">
                <Utensils className="h-3 w-3" />
                <span>{module.stats.recipes} recipes</span>
              </div>
            )}
            {typeof module.stats.sessions === 'number' && (
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

        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent`} />
          <div className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent`} />
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function ModulesPage() {
  const [exerciseCount, setExerciseCount] = useState<number | null>(null);
  const [moduleCategories, setModuleCategories] =
    useState<ModuleCategory[]>(baseModuleCategories);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Fetch exercise count
    ExerciseService.getExercises({ page: 1, pageSize: 1 }).then((res) => {
      setExerciseCount(res.total_count);
      // Update moduleCategories with real count
      setModuleCategories((prev) =>
        prev.map((mod) =>
          mod.id === 'workout'
            ? { ...mod, stats: { ...mod.stats, exercises: res.total_count } }
            : mod
        )
      );
    });
  }, []);

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section with Glass Morphism */}
      <section className="relative -mx-4 -mt-4">
        <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden rounded-3xl">
          <ProgressiveImage
            src="/images/training_modules.webp"
            alt="Training Modules Hero"
            className="w-full h-full object-cover"
          />
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-6">
          <GlassCard variant="hero" className="max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Training
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Modules</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
                Discover comprehensive training programs designed to transform your fitness journey. 
                From strength building to mindful wellness, find the perfect module for your goals.
              </p>

              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-primary">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium">Professional Programs</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Zap className="w-5 h-5" />
                  <span className="text-sm font-medium">Fast Results</span>
                </div>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Module Stats Overview */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Exercises"
            value={exerciseCount !== null ? exerciseCount : "..."}
            icon={<Dumbbell className="w-6 h-6" />}
            glowColor="cyan"
          />
          <StatsCard
            title="Recipes"
            value="200+"
            icon={<Utensils className="w-6 h-6" />}
            glowColor="green"
          />
          <StatsCard
            title="Recovery"
            value="80+"
            icon={<Heart className="w-6 h-6" />}
            glowColor="purple"
          />
          <StatsCard
            title="Zen Sessions"
            value="60+"
            icon={<Brain className="w-6 h-6" />}
            glowColor="orange"
          />
        </motion.div>
      </section>

      {/* Module Categories Grid */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Path</h2>
              <p className="text-white/70">Start your transformation with our specialized modules</p>
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

      {/* Call to Action */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GlassCard variant="workout" className="p-8 text-center">
            <div className="relative">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Begin with our workout module featuring expertly crafted exercise routines. More
                  modules coming soon to complete your wellness journey!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlassButton size="lg" onClick={() => window.location.href = "/modules/workout"}>
                    <Dumbbell className="w-5 h-5 mr-2" />
                    Start with Workouts
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </GlassButton>
                  
                  <GlassButton variant="secondary" size="lg">
                    Explore All Modules
                  </GlassButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}

