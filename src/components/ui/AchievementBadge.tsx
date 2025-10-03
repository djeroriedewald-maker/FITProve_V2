import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Crown, Flame, Target, Zap, Heart, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'strength' | 'endurance' | 'consistency' | 'social' | 'achievement';
  icon?: string;
  isUnlocked?: boolean;
  unlockedAt?: Date;
  progress?: {
    current: number;
    target: number;
    unit?: string;
  };
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgeProps {
  badge: BadgeData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'card' | 'compact' | 'minimal';
  showProgress?: boolean;
  showAnimation?: boolean;
  onClick?: (badge: BadgeData) => void;
  className?: string;
}

const badgeIcons = {
  strength: Trophy,
  endurance: Flame,
  consistency: Target,
  social: Heart,
  achievement: Award,
};

const badgeColors = {
  bronze: {
    bg: 'from-orange-600/30 to-amber-700/30',
    border: 'border-orange-500/50',
    glow: 'shadow-orange-500/30',
    text: 'text-orange-300',
    icon: 'text-orange-400',
  },
  silver: {
    bg: 'from-gray-400/30 to-slate-500/30',
    border: 'border-gray-400/50',
    glow: 'shadow-gray-400/30',
    text: 'text-gray-300',
    icon: 'text-gray-400',
  },
  gold: {
    bg: 'from-yellow-500/30 to-yellow-600/30',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-500/30',
    text: 'text-yellow-300',
    icon: 'text-yellow-400',
  },
  platinum: {
    bg: 'from-cyan-400/30 to-blue-500/30',
    border: 'border-cyan-400/50',
    glow: 'shadow-cyan-400/30',
    text: 'text-cyan-300',
    icon: 'text-cyan-400',
  },
  diamond: {
    bg: 'from-purple-500/30 to-pink-500/30',
    border: 'border-purple-500/50',
    glow: 'shadow-purple-500/30',
    text: 'text-purple-300',
    icon: 'text-purple-400',
  },
};

const rarityColors = {
  common: 'ring-gray-500/30',
  rare: 'ring-blue-500/40',
  epic: 'ring-purple-500/40',
  legendary: 'ring-yellow-500/40',
};

