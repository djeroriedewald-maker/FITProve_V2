import {
  Heart,
  Dumbbell,
  Flame,
  Trophy,
  ArrowRight,
  Activity,
  Target,
  Users,
  Play,
  TrendingUp,
  Star,
  Clock,
  BarChart3,
  Award,
  Plus,
  ChevronRight,
  Settings,
  Bell,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FloatingElements, MorphingBlob } from '../components/ui/Advanced3D';
import { BiometricRing } from '../components/ui/BiometricComponents';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { WorkoutCreatorService } from '../lib/workout-creator.service';
import AvatarDropdown from '../components/ui/AvatarDropdown';

export const HomePage = () => {
  const navigate = useNavigate();
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const { user, profile } = useAuth();
  const [createdWorkouts, setCreatedWorkouts] = useState<number>(0);
  const [completedWorkouts, setCompletedWorkouts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Unmounted guard to avoid setting state after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        // Mock notifications for now - replace with real Supabase query
        const mockNotifications = [
          {
            id: '1',
            type: 'achievement',
            title: 'New Badge Earned!',
            message: 'You earned the "Consistency" badge for 7 days in a row!',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            isRead: false
          },
          {
            id: '2', 
            type: 'social',
            title: 'Friend Request',
            message: 'Sarah Johnson wants to connect with you',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            isRead: false
          },
          {
            id: '3',
            type: 'workout',
            title: 'Workout Reminder',
            message: 'Don\'t forget your scheduled Upper Body workout at 6 PM',
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            isRead: false
          }
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [user]);

  // Badges/achievements from profile
  const badgesEarned =
    profile?.achievements?.filter((a: { unlockedAt?: string | Date | null }) => a?.unlockedAt)
      ?.length || 0;

  // Personal records: placeholder (implement real logic if available)

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle notification click
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  // Format notification time
  const formatNotificationTime = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get workout suggestion based on time
  const getWorkoutSuggestion = () => {
    const hour = currentTime.getHours();
    if (hour < 10) return 'Morning Energy Boost';
    if (hour < 14) return 'Power Lunch Session';
    if (hour < 18) return 'Afternoon Strength';
    return 'Evening Wind Down';
  };

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Advanced Background Effects */}
      <FloatingElements />
      <MorphingBlob />
      
      {/* Ambient background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      
      {/* Main Content Container */}
      <div className="relative z-10 px-4 pt-6 pb-24">
        {/* Click outside to close notifications */}
        {showNotifications && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowNotifications(false)}
          />
        )}
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <AvatarDropdown />
            <div>
              <p className="text-white/70 text-sm">{getGreeting()}</p>
              <h2 className="text-white font-semibold text-lg">
                {user ? profile?.full_name || 'Fitness Champion' : 'Welcome Back'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <motion.button
                onClick={handleNotificationClick}
                className="relative p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="w-5 h-5 text-white/70" />
                {/* Notification badge - only show if there are unread notifications */}
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </motion.div>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-16 right-0 w-80 max-w-[90vw] bg-glass-white border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            // Mark all as read
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                          }}
                          className="text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-white/40 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-primary/5' : ''
                          }`}
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notification.isRead ? 'bg-primary' : 'bg-white/20'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm truncate">
                                {notification.title}
                              </h4>
                              <p className="text-white/70 text-sm mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-white/50 text-xs mt-2">
                                {formatNotificationTime(notification.timestamp)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/notifications');
                        }}
                        className="w-full text-center text-primary text-sm font-medium hover:text-primary/80 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* Settings */}
            <motion.button
              onClick={() => navigate('/settings')}
              className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-5 h-5 text-white/70" />
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 border border-white/10 backdrop-blur-xl p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/30 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/30 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">150+ Daily Challenge</p>
                    <p className="text-white/60 text-xs">Push-Up Challenge</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate('/modules/workout')}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Now
                  <ArrowRight className="inline w-4 h-4 ml-2" />
                </motion.button>
              </div>
              
              <p className="text-white/70 text-sm mb-4">
                Join thousands in our daily fitness challenge. Build consistency and strength
                together!
              </p>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{completedWorkouts || 12}</div>
                  <div className="text-white/60 text-xs">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{badgesEarned || 3}</div>
                  <div className="text-white/60 text-xs">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">7</div>
                  <div className="text-white/60 text-xs">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fitness Ring & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Fitness Ring */}
            <div className="col-span-2 sm:col-span-1">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <BiometricRing
                      progress={75}
                      size={120}
                      color="#00E5FF"
                      glowColor="rgba(0, 229, 255, 0.4)"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">75%</div>
                        <div className="text-xs text-white/60">Today</div>
                      </div>
                    </BiometricRing>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">Daily Goal</p>
                  <p className="text-white/60 text-sm">2,847 / 3,200 cal</p>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="col-span-2 sm:col-span-1 space-y-3">
              <div className="rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/20 backdrop-blur-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">847</p>
                    <p className="text-white/60 text-sm">Active Cal</p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 backdrop-blur-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">142</p>
                    <p className="text-white/60 text-sm">Avg BPM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Quick Start</h3>
            <motion.button
              onClick={() => navigate('/modules')}
              className="text-primary text-sm font-medium flex items-center hover:text-primary/80 transition-colors"
              whileHover={{ x: 4 }}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => navigate('/modules/workout')}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-xl p-6 text-left hover:from-primary/30 hover:to-primary/10 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Dumbbell className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-white font-semibold mb-1">Start Workout</h4>
                <p className="text-white/60 text-sm">{getWorkoutSuggestion()}</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-xl opacity-50" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/stats')}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 backdrop-blur-xl p-6 text-left hover:from-secondary/30 hover:to-secondary/10 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <h4 className="text-white font-semibold mb-1">View Progress</h4>
                <p className="text-white/60 text-sm">Track your journey</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-xl opacity-50" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/community')}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 backdrop-blur-xl p-6 text-left hover:from-accent/30 hover:to-accent/10 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h4 className="text-white font-semibold mb-1">Community</h4>
                <p className="text-white/60 text-sm">Join challenges</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-accent/20 to-transparent rounded-full blur-xl opacity-50" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/modules/workout/create')}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl p-6 text-left hover:from-white/15 hover:to-white/10 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1">Create Workout</h4>
                <p className="text-white/60 text-sm">Build your plan</p>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-xl opacity-50" />
            </motion.button>
          </div>
        </motion.div>

        {/* Your Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Your Progress</h3>
            <motion.button
              onClick={() => navigate('/stats')}
              className="text-primary text-sm font-medium flex items-center hover:text-primary/80 transition-colors"
              whileHover={{ x: 4 }}
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Workouts</span>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : completedWorkouts}
                </span>
                <span className="text-green-400 text-sm font-medium">+12%</span>
              </div>
              <p className="text-white/60 text-xs mt-1">This month</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Badges</span>
                </div>
                <Star className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-white">{badgesEarned || 3}</span>
                <span className="text-yellow-400 text-sm font-medium">+2</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Earned</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Streak</span>
                </div>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-white">7</span>
                <span className="text-accent text-sm font-medium">days</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Best yet!</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-white/80 text-sm font-medium">Created</span>
                </div>
                <Plus className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-white">
                  {loading ? '...' : createdWorkouts}
                </span>
                <span className="text-green-400 text-sm font-medium">plans</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Workouts</p>
            </div>
          </div>
        </motion.div>

        {/* Featured Workouts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Today&apos;s Recommendation</h3>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-white/10 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-2xl" />
            
            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Full Body Muscle Builder</h4>
                    <p className="text-white/70 text-sm">45 min • Intermediate • 12 Exercises</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate('/modules/workout')}
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </motion.button>
              </div>

              <p className="text-white/80 text-sm mb-4 leading-relaxed">
                A comprehensive workout targeting all major muscle groups. Perfect for
                building strength and muscle definition.
              </p>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white/80 text-sm">4.8</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-sm">45 min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4 text-white/60" />
                  <span className="text-white/60 text-sm">High Intensity</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Community & Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => navigate('/community')}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 text-left hover:from-white/10 hover:to-white/5 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
                <h4 className="text-white font-semibold mb-2">Community</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Active Members</span>
                    <span className="text-primary text-sm font-semibold">1.2k+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Shared Workouts</span>
                    <span className="text-secondary text-sm font-semibold">450+</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/profile')}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 text-left hover:from-white/10 hover:to-white/5 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
                </div>
                <h4 className="text-white font-semibold mb-2">Achievements</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Badges Earned</span>
                    <span className="text-accent text-sm font-semibold">{badgesEarned || 3}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Success Rate</span>
                    <span className="text-green-400 text-sm font-semibold">95%</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-2xl" />
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Completed Upper Body Strength</p>
                <p className="text-white/60 text-xs">2 hours ago • 45 minutes</p>
              </div>
              <div className="text-green-400 text-xs font-medium">+247 cal</div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Earned &quot;Consistency&quot; Badge
                </p>
                <p className="text-white/60 text-xs">Yesterday • 7 day streak</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Joined 150+ Push-Up Challenge</p>
                <p className="text-white/60 text-xs">3 days ago • Community event</p>
              </div>
              <div className="text-secondary text-xs font-medium">Joined</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
