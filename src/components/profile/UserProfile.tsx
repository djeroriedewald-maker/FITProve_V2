import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Share2, Loader2, Settings, Zap, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile as IUserProfile } from '../../types/profile.types';
import { UserStatsGrid } from './UserStatsGrid';
import { BadgesGrid } from './BadgesGrid';
import { WorkoutHistoryList } from './WorkoutHistoryList';
import { EditProfileModal } from './EditProfileModal';
import { AutoPostSettingsModal } from './AutoPostSettingsModal';
import { ManualWorkoutPostModal } from '../social/ManualWorkoutPostModal';
import { AnalyticsDashboard } from '../ui/AnalyticsDashboard';
import { UserSearchModal } from './UserSearchModal';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, isFollowingUser, followUser, unfollowUser } from '../../lib/api.ts';

export const UserProfile: React.FC<UserProfileProps> = ({ profile, isOwnProfile = false }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAutoPostSettingsOpen, setIsAutoPostSettingsOpen] = useState(false);
  const [isManualPostModalOpen, setIsManualPostModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, refreshProfile } = useAuth();
  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // User search modal state
  const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);

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
  avatarFile: (updatedProfile as any).avatarFile || null,
  })
  .then(({ data, error }: { data: IUserProfile | null; error: Error | null }) => {
          if (error) {
            console.error('Profile update error:', error);
            reject(error);
          } else {
            // Als het gelukt is, ververs dan het profiel en resolve
            refreshProfile()
              .then(() => resolve(data))
              .catch((refreshError) => {
                console.error('Profile refresh error:', refreshError);
                // Zelfs als refresh faalt, is de update wel gelukt
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
    // Optionally refresh the social feed or navigate to the post
  };

  return (
    <div className="w-full py-8">
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleProfileUpdate}
        isUpdating={isUpdating}
      />

      <UserSearchModal
        isOpen={isUserSearchOpen}
        onClose={() => setIsUserSearchOpen(false)}
        onUserSelected={(user) => {
          // Optionally navigate to user profile or do something
          setIsUserSearchOpen(false);
        }}
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
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              {profile.level}
            </div>
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.displayName}
                </h1>
                {/* Follow button logic */}
                {!isOwnProfile && profile.allowFollow && profile.isPublic !== false && user && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-4 py-1 rounded-full font-semibold text-sm shadow transition focus:outline-none ${isFollowing ? 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-primary text-white hover:bg-primary/90'} ${followLoading ? 'opacity-60' : ''}`}
                  >
                    {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-2xl">{profile.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.fitnessGoals.map((goal, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-primary/10 dark:bg-primary/20 text-primary rounded-full"
                  >
                    {goal}
                  </span>
                ))}
              </div>
              {/* Profile Action Buttons - Mobile Friendly Vertical/2-col Grid */}
              {isOwnProfile && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mx-auto">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    disabled={isUpdating}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit className="w-5 h-5" />}
                    <span>Bewerken</span>
                  </button>
                  {/* Find Users Button */}
                  <button
                    onClick={() => setIsUserSearchOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700 transition"
                  >
                    <span>Find Users</span>
                  </button>
                  <button
                    onClick={() => setIsManualPostModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow-sm hover:bg-green-700 transition"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Workout Post</span>
                  </button>
                  <button
                    onClick={() => setIsAutoPostSettingsOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold shadow-sm hover:bg-gray-700 transition"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Auto-Posts</span>
                  </button>
                  <Link
                    to="/modules/workout/my-workouts"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold shadow-sm hover:bg-orange-700 transition"
                  >
                    <Dumbbell className="w-5 h-5" />
                    <span>My Workouts</span>
                  </Link>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* (Old button group removed; now handled above for mobile/desktop) */}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stats Overview</h2>
        <UserStatsGrid stats={{ ...profile.stats, achievementsCount: profile.badgesCount ?? 0 }} />
      </section>

      {/* Achievements Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Achievements</h2>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Workouts</h2>
        <WorkoutHistoryList workouts={profile.recentWorkouts} />
      </section>
    </div>
  );
}
