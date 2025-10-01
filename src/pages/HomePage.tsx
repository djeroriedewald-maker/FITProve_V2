import {
  Heart,
  Dumbbell,
  Flame,
  Trophy,
  ArrowRight,
  Activity,
  Target,
  Users,
  Calendar,
  Zap,
  Brain,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { WorkoutCard, StatsCard } from '../components/ui/WorkoutCard';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';
import { FeaturedCommunityWorkoutsSlider } from '../components/community/FeaturedCommunityWorkoutsSlider';
import { UpcomingEventsSlider } from '../components/ui/UpcomingEventsSlider';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import {
  FloatingElements,
  Glass3DCard,
  MorphingBlob,
  GlowEffect,
} from '../components/ui/Advanced3D';
import {
  BiometricRing,
  IntensityVisualizer,
  HologramStats,
} from '../components/ui/BiometricComponents';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { WorkoutCreatorService } from '../lib/workout-creator.service';

export const HomePage = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const { user, profile } = useAuth();
  const [createdWorkouts, setCreatedWorkouts] = useState<number>(0);
  const [completedWorkouts, setCompletedWorkouts] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Unmounted guard to avoid setting state after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Badges/achievements from profile
  const badgesEarned =
    profile?.achievements?.filter((a: { unlockedAt?: string | Date | null }) => a?.unlockedAt)
      ?.length || 0;

  // Personal records: placeholder (implement real logic if available)
  const personalRecords = 0;

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Created workouts
        const workouts = (await WorkoutCreatorService.getUserWorkouts?.()) ?? [];
        if (isMountedRef.current) setCreatedWorkouts(Array.isArray(workouts) ? workouts.length : 0);

        // Completed workouts
        const sessions = (await WorkoutCreatorService.getUserWorkoutSessions?.()) ?? [];
        const completed = Array.isArray(sessions)
          ? sessions.filter((s: { status?: string }) => s?.status === 'completed').length
          : 0;
        if (isMountedRef.current) setCompletedWorkouts(completed);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    }

    if (user) {
      fetchStats();
    } else {
      // Reset when user logs out
      setCreatedWorkouts(0);
      setCompletedWorkouts(0);
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen space-y-8 relative">
      {/* Advanced Background Effects */}
      <FloatingElements />
      <MorphingBlob />

      {/* Hero Section with Glass Morphism */}
      <section className="relative">
        <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden rounded-3xl">
          <ProgressiveImage
            src="/images/hero_1.webp"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <GlassCard variant="hero" className="max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                Your Progress,
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Proven.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed">
                Track, analyze, and improve your workouts with intelligent insights
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlassButton size="lg" onClick={() => (window.location.href = '/workouts')}>
                  Start Training
                  <ArrowRight className="ml-2 w-5 h-5" />
                </GlassButton>
                <GlassButton variant="secondary" size="lg">
                  View Progress
                </GlassButton>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Advanced Biometric Dashboard */}
      <section className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* Fitness Progress Ring */}
          <GlowEffect color="cyan" intensity="high">
            <Glass3DCard intensity="high" depth={15} className="flex items-center justify-center">
              <div className="text-center">
                <BiometricRing
                  progress={75}
                  size={140}
                  color="#06b6d4"
                  glowColor="rgba(6, 182, 212, 0.6)"
                >
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-cyan-400 mb-1 mx-auto" />
                    <div className="text-2xl font-bold text-white">75%</div>
                    <div className="text-xs text-white/60">FITNESS</div>
                  </div>
                </BiometricRing>
                <div className="mt-4 text-white/80 text-sm">Weekly Goal Progress</div>
              </div>
            </Glass3DCard>
          </GlowEffect>

          {/* Workout Intensity Visualizer */}
          <GlowEffect color="purple" intensity="medium">
            <Glass3DCard intensity="medium" depth={12}>
              <IntensityVisualizer heartRate={145} intensity="high" animate={true} />
              <div className="text-center mt-4">
                <div className="text-white font-semibold">Current Session</div>
                <div className="text-white/60 text-sm">High Intensity Training</div>
              </div>
            </Glass3DCard>
          </GlowEffect>

          {/* AI Fitness Insights */}
          <GlowEffect color="orange" intensity="medium">
            <Glass3DCard intensity="medium" depth={10}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">AI Coach</h3>
                <p className="text-white/70 text-sm mb-4">
                  Based on your progress, increase cardio intensity by 10% this week.
                </p>
                <GlassButton variant="ghost" size="sm">
                  View Insights
                </GlassButton>
              </div>
            </Glass3DCard>
          </GlowEffect>
        </motion.div>

        {/* Holographic Stats Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <HologramStats
            stats={[
              {
                label: 'Calories Burned',
                value: '2,847',
                unit: 'kcal',
                icon: <Flame className="w-8 h-8" />,
                color: 'text-orange-400',
              },
              {
                label: 'Active Minutes',
                value: '347',
                unit: 'min',
                icon: <Activity className="w-8 h-8" />,
                color: 'text-green-400',
              },
              {
                label: 'Heart Rate Avg',
                value: '142',
                unit: 'bpm',
                icon: <Heart className="w-8 h-8" />,
                color: 'text-red-400',
              },
              {
                label: 'Workouts This Week',
                value: completedWorkouts || 5,
                icon: <Dumbbell className="w-8 h-8" />,
                color: 'text-blue-400',
              },
              {
                label: 'Strength Gains',
                value: '+15%',
                icon: <Trophy className="w-8 h-8" />,
                color: 'text-yellow-400',
              },
              {
                label: 'Community Rank',
                value: '#47',
                icon: <Users className="w-8 h-8" />,
                color: 'text-purple-400',
              },
            ]}
          />
        </motion.div>
      </section>

      {/* Quick Stats Dashboard */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Workouts Done"
            value={loading ? '...' : completedWorkouts}
            icon={<Dumbbell className="w-6 h-6" />}
            trend="up"
            trendValue="+12%"
            glowColor="cyan"
          />
          <StatsCard
            title="Created"
            value={loading ? '...' : createdWorkouts}
            icon={<Target className="w-6 h-6" />}
            glowColor="purple"
          />
          <StatsCard
            title="Badges"
            value={badgesEarned}
            icon={<Trophy className="w-6 h-6" />}
            trend="up"
            trendValue="+2"
            glowColor="orange"
          />
          <StatsCard
            title="Streak"
            value="7 days"
            icon={<Flame className="w-6 h-6" />}
            trend="up"
            trendValue="Best!"
            glowColor="green"
          />
        </motion.div>
      </section>

      {/* Featured Workouts */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Workouts</h2>
            <GlassButton variant="ghost" size="sm">
              View All
            </GlassButton>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <WorkoutCard
              title="Full Body Burn 🔥"
              description="Balanced AI-crafted workout combining push, pull, and legs to maximize overall fitness"
              duration="45 min"
              difficulty="Intermediate"
              exercises={12}
              tags={['Strength', 'Cardio', 'Full Body']}
              featured
              onTap={() => console.log('Workout tapped')}
            />
            <WorkoutCard
              title="Morning Power"
              description="Start your day with energy and strength"
              duration="30 min"
              difficulty="Beginner"
              exercises={8}
              tags={['Morning', 'Energy', 'Quick']}
              onTap={() => console.log('Workout tapped')}
            />
          </div>
        </motion.div>
      </section>

      {/* Community Section */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassCard variant="workout" className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Join the Community</h2>
                <p className="text-white/70">Connect with fellow fitness enthusiasts</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1.2k+</div>
                <div className="text-sm text-white/70">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">450+</div>
                <div className="text-sm text-white/70">Shared Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">95%</div>
                <div className="text-sm text-white/70">Success Rate</div>
              </div>
            </div>

            <div className="mt-6">
              <GlassButton fullWidth>
                Explore Community
                <ArrowRight className="ml-2 w-4 h-4" />
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Featured Community Workouts + Upcoming Events */}
      <div className="space-y-8">
        <FeaturedCommunityWorkoutsSlider />
        <UpcomingEventsSlider />
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};
