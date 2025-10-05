// src/pages/HomePage.tsx
import React from 'react';
import {
  Activity,
  Users,
  Trophy,
  Play,
  ArrowRight,
  Star,
  Calendar,
  BarChart,
  Flame,
  Target,
  Clock,
  Plus,
  ChevronRight,
  Dumbbell,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { FloatingElements, MorphingBlob } from '../components/ui/Advanced3D';
import { BiometricRing } from '../components/ui/BiometricComponents';
import { CircleProgress } from '../components/ui/CircleProgress';

interface WorkoutStats {
  todayProgress: number;
  weeklyWorkouts: number;
  activeStreak: number;
  nextMilestone: string;
  caloriesBurned: number;
  minutesActive: number;
}

interface ChallengeProgress {
  id: string;
  name: string;
  progress: number;
  target: number;
  daysLeft: number;
  participants: number;
}

interface ScheduledWorkout {
  id: string;
  name: string;
  time: string;
  type: string;
  duration: string;
}

interface CommunityWorkout {
  id: string;
  title: string;
  creator: string;
  image: string;
  likes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  type: 'Challenge' | 'Workshop' | 'Competition';
  image: string;
  participants: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const communityWorkouts: CommunityWorkout[] = [
    {
      id: 'w1',
      title: 'Full Body HIIT',
      creator: 'Sarah Fitness',
      image: '/images/Advanced_female.webp',
      likes: 342,
      difficulty: 'Intermediate',
      duration: '45 min'
    },
    {
      id: 'w2',
      title: 'Core Strength',
      creator: 'Mike Power',
      image: '/images/Advanced_male.webp',
      likes: 289,
      difficulty: 'Advanced',
      duration: '30 min'
    },
    {
      id: 'w3',
      title: 'Beginner Basics',
      creator: 'Fitness First',
      image: '/images/beginner_female.webp',
      likes: 421,
      difficulty: 'Beginner',
      duration: '40 min'
    }
  ];

  const upcomingEvents: Event[] = [
    {
      id: 'e1',
      title: 'Summer Shred Challenge',
      date: 'Starts Oct 10',
      type: 'Challenge',
      image: '/images/hero_1.webp',
      participants: 156,
      status: 'upcoming'
    },
    {
      id: 'e2',
      title: 'HIIT Workshop',
      date: 'Oct 15, 2PM',
      type: 'Workshop',
      image: '/images/beginner_male.webp',
      participants: 42,
      status: 'upcoming'
    },
    {
      id: 'e3',
      title: 'Strength Competition',
      date: 'Oct 20',
      type: 'Competition',
      image: '/images/bench.webp',
      participants: 89,
      status: 'upcoming'
    }
  ];

  // Stats that would come from your backend/context
  const stats: WorkoutStats = {
    todayProgress: 75,
    weeklyWorkouts: 4,
    activeStreak: 7,
    nextMilestone: "10 Workouts",
    caloriesBurned: 847,
    minutesActive: 45
  };

  const activeChallenge: ChallengeProgress = {
    id: "push-up-challenge",
    name: "150+ Push-Up Challenge",
    progress: 85,
    target: 150,
    daysLeft: 3,
    participants: 243
  };

  const nextWorkout: ScheduledWorkout = {
    id: "next-workout-1",
    name: "Upper Body Power",
    time: "Today, 6:00 PM",
    type: "Strength",
    duration: "45 min"
  };

  const displayName = 
    profile?.displayName || 
    user?.email?.split('@')[0] || 
    'Athlete';

  return (
    <div className="fixed inset-0 bg-[#08090B] overflow-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <FloatingElements />
        <MorphingBlob />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-float-delayed" />
      </div>

      {/* Main Content */}
      <main className="fixed inset-0 overflow-y-auto overflow-x-hidden overscroll-contain hide-scrollbar"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 pt-4 pb-24 min-h-full">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, <span className="text-cyan-400">{displayName}</span>
            </h1>
            <p className="text-base text-white/70">Ready to crush your fitness goals?</p>
          </motion.div>

          {/* Today's Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Primary Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <GlassCard className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Today's Progress */}
                  <div className="col-span-2 lg:row-span-2">
                    <div className="flex flex-col items-center">
                      <BiometricRing 
                        progress={stats.todayProgress}
                        size={160}
                        color="#06b6d4"
                        glowColor="rgba(6, 182, 212, 0.5)"
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-1">{stats.todayProgress}%</div>
                          <div className="text-sm text-white/60">Daily Goal</div>
                        </div>
                      </BiometricRing>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.weeklyWorkouts}</div>
                        <div className="text-xs text-white/60">Workouts This Week</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.activeStreak}</div>
                        <div className="text-xs text-white/60">Day Streak</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-sm font-bold text-white">{stats.nextMilestone}</div>
                        <div className="text-xs text-white/60">Next Milestone</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-2xl font-bold text-white">{stats.caloriesBurned}</div>
                        <div className="text-xs text-white/60">Calories Today</div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Next Workout Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard 
                className="p-6 h-full" 
                onClick={() => navigate(`/workout/${nextWorkout.id}`)}
              >
                <div className="h-full flex flex-col">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    Next Workout
                  </h3>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-lg font-bold text-white mb-1">{nextWorkout.name}</div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{nextWorkout.time}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span>{nextWorkout.duration}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/workout/start')}
                      className="mt-4 w-full py-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Workout
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Active Challenge */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Active Challenge</h2>
              <button
                onClick={() => navigate('/challenges')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <GlassCard className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">{activeChallenge.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <div className="text-white/60">Progress</div>
                      <div className="text-lg font-bold text-white">
                        {activeChallenge.progress}/{activeChallenge.target}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/60">Days Left</div>
                      <div className="text-lg font-bold text-white">{activeChallenge.daysLeft}</div>
                    </div>
                    <div>
                      <div className="text-white/60">Participants</div>
                      <div className="text-lg font-bold text-white">{activeChallenge.participants}</div>
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeChallenge.progress / activeChallenge.target) * 100}%` }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/challenges/${activeChallenge.id}`)}
                  className="flex-none py-2 px-6 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </GlassCard>
          </motion.section>

          {/* Quick Access Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard 
                className="p-4 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate('/workout-creator')}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30">
                    <Plus className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Create Workout</span>
                </div>
              </GlassCard>

              <GlassCard 
                className="p-4 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate('/exercises')}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                    <Dumbbell className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Exercise Library</span>
                </div>
              </GlassCard>

              <GlassCard 
                className="p-4 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate('/stats')}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-white">View Progress</span>
                </div>
              </GlassCard>

              <GlassCard 
                className="p-4 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate('/community')}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/30">
                    <Users className="w-6 h-6 text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Community</span>
                </div>
              </GlassCard>
            </div>
          </motion.section>

          {/* Community's Favorite Workouts */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Community's Favorites</h2>
              <button
                onClick={() => navigate('/community')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto hide-scrollbar -mx-4">
              <div className="flex gap-4 px-4 pb-4">
                {communityWorkouts.map((workout) => (
                  <motion.div
                    key={workout.id}
                    className="flex-none w-72"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassCard className="p-4 h-full" onClick={() => navigate(`/workouts/${workout.id}`)}>
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                        <img
                          src={workout.image}
                          alt={workout.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                          <span className="px-2 py-1 rounded-full bg-black/50 text-white text-sm">
                            {workout.duration}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-black/50 text-white text-sm flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-current" /> {workout.likes}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-1">{workout.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">by {workout.creator}</span>
                        <span className="text-sm text-white/60">{workout.difficulty}</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Upcoming Events */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <button
                onClick={() => navigate('/events')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto hide-scrollbar -mx-4">
              <div className="flex gap-4 px-4 pb-4">
                {upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="flex-none w-72"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassCard className="p-4 h-full" onClick={() => navigate(`/events/${event.id}`)}>
                      <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            event.type === 'Challenge' 
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                              : event.type === 'Workshop'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          }`}>
                            {event.type}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-black/50 text-white text-sm">
                            {event.participants} joined
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{event.date}</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

        </div>
      </main>
    </div>
  );
}
