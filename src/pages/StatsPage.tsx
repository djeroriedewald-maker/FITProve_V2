import { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getWorkoutStats, getDailyWorkoutData, getWeeklyTrend } from '../lib/workout-stats.service';
import { WorkoutDailyChart, WorkoutMinutesChart, WorkoutWeeklyChart } from '../components/ui/WorkoutCharts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { GoalCard } from '../components/ui/GoalCard';
import { getUserGoals, createGoal, deleteGoal, completeGoal, updateAllGoalsProgress } from '../lib/goals.service';
import { Goal, GOAL_TEMPLATES } from '../types/goal.types';
import { Plus } from 'lucide-react';


export function StatsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    todayProgress: 0,
    weeklyWorkouts: 0,
    activeStreak: 0,
    caloriesBurned: 0,
    totalMinutes: 0,
  });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [workoutTypeData, setWorkoutTypeData] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, dailyChartData, weeklyChartData] = await Promise.all([
          getWorkoutStats(user.id),
          getDailyWorkoutData(user.id, 7),
          getWeeklyTrend(user.id, 4),
        ]);

        setStats(statsData);
        setDailyData(dailyChartData);
        setWeeklyData(weeklyChartData);

        // Fetch workout type breakdown from planner_events
        const { data: plannerEvents } = await supabase
          .from('planner_events')
          .select('workout_type, duration_min')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (plannerEvents) {
          // Group by workout type
          const typeMap = new Map<string, { count: number; duration: number }>();
          plannerEvents.forEach((event) => {
            const type = event.workout_type || 'Other';
            const existing = typeMap.get(type) || { count: 0, duration: 0 };
            typeMap.set(type, {
              count: existing.count + 1,
              duration: existing.duration + (event.duration_min || 0),
            });
          });

          const typeData = Array.from(typeMap.entries()).map(([name, data]) => ({
            name,
            value: data.count,
            duration: data.duration,
          }));

          setWorkoutTypeData(typeData);
        }

        // Fetch goals and update their progress
        const userGoals = await getUserGoals(user.id, 'active');
        await updateAllGoalsProgress(user.id);
        const updatedGoals = await getUserGoals(user.id);
        setGoals(updatedGoals);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('planner_events_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planner_events',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Achievements based on real planner data
  const achievements = [
    { name: 'First Workout', icon: Star, completed: stats.weeklyWorkouts > 0, description: 'Complete your first workout session' },
    { name: '7-Day Streak', icon: Flame, completed: stats.activeStreak >= 7, description: 'Work out for 7 consecutive days' },
    { name: 'Speed Demon', icon: Zap, completed: dailyData.some((d) => d.minutes > 0 && d.minutes < 20), description: 'Complete a workout in under 20 minutes' },
    { name: 'Consistency King', icon: Target, completed: stats.activeStreak >= 30, description: 'Work out 30 days in a row' },
  ];

  // Chart colors for workout types
  const WORKOUT_COLORS = ['#00E5FF', '#B400FF', '#FF6B00', '#00FF85', '#FF0080', '#FFC700'];

  // Goal handlers
  const handleCreateGoalFromTemplate = async (template: typeof GOAL_TEMPLATES[0]) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    console.log('Creating goal from template:', template);

    try {
      const newGoal = await createGoal(user.id, {
        type: template.type,
        title: template.title,
        description: template.description,
        target_value: template.target_value,
        unit: template.unit,
      });

      if (newGoal) {
        console.log('Goal created successfully:', newGoal);
        setGoals([...goals, newGoal]);
        setShowGoalTemplates(false);
      } else {
        console.error('Failed to create goal - returned null');
      }
    } catch (error) {
      console.error('Error in handleCreateGoalFromTemplate:', error);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const success = await deleteGoal(goalId);
    if (success) {
      setGoals(goals.filter((g) => g.id !== goalId));
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    const updated = await completeGoal(goalId);
    if (updated) {
      setGoals(goals.map((g) => (g.id === goalId ? updated : g)));
    }
  };

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
            value={loading ? '-' : stats.weeklyWorkouts.toString()}
            icon={<Dumbbell className="w-6 h-6" />}
            trend="up"
            trendValue={loading ? '' : `Deze week`}
            glowColor="cyan"
          />
          <StatsCard
            title="Hours Trained"
            value={loading ? '-' : (stats.totalMinutes / 60).toFixed(1)}
            icon={<Clock className="w-6 h-6" />}
            trend="up"
            trendValue={loading ? '' : `${stats.totalMinutes} min`}
            glowColor="purple"
          />
          <StatsCard
            title="Current Streak"
            value={loading ? '-' : `${stats.activeStreak} days`}
            icon={<Flame className="w-6 h-6" />}
            trend="up"
            trendValue={loading ? '' : stats.activeStreak >= 7 ? 'Amazing!' : 'Keep going!'}
            glowColor="orange"
          />
          <StatsCard
            title="Calories Burned"
            value={loading ? '-' : stats.caloriesBurned.toLocaleString()}
            icon={<Activity className="w-6 h-6" />}
            trend="up"
            trendValue={loading ? '' : 'Total'}
            glowColor="green"
          />
        </motion.div>
      </section>

      {/* Weekly Activity Charts */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-6">Weekly Activity</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workout Completion Chart */}
            <GlassCard variant="workout" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Last 7 Days</h3>
                  <p className="text-white/70">Completed vs Planned Workouts</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : dailyData.length > 0 ? (
                <WorkoutDailyChart data={dailyData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/60">
                  <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                  <p>No workout data yet</p>
                </div>
              )}
            </GlassCard>

            {/* Training Minutes Chart */}
            <GlassCard variant="workout" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Training Minutes</h3>
                  <p className="text-white/70">Daily workout duration</p>
                </div>
                <Clock className="w-8 h-8 text-accent" />
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
              ) : dailyData.length > 0 ? (
                <WorkoutMinutesChart data={dailyData} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-white/60">
                  <Clock className="w-16 h-16 mb-4 opacity-50" />
                  <p>No workout data yet</p>
                </div>
              )}
            </GlassCard>
          </div>
        </motion.div>
      </section>

      {/* Workout Type Breakdown */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassCard variant="workout" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Workout Distribution</h2>
                <p className="text-white/70">Breakdown by workout type</p>
              </div>
              <Activity className="w-8 h-8 text-secondary" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
              </div>
            ) : workoutTypeData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workoutTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {workoutTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={WORKOUT_COLORS[index % WORKOUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {workoutTypeData.map((type, index) => (
                    <div key={type.name} className="flex items-center justify-between p-3 bg-glass-white-light rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: WORKOUT_COLORS[index % WORKOUT_COLORS.length] }}
                        />
                        <span className="text-white font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{type.value} workouts</div>
                        <div className="text-white/60 text-sm">{type.duration} min</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-white/60">
                <Activity className="w-16 h-16 mb-4 opacity-50" />
                <p>Complete workouts to see distribution</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </section>

      {/* 4-Week Trend */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <GlassCard variant="workout" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Monthly Progress</h2>
                <p className="text-white/70">Your workout trend over the past 4 weeks</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
              </div>
            ) : weeklyData.length > 0 ? (
              <WorkoutWeeklyChart data={weeklyData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-white/60">
                <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
                <p>No weekly trend data yet</p>
                <p className="text-xs mt-1">Complete workouts to see your monthly progress</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </section>

      {/* Achievements */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
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
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Goals</h2>
              <p className="text-white/70">Track your fitness goals and celebrate milestones</p>
            </div>
            <GlassButton onClick={() => setShowGoalTemplates(!showGoalTemplates)}>
              <Plus className="w-5 h-5 mr-2" />
              {showGoalTemplates ? 'Close' : 'New Goal'}
            </GlassButton>
          </div>

          {/* Goal Templates */}
          {showGoalTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <GlassCard variant="workout" className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Choose a Goal Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GOAL_TEMPLATES.map((template) => (
                    <button
                      key={template.type}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button clicked!', template.title);
                        handleCreateGoalFromTemplate(template);
                      }}
                      className="text-left p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer relative z-10"
                      type="button"
                    >
                      <h4 className="text-lg font-bold text-white mb-1">{template.title}</h4>
                      <p className="text-sm text-white/60 mb-2">{template.description}</p>
                      <div className="text-xs text-white/50">
                        Target: {template.target_value} {template.unit}
                      </div>
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Goals Grid */}
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                  onComplete={handleCompleteGoal}
                />
              ))}
            </div>
          ) : (
            <GlassCard variant="workout" className="p-12 text-center">
              <Target className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2">No Goals Yet</h3>
              <p className="text-white/60 mb-6">
                Set your first fitness goal and start tracking your progress!
              </p>
              <GlassButton onClick={() => setShowGoalTemplates(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Goal
              </GlassButton>
            </GlassCard>
          )}
        </motion.div>
      </section>
    </div>
  );
}