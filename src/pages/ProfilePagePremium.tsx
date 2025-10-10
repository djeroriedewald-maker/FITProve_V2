/**
 * Premium Profile Page
 * Fitness Report Card design with 8 premium components
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/profile.types';
import type { PeriodizationState } from '../types/periodization.types';
import toast from 'react-hot-toast';

// Import all 8 premium components
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { TrainingOverview } from '../components/profile/TrainingOverview';
import { PeriodizationStatus } from '../components/profile/PeriodizationStatus';
import { WorkoutStylesBreakdown } from '../components/profile/WorkoutStylesBreakdown';
import { ProgressionTimeline } from '../components/profile/ProgressionTimeline';
import { FitnessProfileSummary } from '../components/profile/FitnessProfileSummary';
import { AchievementsPreview } from '../components/profile/AchievementsPreview';
import { RecentActivity } from '../components/profile/RecentActivity';
import { EditProfileModal } from '../components/profile/EditProfileModal';

export default function ProfilePagePremium() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodization, setPeriodization] = useState<PeriodizationState | null>(null);
  const [workoutStyles, setWorkoutStyles] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadProfileData();
    loadPeriodizationData();
    loadWorkoutStylesData();
    loadRecentActivities();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Load profile from database
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profileData) {
        // Load workout sessions for stats
        const { data: workoutHistory } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(50);

        // Calculate stats from workout history
        const workoutsCompleted = workoutHistory?.length || 0;
        const totalMinutes = workoutHistory?.reduce((sum, w) => sum + (w.total_duration || 0), 0) || 0;

        // Calculate streak (simplified - counts consecutive days with workouts)
        let streakDays = 0;
        if (workoutHistory && workoutHistory.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const workoutDates = workoutHistory
            .map(w => {
              const completedAt = w.completed_at;
              if (!completedAt) return 0;
              const d = new Date(completedAt);
              d.setHours(0, 0, 0, 0);
              return d.getTime();
            })
            .filter(t => t > 0)
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort((a, b) => b - a);

          for (let i = 0; i < workoutDates.length; i++) {
            const expectedDate = new Date(today.getTime() - i * 86400000).getTime();
            if (workoutDates[i] === expectedDate) {
              streakDays++;
            } else {
              break;
            }
          }
        }

        // Transform database profile to UserProfile type
        const userProfile: UserProfile = {
          id: profileData.id,
          displayName: profileData.display_name || 'Fitness Champion',
          username: profileData.username || `user_${profileData.id.substring(0, 8)}`,
          bio: profileData.bio || '',
          avatarUrl: profileData.avatar_url || '',
          fitnessGoals: profileData.fitness_goals || [],
          gender: profileData.gender || 'other',
          memberSince: new Date(profileData.created_at),
          level: profileData.level || 1,
          stats: {
            workoutsCompleted,
            totalMinutes,
            streakDays,
            achievementsCount: profileData.achievements?.length || 0,
            followersCount: 0,
            followingCount: 0,
          },
          achievements: (profileData.achievements || []).map((a: any) => ({
            ...a,
            unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : null,
          })),
          recentWorkouts: (profileData.recent_workouts || []).map((w: any) => ({
            ...w,
            completedAt: new Date(w.completedAt),
          })),

          // Fitness profile fields (convert null to undefined)
          fitnessLevel: profileData.fitness_level || undefined,
          age: profileData.age || undefined,
          eventType: profileData.event_type || undefined,
          limitations: profileData.limitations || [],
          availableEquipment: profileData.available_equipment || [],
          preferredDuration: profileData.preferred_duration || undefined,
          preferredWorkoutStyles: profileData.preferred_workout_styles || [],
          preferredMuscles: profileData.preferred_muscles || [],
          frequencyDays: profileData.frequency_days || [],
          preferredTime: profileData.preferred_time || undefined,
          onboardingCompleted: profileData.onboarding_completed,
          totalWorkoutsGenerated: profileData.total_workouts_generated || 0,
        };

        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodizationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to load from user_periodization table
      const { data, error } = await supabase
        .from('user_periodization')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() to avoid 406 error when no data exists

      if (error) {
        // Silently fall back to mock data - this is expected for new users
        return;
      }

      if (data) {
        const periodizationState: PeriodizationState = {
          currentWeek: data.current_week,
          totalWeeksCompleted: data.current_week,
          macroCyclePhase: data.macro_phase as any,
          microCycleWeek: data.micro_week as any,
          isDeloadWeek: data.is_deload_week,
          weeksSinceLastDeload: Math.floor((data.current_week - 1) % 4),
          nextDeloadWeek: Math.ceil(data.current_week / 4) * 4,
          currentVolumeMultiplier: parseFloat(String(data.current_volume_multiplier)),
          currentIntensityMultiplier: parseFloat(String(data.current_intensity_multiplier)),
        };
        setPeriodization(periodizationState);
      }
    } catch (error) {
      // Silently fail - using mock data is fine for new users
      return;
    }
  };

  const loadWorkoutStylesData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load workout sessions and count styles
      const { data: workouts, error } = await supabase
        .from('workout_sessions')
        .select('workout_style')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (error) {
        console.log('Workout sessions table not ready yet, using mock data');
        return;
      }

      if (workouts && workouts.length > 0) {
        // Count styles
        const styleCounts: Record<string, number> = {};
        workouts.forEach(w => {
          const style = w.workout_style || 'traditional';
          styleCounts[style] = (styleCounts[style] || 0) + 1;
        });

        // Convert to array with percentages
        const total = workouts.length;
        const stylesArray = Object.entries(styleCounts).map(([style, count]) => ({
          style: style as any,
          name: style.toUpperCase(),
          emoji: getStyleEmoji(style),
          count,
          percentage: Math.round((count / total) * 100),
          color: getStyleColor(style),
        }));

        setWorkoutStyles(stylesArray);
      }
    } catch (error) {
      console.error('Error loading workout styles:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load recent workout sessions
      const { data: workouts, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (error) {
        console.log('Workout sessions table not ready yet, using mock data');
        return;
      }

      if (workouts) {
        const activities = workouts.map(w => ({
          id: w.id,
          type: 'workout' as const,
          title: w.workout_name || 'Workout',
          description: w.notes || '',
          timestamp: new Date(w.completed_at || w.started_at),
          metadata: {
            duration: w.total_duration,
            caloriesBurned: w.calories_burned,
            workoutStyle: w.workout_style,
            icon: getStyleEmoji(w.workout_style),
          },
        }));

        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
  };

  // Helper functions for workout styles
  const getStyleEmoji = (style: string): string => {
    const emojiMap: Record<string, string> = {
      traditional: '💪',
      circuit: '🔄',
      emom: '⏱️',
      amrap: '⚡',
      tabata: '⚡',
      superset: '🔁',
      'drop-set': '📉',
      pyramid: '🔺',
      cluster: '🎯',
      ladder: '📶',
      complex: '🧩',
      'for-time': '⏰',
    };
    return emojiMap[style] || '💪';
  };

  const getStyleColor = (style: string): string => {
    const colorMap: Record<string, string> = {
      traditional: 'from-blue-500 to-cyan-500',
      circuit: 'from-purple-500 to-pink-500',
      emom: 'from-orange-500 to-red-500',
      amrap: 'from-green-500 to-emerald-500',
      tabata: 'from-yellow-500 to-orange-500',
      superset: 'from-indigo-500 to-purple-500',
      'drop-set': 'from-red-500 to-pink-500',
      pyramid: 'from-cyan-500 to-blue-500',
      cluster: 'from-teal-500 to-cyan-500',
      ladder: 'from-lime-500 to-green-500',
      complex: 'from-fuchsia-500 to-pink-500',
      'for-time': 'from-amber-500 to-orange-500',
    };
    return colorMap[style] || 'from-blue-500 to-cyan-500';
  };

  // Handler for saving profile updates
  const handleSaveProfile = async (updatedProfile: Partial<UserProfile> & { avatarFile?: File | null }) => {
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let avatarUrl = updatedProfile.avatarUrl;

      // Handle avatar upload if there's a new file
      if (updatedProfile.avatarFile) {
        const fileExt = updatedProfile.avatarFile.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, updatedProfile.avatarFile, {
            upsert: true,
            contentType: updatedProfile.avatarFile.type,
          });

        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          toast.error('Failed to upload avatar. Please try again.');
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: updatedProfile.displayName,
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          avatar_url: avatarUrl,
          fitness_goals: updatedProfile.fitnessGoals,
          gender: updatedProfile.gender,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profile updated successfully!');

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          displayName: updatedProfile.displayName || profile.displayName,
          username: updatedProfile.username || profile.username,
          bio: updatedProfile.bio || profile.bio,
          avatarUrl: avatarUrl || profile.avatarUrl,
          fitnessGoals: updatedProfile.fitnessGoals || profile.fitnessGoals,
          gender: updatedProfile.gender || profile.gender,
        });
      }

      // Reload profile data to ensure consistency
      await loadProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for onboarding navigation
  const handleCompleteOnboarding = () => {
    navigate('/workout-generator');
  };

  // Mock data for demonstration (will be replaced with real data from database)
  const mockPeriodization: PeriodizationState = {
    currentWeek: 5,
    totalWeeksCompleted: 5,
    macroCyclePhase: 'build',
    microCycleWeek: 'week2',
    isDeloadWeek: false,
    weeksSinceLastDeload: 2,
    nextDeloadWeek: 8,
    currentVolumeMultiplier: 1.1,
    currentIntensityMultiplier: 1.15,
  };

  const mockWorkoutStyles = [
    { style: 'traditional' as const, name: 'Traditional', emoji: '💪', count: 12, percentage: 40, color: 'from-blue-500 to-cyan-500' },
    { style: 'circuit' as const, name: 'Circuit', emoji: '🔄', count: 8, percentage: 27, color: 'from-purple-500 to-pink-500' },
    { style: 'emom' as const, name: 'EMOM', emoji: '⏱️', count: 6, percentage: 20, color: 'from-orange-500 to-red-500' },
    { style: 'amrap' as const, name: 'AMRAP', emoji: '⚡', count: 4, percentage: 13, color: 'from-green-500 to-emerald-500' },
  ];

  const mockWeeks = [
    { week: 1, volume: 75, intensity: 70, workoutsCompleted: 3, isDeload: false },
    { week: 2, volume: 80, intensity: 75, workoutsCompleted: 4, isDeload: false },
    { week: 3, volume: 85, intensity: 80, workoutsCompleted: 4, isDeload: false },
    { week: 4, volume: 60, intensity: 50, workoutsCompleted: 2, isDeload: true },
    { week: 5, volume: 90, intensity: 85, workoutsCompleted: 4, isDeload: false },
    { week: 6, volume: 95, intensity: 90, workoutsCompleted: 4, isDeload: false },
    { week: 7, volume: 100, intensity: 95, workoutsCompleted: 5, isDeload: false },
    { week: 8, volume: 65, intensity: 55, workoutsCompleted: 2, isDeload: true },
  ];

  const mockActivities = [
    {
      id: '1',
      type: 'workout' as const,
      title: 'Full Body Circuit',
      description: 'Crushed a high-intensity circuit workout!',
      timestamp: new Date(Date.now() - 2 * 3600000),
      metadata: { duration: 45, caloriesBurned: 380, workoutStyle: 'Circuit', icon: '🔄' },
    },
    {
      id: '2',
      type: 'achievement' as const,
      title: 'Week Warrior',
      description: 'Completed 5 workouts in one week',
      timestamp: new Date(Date.now() - 1 * 86400000),
      metadata: { icon: '🏆' },
    },
    {
      id: '3',
      type: 'streak' as const,
      title: '7-Day Streak',
      description: 'Worked out 7 days in a row!',
      timestamp: new Date(Date.now() - 2 * 86400000),
      metadata: { icon: '🔥' },
    },
    {
      id: '4',
      type: 'workout' as const,
      title: 'Upper Body EMOM',
      description: 'Every minute on the minute - pure intensity!',
      timestamp: new Date(Date.now() - 3 * 86400000),
      metadata: { duration: 30, caloriesBurned: 220, workoutStyle: 'EMOM', icon: '⏱️' },
    },
    {
      id: '5',
      type: 'milestone' as const,
      title: '30 Workouts Completed',
      description: 'Hit a major milestone!',
      timestamp: new Date(Date.now() - 5 * 86400000),
      metadata: { icon: '🎯' },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-orange-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header - Full Width */}
        <ProfileHeader
          profile={profile}
          onEdit={() => setShowEditModal(true)}
        />

        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <TrainingOverview
              totalWorkouts={profile.stats.workoutsCompleted}
              totalMinutes={profile.stats.totalMinutes}
              currentStreak={profile.stats.streakDays}
              currentWeek={periodization?.currentWeek || mockPeriodization.currentWeek}
              totalWeeks={12}
              phaseName={periodization?.macroCyclePhase || mockPeriodization.macroCyclePhase}
            />
            <PeriodizationStatus periodization={periodization || mockPeriodization} />
            <FitnessProfileSummary
              fitnessLevel={profile.fitnessLevel}
              age={profile.age}
              eventType={profile.eventType}
              limitations={profile.limitations}
              availableEquipment={profile.availableEquipment}
              preferredDuration={profile.preferredDuration}
              preferredWorkoutStyles={profile.preferredWorkoutStyles}
              frequencyDays={profile.frequencyDays}
              preferredTime={profile.preferredTime}
              onCompleteOnboarding={handleCompleteOnboarding}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <WorkoutStylesBreakdown
              styles={workoutStyles.length > 0 ? workoutStyles : mockWorkoutStyles}
              totalWorkouts={profile.stats.workoutsCompleted}
            />
            <ProgressionTimeline weeks={mockWeeks} currentWeek={periodization?.currentWeek || 5} />
            <AchievementsPreview
              achievements={profile.achievements}
              totalAchievements={20}
            />
          </div>
        </div>

        {/* Recent Activity - Full Width */}
        <RecentActivity activities={recentActivities.length > 0 ? recentActivities : mockActivities} />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        profile={profile!}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
        isUpdating={isUpdating}
      />
    </div>
  );
}
