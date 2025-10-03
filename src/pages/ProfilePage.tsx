import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { toast } from 'react-hot-toast';

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
  if (profile?.avatar_url) {
    console.log('🖼️ Avatar URL found:', profile.avatar_url);
  } else {
    console.log('❌ No avatar URL in profile');
  }

  // Show debug info temporarily
  if (profile) {
    console.log('👤 Current profile data:', {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
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
      if (profile?.avatar_url) {
        try {
          const oldPath = profile.avatar_url.split('/').pop();
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
        // Fallback: save as base64 in profile for now
        console.log('Using fallback: converting to base64...');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string;
            
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                avatar_url: base64,
                updated_at: new Date().toISOString(),
              })
              .eq('id', user.id);

            if (updateError) {
              throw updateError;
            }

            console.log('Profile updated with base64 avatar');
            await refreshProfile({ force: true });
            toast.success('Profielfoto succesvol geüpload! (fallback methode)');
          } catch (error) {
            console.error('Fallback save error:', error);
            toast.error('Fout bij uploaden profielfoto');
          } finally {
            setUploadingAvatar(false);
            if (event.target) {
              event.target.value = '';
            }
          }
        };
        reader.readAsDataURL(file);
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

  // Fetch real user statistics
  const fetchUserStats = useCallback(async () => {
    if (!user) return;

    try {
      // Get workout count
      const { data: workouts, error: workoutError } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (workoutError) throw workoutError;

      // Calculate current streak (simple implementation)
      const { data: recentWorkouts, error: streakError } = await supabase
        .from('sessions')
        .select('started_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(30);

      if (streakError) throw streakError;

      let currentStreak = 0;
      if (recentWorkouts && recentWorkouts.length > 0) {
        const today = new Date();
        const workoutDates = recentWorkouts.map((w) => new Date(w.started_at).toDateString());
        const uniqueDates = [...new Set(workoutDates)];

        // Simple streak calculation - consecutive days with workouts
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          if (uniqueDates.includes(checkDate.toDateString())) {
            currentStreak = Math.max(currentStreak, i + 1);
          }
        }
      }

      setUserStats({
        totalWorkouts: workouts?.length || 0,
        totalMinutes: (workouts?.length || 0) * 45, // Estimate 45 min per workout
        currentStreak,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
        await Promise.all([fetchBadges(), fetchUserStats()]);
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
  }, [fetchBadges, fetchUserStats, user]);

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
      <div className="relative z-10 px-4 py-8">
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
          <GlassCard variant="hero" className="text-center mb-6">

            <div className="relative inline-block mb-6">
              <div className="relative w-32 h-32 mx-auto">
                {profile.avatar_url ? (
                  <div className="relative">
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white/30 object-cover"
                      onError={(e) => {
                        console.error('🖼️ Avatar failed to load:', profile.avatar_url);
                        console.error('Error details:', e);
                        // Hide the image and show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Avatar loaded successfully:', profile.avatar_url);
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
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{userStats.totalWorkouts}</div>
                <div className="text-white/70 text-sm">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {allBadges.filter((b) => b.unlocked_at).length}
                </div>
                <div className="text-white/70 text-sm">Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{userStats.currentStreak}</div>
                <div className="text-white/70 text-sm">Day Streak</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6"
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                Achievements
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60">
                  {allBadges.filter((b) => b.unlocked_at).length}/{allBadges.length}
                </span>
                <button
                  onClick={() => setShowAllBadges(!showAllBadges)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
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
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        isUnlocked
                          ? `bg-gradient-to-br ${tierColors[badge.tier]} border-white/30`
                          : 'bg-gray-800/50 border-gray-600/30'
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                            isUnlocked ? 'bg-white/20' : 'bg-gray-600/20'
                          }`}
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
          <GlassCard>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
              Recente Activiteit
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: Dumbbell,
                  text: 'Upper Body Workout voltooid',
                  time: '2 uur geleden',
                  color: 'text-blue-400',
                },
                {
                  icon: Trophy,
                  text: '"Week Warrior" badge verdiend',
                  time: '1 dag geleden',
                  color: 'text-yellow-400',
                },
                {
                  icon: Target,
                  text: 'Wekelijkse doelen behaald',
                  time: '3 dagen geleden',
                  color: 'text-green-400',
                },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 rounded-full bg-white/10">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.text}</p>
                    <p className="text-white/60 text-xs">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
