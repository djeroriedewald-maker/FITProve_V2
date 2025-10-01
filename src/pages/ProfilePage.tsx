import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Badge } from '../components/profile/BadgesGrid';
import { UserProfile } from '../components/profile/UserProfile';
import { GlassCard } from '../components/ui/GlassCard';
import { User, Trophy, Target, Calendar, Flame } from 'lucide-react';

export default function ProfilePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const { user, profile } = useAuth();
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = useCallback(async () => {
    if (!user) return;
    try {
      // Simplified badge fetching - using direct table queries
      const { data: badges } = await supabase.from('badges').select('*').eq('active', true);

      setUserBadges(badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setUserBadges([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges, profile]);

  if (!profile || loading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <GlassCard className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-white/80">Loading your profile...</span>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Callback to refresh badges after profile update
  const handleProfileUpdated = () => {
    fetchBadges();
  };

  const profileStats = [
    {
      icon: Trophy,
      label: 'Achievements',
      value: userBadges.length,
      color: 'text-yellow-400',
      bgColor: 'from-yellow-500/20',
    },
    {
      icon: Target,
      label: 'Goals Completed',
      value: Math.floor(Math.random() * 25) + 15, // Mock data
      color: 'text-green-400',
      bgColor: 'from-green-500/20',
    },
    {
      icon: Calendar,
      label: 'Days Active',
      value: Math.floor(Math.random() * 90) + 30, // Mock data
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: Math.floor(Math.random() * 14) + 1, // Mock data
      color: 'text-orange-400',
      bgColor: 'from-orange-500/20',
    },
  ];

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Profile Header with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <GlassCard variant="hero" className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-neon-purple">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
              {profile.full_name || profile.email || 'Fitness Enthusiast'}
            </h1>
            <p className="text-white/60 mb-6">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {profileStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${stat.bgColor} to-transparent backdrop-blur-xl border border-white/10 rounded-xl p-4`}
                >
                  <div className="flex flex-col items-center">
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="text-xs text-white/60 text-center">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Enhanced UserProfile Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* @ts-ignore: badges props are injected for display */}
          <UserProfile
            profile={{ ...(profile as any), badges: userBadges, badgesCount: userBadges.length }}
            isOwnProfile={true}
            onProfileUpdated={handleProfileUpdated}
          />
        </motion.div>
      </div>
    </div>
  );
}