const sizeClasses = {
  sm: {
    container: 'w-16 h-20',
    icon: 'w-6 h-6',
    text: 'text-xs',
  },
  md: {
    container: 'w-20 h-24',
    icon: 'w-8 h-8',
    text: 'text-sm',
  },
  lg: {
    container: 'w-24 h-28',
    icon: 'w-10 h-10',
    text: 'text-base',
  },
  xl: {
    container: 'w-32 h-36',
    icon: 'w-12 h-12',
    text: 'text-lg',
  },
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  badge,
  size = 'md',
  variant = 'card',
  showProgress = true,
  showAnimation = true,
  onClick,
  className,
}) => {
  const Icon = badgeIcons[badge.category];
  const colors = badgeColors[badge.type];
  const sizes = sizeClasses[size];
  const isLocked = !badge.isUnlocked;

  const handleClick = () => {
    if (onClick) onClick(badge);
  };

  if (variant === 'minimal') {
    return (
      <motion.div
        className={cn(
          'flex items-center space-x-2 p-2 rounded-lg cursor-pointer',
          isLocked ? 'opacity-50' : 'hover:bg-white/5',
          className
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          `bg-gradient-to-br ${colors.bg}`,
          colors.border,
          'border'
        )}>
          <Icon className={cn('w-4 h-4', colors.icon)} />
        </div>
        <div>
          <p className={cn('font-medium text-sm', colors.text)}>{badge.name}</p>
          {showProgress && badge.progress && (
            <p className="text-white/60 text-xs">
              {badge.progress.current}/{badge.progress.target} {badge.progress.unit || ''}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'relative p-3 rounded-xl border backdrop-blur-xl cursor-pointer group',
          `bg-gradient-to-br ${colors.bg}`,
          colors.border,
          isLocked ? 'opacity-60' : colors.glow,
          badge.rarity && rarityColors[badge.rarity],
          className
        )}
        onClick={handleClick}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {!isLocked && showAnimation && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}

        <div className="relative text-center">
          <div className={cn(
            'w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center',
            `bg-gradient-to-br ${colors.bg}`,
            'border border-white/20'
          )}>
            <Icon className={cn('w-6 h-6', colors.icon)} />
          </div>
          <h4 className={cn('font-semibold text-xs truncate', colors.text)}>
            {badge.name}
          </h4>
          {showProgress && badge.progress && (
            <div className="mt-2">
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <motion.div
                  className={cn('h-1.5 rounded-full bg-gradient-to-r', colors.bg)}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(badge.progress.current / badge.progress.target) * 100}%` 
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-white/60 text-xs mt-1">
                {badge.progress.current}/{badge.progress.target}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Card variant (default)
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl cursor-pointer group',
        `bg-gradient-to-br ${colors.bg}`,
        colors.border,
        isLocked ? 'opacity-60' : colors.glow,
        badge.rarity && `ring-2 ${rarityColors[badge.rarity]}`,
        className
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
    >
      {/* Animated background */}
      {!isLocked && showAnimation && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ 
            x: [-200, 200],
            opacity: [0, 1, 0] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            repeatDelay: 2,
            ease: 'easeInOut' 
          }}
        />
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔒
          </motion.div>
        </div>
      )}

      <div className="relative p-6 text-center">
        {/* Badge icon */}
        <motion.div
          className={cn(
            'w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center',
            `bg-gradient-to-br ${colors.bg}`,
            'border-2 border-white/30',
            'shadow-lg'
          )}
          whileHover={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={cn('w-8 h-8', colors.icon)} />
        </motion.div>

        {/* Badge name */}
        <h3 className={cn('font-bold mb-2', sizes.text, colors.text)}>
          {badge.name}
        </h3>

        {/* Badge description */}
        <p className="text-white/70 text-sm leading-relaxed mb-4">
          {badge.description}
        </p>

        {/* Progress bar */}
        {showProgress && badge.progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Progress</span>
              <span className={colors.text}>
                {badge.progress.current}/{badge.progress.target} 
                {badge.progress.unit && ` ${badge.progress.unit}`}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className={cn(
                  'h-2 rounded-full bg-gradient-to-r shadow-sm',
                  colors.bg
                )}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min((badge.progress.current / badge.progress.target) * 100, 100)}%` 
                }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Unlock date */}
        {badge.unlockedAt && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-white/50 text-xs">
              Unlocked {badge.unlockedAt.toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Rarity indicator */}
      {badge.rarity && badge.rarity !== 'common' && (
        <div className="absolute top-2 right-2">
          <motion.div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs',
              badge.rarity === 'legendary' && 'bg-yellow-500/80 text-yellow-900',
              badge.rarity === 'epic' && 'bg-purple-500/80 text-purple-900',
              badge.rarity === 'rare' && 'bg-blue-500/80 text-blue-900'
            )}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360] 
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {badge.rarity === 'legendary' && '👑'}
            {badge.rarity === 'epic' && '💎'}
            {badge.rarity === 'rare' && '⭐'}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// Badge showcase component for profile pages
export const BadgeShowcase: React.FC<{
  badges: BadgeData[];
  title?: string;
  maxDisplay?: number;
  showProgress?: boolean;
}> = ({ badges, title = 'Achievements', maxDisplay = 6, showProgress = true }) => {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = Math.max(0, badges.length - maxDisplay);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <span className="text-white/60 text-sm">
          {badges.filter(b => b.isUnlocked).length}/{badges.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <AnimatePresence>
          {displayBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <AchievementBadge 
                badge={badge} 
                variant="compact" 
                showProgress={showProgress}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {remainingCount > 0 && (
          <motion.div
            className="flex items-center justify-center p-4 rounded-xl border border-dashed border-white/30 text-white/60"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-center">
              <p className="font-semibold">+{remainingCount}</p>
              <p className="text-xs">more</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};