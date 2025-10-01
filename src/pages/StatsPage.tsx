import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Target,
  Calendar,
  Clock,
  Flame,
  Trophy,
  TrendingUp,
  Activity,
  Dumbbell,
  Heart,
  Zap,
  Star
} from 'lucide-react';
import { GlassCard, GlassButton } from '../components/ui/GlassCard';
import { StatsCard } from '../components/ui/WorkoutCard';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

export function StatsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Mock data - replace with real data from your services
  const weeklyStats = [
    { day: 'Mon', workouts: 2, duration: 45 },
    { day: 'Tue', workouts: 1, duration: 30 },
    { day: 'Wed', workouts: 0, duration: 0 },
    { day: 'Thu', workouts: 1, duration: 60 },
    { day: 'Fri', workouts: 2, duration: 40 },
    { day: 'Sat', workouts: 1, duration: 35 },
    { day: 'Sun', workouts: 1, duration: 50 },
  ];

  const achievements = [
    { name: 'First Workout', icon: Star, completed: true, description: 'Complete your first workout session' },
    { name: '7-Day Streak', icon: Flame, completed: true, description: 'Work out for 7 consecutive days' },
    { name: 'Speed Demon', icon: Zap, completed: false, description: 'Complete a workout in under 20 minutes' },
    { name: 'Consistency King', icon: Target, completed: false, description: 'Work out 30 days in a row' },
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Section */}
      <section className="relative -mx-4 -mt-4">
        <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden rounded-3xl">
          <ProgressiveImage
            src="/images/hero_1.webp"
            alt="Stats Hero"
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
                Your
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"> Progress</span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-2xl mx-auto">
                Track your fitness journey with detailed analytics and insights. See how far you've come!
              </p>

              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-primary">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm font-medium">Detailed Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-accent">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium">Achievements</span>
                </div>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Quick Stats Overview */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatsCard
            title="Total Workouts"
            value="47"
            icon={<Dumbbell className="w-6 h-6" />}
            trend="up"
            trendValue="+8"
            glowColor="cyan"
          />
          <StatsCard
            title="Hours Trained"
            value="32.5"
            icon={<Clock className="w-6 h-6" />}
            trend="up"
            trendValue="+5.2h"
            glowColor="purple"
          />
          <StatsCard
            title="Current Streak"
            value="7 days"
            icon={<Flame className="w-6 h-6" />}
            trend="up"
            trendValue="New record!"
            glowColor="orange"
          />
          <StatsCard
            title="Calories Burned"
            value="12,450"
            icon={<Activity className="w-6 h-6" />}
            trend="up"
            trendValue="+1,200"
            glowColor="green"
          />
        </motion.div>
      </section>

      {/* Weekly Activity Chart */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard variant="workout" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Weekly Activity</h2>
                <p className="text-white/70">Your workout consistency this week</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-4">
              {weeklyStats.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 text-white/70 font-medium">{day.day}</div>
                  
                  <div className="flex-1 bg-glass-white-light rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.workouts / 3) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + 0.1 * index }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-white/80 w-24">
                    <span>{day.workouts} workouts</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-white/60 w-16">
                    <Clock className="w-3 h-3" />
                    <span>{day.duration}m</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Achievements */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Achievements</h2>
              <p className="text-white/70">Unlock rewards as you reach new milestones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <GlassCard 
                    variant="workout" 
                    className={`p-6 ${achievement.completed ? 'ring-2 ring-accent/30' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${
                        achievement.completed 
                          ? 'bg-gradient-to-br from-accent/30 to-primary/20' 
                          : 'bg-glass-white-light'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          achievement.completed ? 'text-accent' : 'text-white/60'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-bold ${
                            achievement.completed ? 'text-white' : 'text-white/70'
                          }`}>
                            {achievement.name}
                          </h3>
                          {achievement.completed && (
                            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-white/60 text-sm">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Goals Section */}
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
                <Target className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-4">Set New Goals</h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Ready to take your fitness to the next level? Set personalized goals and track your progress with our advanced analytics.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <GlassButton size="lg">
                    <Target className="w-5 h-5 mr-2" />
                    Set Goals
                  </GlassButton>
                  
                  <GlassButton variant="secondary" size="lg">
                    <Heart className="w-5 h-5 mr-2" />
                    View Details
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