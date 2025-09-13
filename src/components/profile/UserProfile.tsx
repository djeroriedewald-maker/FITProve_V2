import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile as IUserProfile } from '../../types/profile.types';
import { UserStatsGrid } from './UserStatsGrid';
import { AchievementsGrid } from './AchievementsGrid';
import { WorkoutHistoryList } from './WorkoutHistoryList';
import { EditProfileModal } from './EditProfileModal';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../lib/api';

interface UserProfileProps {
  profile: IUserProfile;
  isOwnProfile?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile, isOwnProfile = false }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, refreshProfile } = useAuth();

  const handleProfileUpdate = async (updatedProfile: Partial<IUserProfile>) => {
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
      })
        .then(({ data, error }) => {
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
        .catch((err) => {
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
      }
    });
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.displayName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
              <p className="mt-2 text-gray-700 dark:text-gray-300 max-w-2xl">
                {profile.bio}
              </p>
              
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
            </motion.div>
          </div>

          <div className="flex space-x-2">
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                disabled={isUpdating}
                className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {isUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Edit className="w-5 h-5" />
                )}
              </button>
            ) : (
              <button className="px-4 py-2 bg-primary text-white rounded-lg shadow hover:shadow-lg transition-shadow">
                Follow
              </button>
            )}
            <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Stats Overview
        </h2>
        <UserStatsGrid stats={profile.stats} />
      </section>

      {/* Achievements Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Achievements
        </h2>
        <AchievementsGrid achievements={profile.achievements} />
      </section>

      {/* Recent Workouts Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Workouts
        </h2>
        <WorkoutHistoryList workouts={profile.recentWorkouts} />
      </section>
    </div>
  );
};