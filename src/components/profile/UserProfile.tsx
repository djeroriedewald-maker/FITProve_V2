import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile as IUserProfile } from '../../types/profile.types';
import type { Badge } from './BadgesGrid';

import { UserStatsGrid } from './UserStatsGrid';
import { BadgesGrid } from './BadgesGrid';
import { WorkoutHistoryList } from './WorkoutHistoryList';
import { EditProfileModal } from './EditProfileModal';
import { AutoPostSettingsModal } from './AutoPostSettingsModal';
import { ManualWorkoutPostModal } from '../social/ManualWorkoutPostModal';
import { AnalyticsDashboard } from '../ui/AnalyticsDashboard';
import { UserSearchModal } from './UserSearchModal';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, isFollowingUser, followUser, unfollowUser } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  profile: IUserProfile & {
    badgesCount?: number;
    badges?: Badge[];
    isPublic?: boolean;
    allowFollow?: boolean;
  };
  isOwnProfile?: boolean;
  onProfileUpdated?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  isOwnProfile = false,
  onProfileUpdated,
}) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAutoPostSettingsOpen, setIsAutoPostSettingsOpen] = useState(false);
  const [isManualPostModalOpen, setIsManualPostModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, refreshProfile, profile: contextProfile } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);

  // Use the latest profile from context if this is the user's own profile
  const displayProfile = isOwnProfile && contextProfile ? contextProfile : profile;

  // Fetch follow state from backend
  useEffect(() => {
    let mounted = true;
    if (!user || isOwnProfile || !profile.allowFollow) return;
    setFollowLoading(true);
    isFollowingUser(profile.id)
      .then((following) => {
        if (mounted) setIsFollowing(following);
      })
      .finally(() => {
        if (mounted) setFollowLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user, isOwnProfile, profile.allowFollow, profile.id]);

  const handleFollowToggle = async () => {
    if (!user) return;
    setFollowLoading(true);
    let success = false;
    if (isFollowing) {
      success = await unfollowUser(profile.id);
    } else {
      success = await followUser(profile.id);
      if (!success) {
        toast.error('Cannot follow this user. Their privacy settings do not allow it.');
      }
    }
    if (success) setIsFollowing((prev) => !prev);
    setFollowLoading(false);
  };

  const handleProfileUpdate = async (
    updatedProfile: Partial<IUserProfile> & { avatarFile?: File | null }
  ) => {
    if (!user) return;

    const promise = new Promise((resolve, reject) => {
      setIsUpdating(true);
      updateUserProfile({
        userId: user.id,
        displayName: updatedProfile.displayName || profile.displayName,
        username: updatedProfile.username || profile.username,
        bio: updatedProfile.bio || profile.bio,
        avatarUrl: updatedProfile.avatarUrl || profile.avatarUrl,
        fitnessGoals: updatedProfile.fitnessGoals || profile.fitnessGoals,
        gender: updatedProfile.gender || profile.gender || 'other',
        avatarFile: (updatedProfile as { avatarFile?: File | null }).avatarFile || null,
        allowFollow: typeof profile.allowFollow === 'boolean' ? profile.allowFollow : true,
      })
        .then(({ data, error }: { data: IUserProfile | null; error: Error | null }) => {
          if (error) {
            console.error('Profile update error:', error);
            reject(error);
          } else {
            refreshProfile()
              .then(() => {
                if (onProfileUpdated) onProfileUpdated();
                window.location.reload();
                resolve(data);
              })
              .catch((refreshError) => {
                console.error('Profile refresh error:', refreshError);
                if (onProfileUpdated) onProfileUpdated();
                window.location.reload();
                resolve(data);
              });
          }
        })
        .catch((err: unknown) => {
          console.error('Profile update caught error:', err);
          reject(err);
        })
        .finally(() => {
          setIsUpdating(false);
        });
    });

    toast.promise(promise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: (err) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return `Failed to update profile: ${message}`;
      },
    });
  };

  const handlePostCreated = (_postId: string) => {
    toast.success('Workout post aangemaakt!', {
      description: `Je post is succesvol gedeeld met de community.`,
    });
  };

  console.log('UserProfile profile prop:', profile);
  return (
    <>
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={displayProfile}
        onSave={handleProfileUpdate}
        isUpdating={isUpdating}
      />
      <UserSearchModal
        isOpen={isUserSearchOpen}
        onClose={() => setIsUserSearchOpen(false)}
        onUserSelected={() => setIsUserSearchOpen(false)}
      />
      <AutoPostSettingsModal
        isOpen={isAutoPostSettingsOpen}
        onClose={() => setIsAutoPostSettingsOpen(false)}
      />
      <ManualWorkoutPostModal
        isOpen={isManualPostModalOpen}
        onClose={() => setIsManualPostModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
      {/* Header Section */}
      <div className="relative mb-8">
        {/* Hero Image Full Width & Overlayed Profile Info */}
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-80 md:h-[420px] bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-xl md:rounded-2xl flex items-center justify-center">
          <img
            src="/images/gym_banner.webp"
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ zIndex: 1 }}
          />
          {/* Overlay for better text contrast */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent pointer-events-none"
            style={{ zIndex: 2 }}
          />
          {/* Centered Profile Info */}
          <div className="relative z-30 flex flex-col items-center justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative">
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white dark:border-gray-800 shadow-2xl object-cover bg-white transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-base font-bold border-2 border-white dark:border-gray-800 shadow-md">
                  {profile.level}
                </div>
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {profile.displayName}
              </h1>
              <p className="text-gray-200 text-lg font-medium drop-shadow-md">
                @{profile.username}
              </p>
              {profile.gender && (
                <p className="text-gray-300 text-base font-normal drop-shadow-md mt-1">
                  {profile.gender === 'male' && 'Male'}
                  {profile.gender === 'female' && 'Female'}
                  {profile.gender === 'other' && 'Other'}
                </p>
              )}
              {profile.bio && (
                <p className="mt-2 text-gray-100 max-w-2xl text-center drop-shadow-md px-2">
                  {profile.bio}
                </p>
              )}
              {profile.fitnessGoals && profile.fitnessGoals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {profile.fitnessGoals.map((goal: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-primary/20 text-white rounded-full border border-primary/40 shadow"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
        {/* Profile Info and Actions */}
        <div className="mt-8 flex flex-col items-center text-center md:text-left md:items-start">
          {/* Follow button logic and action buttons */}
          {!isOwnProfile && profile.allowFollow && user && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-sm transition ${
                isFollowing
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'bg-primary text-white hover:bg-primary/90'
              } disabled:opacity-50`}
            >
              {followLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isFollowing ? (
                'Unfollow'
              ) : (
                'Follow'
              )}
            </button>
          )}
          {isOwnProfile && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mx-auto">
              <button
                onClick={() => setIsEditModalOpen(true)}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
                <span>Bewerken</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                onClick={() => setIsUserSearchOpen(true)}
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Stats Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Stats Overview
        </h2>
        <UserStatsGrid
          stats={{ ...profile.stats, achievementsCount: profile.badgesCount ?? 0 }}
        />
      </section>
      {/* Achievements Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Achievements
        </h2>
        <BadgesGrid userId={profile.id} />
      </section>
      {/* Analytics Section - Only for own profile */}
      {isOwnProfile && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Exercise Analytics
          </h2>
          <AnalyticsDashboard />
        </section>
      )}
      {/* Recent Workouts Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Workouts
        </h2>
        <WorkoutHistoryList workouts={profile.recentWorkouts} />
      </section>
    </>
  );
};
