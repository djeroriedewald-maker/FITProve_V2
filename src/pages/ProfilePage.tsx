import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Camera,
  Trophy,
  Target,
  Flame,
  Dumbbell,
  TrendingUp,
  Star,
  User,
  CheckCircle,
  ArrowLeft,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  Calendar,
  Award,
  Zap,
  Clock,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { toast } from 'react-hot-toast';
import { getWorkoutStats } from '../lib/workout-stats.service';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: string;
  unlocked_at: Date | null;
  progress?: { current: number; target: number };
}

interface UserStats {
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
}

interface RecentActivity {
  id: string;
  type: 'workout' | 'achievement' | 'goal';
  title: string;
  description: string;
  icon: string;
  color: string;
  created_at: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    currentStreak: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Form state voor editable fields
  const [formData, setFormData] = useState({
    display_name: '',
    full_name: '',
    username: '',
    bio: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Debug logging
  console.log('🔍 ProfilePage render:', {
    user: !!user,
    userId: user?.id,
    profile: !!profile,
    profileId: profile?.id,
    avatarUrl: profile?.avatar_url,
    loading,
  });

  // Debug avatar specifically
  if (profile?.avatarUrl) {
    console.log('🖼️ Avatar URL found:', profile.avatarUrl);
  } else {
    console.log('❌ No avatar URL in profile');
  }

  // Show debug info temporarily
  if (profile) {
    console.log('👤 Current profile data:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatarUrl,
    });
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log('🔄 No user found, redirecting to login');
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        full_name: profile.name || '', // Use 'name' field from profile
        username: profile.username || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔵 handleAvatarUpload called!');
    const file = event.target.files?.[0];
    if (!file || !user) {
      console.log('❌ No file or user:', { file: !!file, user: !!user });
      return;
    }
    console.log('📁 File selected:', { name: file.name, size: file.size, type: file.type });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Alleen afbeeldingen zijn toegestaan');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Afbeelding moet kleiner zijn dan 5MB');
      return;
    }

    setUploadingAvatar(true);
    console.log('Starting avatar upload for user:', user.id);

    try {
      // First check if avatars bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarsBucket = buckets?.find((b) => b.name === 'avatars');
      
      if (!avatarsBucket) {
        // Try to create avatars bucket
        console.log('Creating avatars bucket...');
        const { error: bucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
        });
        
        if (bucketError) {
          console.error('Could not create avatars bucket:', bucketError);
          toast.error('Avatar upload niet beschikbaar. Contacteer de administrator.');
          return;
        }
        console.log('Avatars bucket created successfully');
      }

