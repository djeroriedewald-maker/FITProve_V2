/**
 * Premium Profile Header Component
 * Glass morphism card with avatar, username, stats, and actions
 */

import { motion } from 'framer-motion';
import { Edit3, Share2, Eye, Camera } from 'lucide-react';
import type { UserProfile } from '../../types/profile.types';

interface ProfileHeaderProps {
  profile: UserProfile;
  onEdit?: () => void;
  onShare?: () => void;
  onViewPublic?: () => void;
  onAvatarClick?: () => void;
}

export function ProfileHeader({
  profile,
  onEdit,
  onShare,
  onViewPublic,
  onAvatarClick,
}: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-tr from-orange-500/20 to-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative p-8">
        {/* Top Row: Avatar + Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              {/* Glowing Border */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Avatar Image */}
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      {profile.displayName?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                {/* Camera Icon Overlay */}
                {onAvatarClick && (
                  <button
                    onClick={onAvatarClick}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Lvl {profile.level || 1}
            </div>
          </div>

          {/* Name & Details */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {profile.displayName || 'Fitness Champion'}
            </h1>
            <p className="text-gray-400 text-lg mb-4">
              @{profile.username || 'athlete'}
            </p>

            {/* Status Line */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm mb-4">
              {profile.fitnessLevel && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                  💎 {profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1)}
                </span>
              )}

              {profile.fitnessGoals && profile.fitnessGoals[0] && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/30">
                  🎯 {profile.fitnessGoals[0].charAt(0).toUpperCase() + profile.fitnessGoals[0].slice(1)}
                </span>
              )}

              {profile.memberSince && (
                <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                  📅 {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}

              {profile.stats?.streakDays > 0 && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30">
                  🔥 {profile.stats.streakDays}-day streak
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 text-sm max-w-2xl">
                "{profile.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </motion.button>

          {onShare && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShare}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share Progress
            </motion.button>
          )}

          {onViewPublic && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewPublic}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-all"
            >
              <Eye className="w-4 h-4" />
              View Public
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
