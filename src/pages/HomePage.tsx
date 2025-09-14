
import { Heart, Dumbbell, Flame, Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn, ScaleIn } from '../components/ui/Animations';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';
import { FloatingActionButton } from '../components/ui/FloatingActionButton';
import { CommunityHighlights } from '../components/ui/CommunityHighlights';
import { StatCard } from '../components/ui/StatCard';
import { UpcomingEvents } from '../components/ui/UpcomingEvents';

export const HomePage = () => {
  const upcomingEvents = [
    {
      id: '1',
      title: 'Morning HIIT Workout',
      date: new Date('2025-09-14'),
      type: 'workout' as const,
    },
    {
      id: '2',
      title: 'Weight Loss Goal Check',
      date: new Date('2025-09-15'),
      type: 'goal' as const,
    },
    {
      id: '3',
      title: '30-Day Challenge Complete',
      date: new Date('2025-09-16'),
      type: 'achievement' as const,
    },
  ];

  return (
    <div className="min-h-screen pt-4 pb-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">

  {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 md:py-32">
        <div className="absolute inset-0">
          <ProgressiveImage
            src="/images/hero.webp"
            alt="Hero background"
            className="w-full h-full object-cover opacity-50 dark:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 dark:from-black/20 dark:via-transparent dark:to-black/40" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn delay={0.2}>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white leading-tight">
                Transform Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                  Fitness Journey
                </span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-6 sm:mb-8 px-4">
                Track, analyze, and improve your workouts with intelligent insights
              </p>
            </FadeIn>
            <FadeIn delay={0.6}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 group min-h-[44px] touch-manipulation"
                >
                  Get Started
                  <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 min-h-[44px] touch-manipulation"
                >
                  View Demo
                </motion.button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScaleIn delay={0.2}>
              <StatCard
                icon={Dumbbell}
                title="Workouts Completed"
                value={24}
                animate={true}
                trend={{ value: 12, isPositive: true }}
                description="This month"
                className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
                iconClassName="text-emerald-500"
              />
            </ScaleIn>
            <ScaleIn delay={0.3}>
              <StatCard
                icon={Heart}
                title="Avg Heart Rate"
                value={128}
                animate={true}
                suffix=" BPM"
                description="Last workout"
                className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20"
                iconClassName="text-rose-500"
              />
            </ScaleIn>
            <ScaleIn delay={0.4}>
              <StatCard
                icon={Flame}
                title="Calories Burned"
                value={12450}
                animate={true}
                trend={{ value: 8, isPositive: true }}
                description="This week"
                className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
                iconClassName="text-orange-500"
              />
            </ScaleIn>
            <ScaleIn delay={0.5}>
              <StatCard
                icon={Trophy}
                title="Personal Records"
                value={5}
                animate={true}
                description="New this month"
                className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20"
                iconClassName="text-purple-500"
              />
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 bg-gradient-to-b from-transparent via-gray-50/50 to-gray-100/50 dark:from-transparent dark:via-gray-900/50 dark:to-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Events */}
            <div className="lg:col-span-2">
              <UpcomingEvents events={upcomingEvents} />
            </div>
            {/* Community Section */}
            <div className="space-y-6">
              <CommunityHighlights />
            </div>
          </div>
        </div>
      </section>
      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};