      // Delete old avatar if exists
      if (profile?.avatarUrl) {
        try {
          const oldPath = profile.avatarUrl.split('/').pop();
          if (oldPath && oldPath !== 'default-avatar.png') {
            console.log('Removing old avatar:', oldPath);
            await supabase.storage.from('avatars').remove([oldPath]);
          }
        } catch (deleteError) {
          console.warn('Could not delete old avatar:', deleteError);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      console.log('Uploading new avatar:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Upload mislukt: ${uploadError.message}`);
        setUploadingAvatar(false);
        if (event.target) {
          event.target.value = '';
        }
        return;
      }

      console.log('Upload successful:', uploadData);

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated with new avatar URL');
      await refreshProfile({ force: true });
      toast.success('Profielfoto succesvol geüpload!');
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      toast.error(
        'Fout bij uploaden profielfoto: ' + ((error as Error).message || 'Onbekende fout')
      );
    } finally {
      setUploadingAvatar(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Function to save profile changes
  const handleSaveProfile = async () => {
    console.log('🔵 handleSaveProfile called!', { user: !!user, formData });
    if (!user) {
      console.error('❌ No user found!');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        display_name: formData.display_name,
        name: formData.full_name,
        username: formData.username,
        bio: formData.bio,
        updated_at: new Date().toISOString(),
      };

      console.log('Updating profile with:', updateData);

      const { error } = await supabase.from('profiles').update(updateData).eq('id', user.id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      console.log('Profile updated successfully, refreshing...');
      await refreshProfile({ force: true });
      setIsEditing(false);
      toast.success('Profiel succesvol bijgewerkt!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Fout bij bijwerken profiel: ' + ((error as Error).message || 'Onbekende fout'));
    } finally {
      setSaving(false);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setFormData({
      display_name: profile?.display_name || '',
      full_name: profile?.name || '', // Use 'name' field from profile
      username: profile?.username || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
  };

  // Fetch real user statistics from planner_events
  const fetchUserStats = useCallback(async () => {
    if (!user) return;

    try {
      const stats = await getWorkoutStats(user.id);
      setUserStats({
        totalWorkouts: stats.weeklyWorkouts,
        totalMinutes: stats.totalMinutes,
        currentStreak: stats.activeStreak,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [user]);

  // Fetch recent activities from planner_events
  const fetchRecentActivities = useCallback(async () => {
    if (!user) return;

    try {
      // Get recent completed workouts
      const { data: completedWorkouts } = await supabase
        .from('planner_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('date', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      if (completedWorkouts) {
        completedWorkouts.forEach((workout) => {
          activities.push({
            id: workout.id,
            type: 'workout',
            title: `${workout.workout_type || 'Workout'} voltooid`,
            description: workout.title || workout.notes || 'Workout sessie',
            icon: 'dumbbell',
            color: 'text-blue-400',
            created_at: workout.date,
          });
        });
      }

      // Sort by date and take most recent 5
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  }, [user]);

  // Fetch all badges from database
  const fetchBadges = useCallback(async () => {
    if (!user) return;

    try {
      // For now, use mock data as badges system is not fully set up
      const mockBadges: Badge[] = [
        {
          id: '1',
          name: 'First Workout',
          description: 'Complete je eerste workout',
          icon: 'dumbbell',
          tier: 'bronze',
          category: 'milestone',
          unlocked_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          name: 'Week Warrior',
          description: '7 dagen achter elkaar getraind',
          icon: 'flame',
          tier: 'gold',
          category: 'streak',
          unlocked_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          name: 'Consistency King',
          description: '30 dagen workout streak',
          icon: 'star',
          tier: 'gold',
          category: 'streak',
          unlocked_at: null,
        },
      ];
      setAllBadges(mockBadges);
    } catch (error) {
      console.error('Error setting badges:', error);
    }
  }, [user]);

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchBadges(), fetchUserStats(), fetchRecentActivities()]);
      } catch (error) {
        console.error('Error initializing profile page:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializePage();
    } else {
      setLoading(false);
    }
  }, [fetchBadges, fetchUserStats, fetchRecentActivities, user]);

  // Subscribe to real-time planner updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('planner_events_profile')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planner_events',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUserStats();
          fetchRecentActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUserStats, fetchRecentActivities]);

  if (!profile || loading) {
    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const badgeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    dumbbell: Dumbbell,
    flame: Flame,
    star: Star,
    target: Target,
    trophy: Trophy,
    medal: Trophy,
    crown: Trophy,
    zap: Zap,
    calendar: Calendar,
    award: Award,
  };

  const tierColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
  };

  const displayedBadges = showAllBadges ? allBadges : allBadges.slice(0, 2);

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_500px_at_50%_200px,rgba(0,229,255,0.1),transparent)]" />
        <div className="absolute w-full h-full bg-[radial-gradient(circle_500px_at_80%_50%,rgba(180,0,255,0.1),transparent)]" />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header met back button */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>

          <h1 className="text-2xl font-bold text-white">Profiel</h1>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Edit3 className="w-6 h-6 text-white" />
          </button>
        </motion.div>

        {/* Profiel Header Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard variant="hero" className="text-center mb-6 relative overflow-visible">
            {/* Decorative circles */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-xl" />

            <div className="relative inline-block mb-6">
              <div className="relative w-32 h-32 mx-auto">
                {profile.avatarUrl ? (
                  <div className="relative">
                    <img
                      src={profile.avatarUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white/30 object-cover"
                      onError={(e) => {
                        console.error('🖼️ Avatar failed to load:', profile.avatarUrl);
                        console.error('Error details:', e);
                        // Hide the image and show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Avatar loaded successfully:', profile.avatarUrl);
                      }}
                    />
                    <div 
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white/30 absolute top-0 left-0"
                      style={{ display: 'none' }}
                    >
                      <User className="w-12 h-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white/30">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}

                {/* Camera Button */}
                <label className="absolute -bottom-2 -right-2 p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer shadow-lg">
                  {uploadingAvatar ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>

            {/* Editable Profile Fields */}
            {isEditing ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Naam</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
                    placeholder="Voer je naam in"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Gebruikersnaam
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
                    placeholder="Kies een gebruikersnaam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all resize-none"
                    placeholder="Vertel iets over jezelf..."
                    rows={3}
                  />
                </div>

                {/* Save/Cancel buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    {saving ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {formData.full_name || 'Fitness Champion'}
                </h2>
                {formData.username && <p className="text-white/60 mb-2">@{formData.username}</p>}
                <p className="text-white/70 text-lg mb-6">
                  {formData.bio || 'Ready to conquer fitness goals! 💪'}
                </p>
              </>
            )}

            {/* Live Stats Row */}
            <motion.div 
              className="grid grid-cols-3 gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              transition={{ duration: 0.3 }}
            >
              {/* Workouts Stats */}
              <div className="text-center p-3 rounded-lg hover:bg-white/5 transition-all duration-300 group cursor-help">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-1 group-hover:animate-pulse">
                    {userStats.totalWorkouts}
                  </div>
                  <div className="text-white/70 text-sm font-medium">Workouts</div>
                </motion.div>
              </div>

              {/* Badges Stats */}
              <div className="text-center p-3 rounded-lg hover:bg-white/5 transition-all duration-300 group cursor-help">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent mb-1 group-hover:animate-pulse">
                    {allBadges.filter((b) => b.unlocked_at).length}
                  </div>
                  <div className="text-white/70 text-sm font-medium">Badges</div>
                </motion.div>
              </div>

              {/* Streak Stats */}
              <div className="text-center p-3 rounded-lg hover:bg-white/5 transition-all duration-300 group cursor-help">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent mb-1 group-hover:animate-pulse">
                    {userStats.currentStreak}
                  </div>
                  <div className="text-white/70 text-sm font-medium">Day Streak</div>
                </motion.div>
              </div>
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <GlassCard className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2 animate-pulse" />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Achievements</span>
              </h3>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm font-medium text-white">
                    {allBadges.filter((b) => b.unlocked_at).length}
                  </span>
                  <span className="text-sm text-white/60 mx-1">/</span>
                  <span className="text-sm text-white/60">
                    {allBadges.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAllBadges(!showAllBadges)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
                >
                  {showAllBadges ? (
                    <ChevronUp className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={showAllBadges ? 'all' : 'limited'}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-4"
              >
                {displayedBadges.map((badge, index) => {
                  const IconComponent = badgeIcons[badge.icon] || Trophy;
                  const isUnlocked = badge.unlocked_at !== null;

                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className={`p-4 rounded-xl border transition-all duration-300 group cursor-pointer
                        ${isUnlocked
                          ? `bg-gradient-to-br ${tierColors[badge.tier]} border-white/30 hover:shadow-lg hover:shadow-${badge.tier === 'gold' ? 'yellow' : badge.tier}-400/30`
                          : 'bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50'}
                      `}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110
                            ${isUnlocked 
                              ? 'bg-white/20 group-hover:bg-white/30 group-hover:rotate-3' 
                              : 'bg-gray-600/20 group-hover:bg-gray-600/30'}
                          `}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}
                          />
                        </div>

                        <h4
                          className={`font-semibold text-sm mb-1 ${
                            isUnlocked ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {badge.name}
                        </h4>

                        <p
                          className={`text-xs mb-2 ${
                            isUnlocked ? 'text-white/80' : 'text-gray-500'
                          }`}
                        >
                          {badge.description}
                        </p>

                        {isUnlocked && (
                          <div className="flex items-center justify-center text-xs text-white/70">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ontgrendeld
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard className="transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-green-400/10 relative overflow-visible group">
            {/* Decorative accents */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2 group-hover:animate-bounce" />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">Recente Activiteit</span>
            </h3>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const activityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                    dumbbell: Dumbbell,
                    trophy: Trophy,
                    target: Target,
                    flame: Flame,
                    calendar: Calendar,
                    clock: Clock,
                  };
                  const ActivityIcon = activityIconMap[activity.icon] || Dumbbell;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg border border-white/5 hover:border-white/10 group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="p-3 rounded-xl bg-white/10 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                        <ActivityIcon className={`w-5 h-5 ${activity.color} transition-transform duration-300 group-hover:rotate-12`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium group-hover:text-white/90 transition-colors duration-300">
                          {activity.title}
                        </p>
                        <p className="text-white/50 text-xs group-hover:text-white/60 transition-colors duration-300">
                          {activity.description}
                        </p>
                        <p className="text-white/60 text-xs group-hover:text-white/70 transition-colors duration-300 mt-1">
                          {formatDistanceToNow(new Date(activity.created_at), {
                            addSuffix: true,
                            locale: nl,
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-white/60">
                  <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Nog geen recente activiteit</p>
                  <p className="text-xs mt-1">Voltooi workouts om je activiteiten hier te zien</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
