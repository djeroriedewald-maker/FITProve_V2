import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Award } from 'lucide-react';
import { GamificationService } from '../../services/gamification.service';
import { useAuth } from '../../contexts/AuthContext';
import type { UserLevel } from '../../types/gamification.types';
import confetti from 'canvas-confetti';

interface XPProgressBarProps {
  variant?: 'compact' | 'full' | 'hero';
  showDetails?: boolean;
  onLevelUp?: (newLevel: number) => void;
}

export function XPProgressBar({
  variant = 'compact',
  showDetails = true,
  onLevelUp,
}: XPProgressBarProps) {
  const { user } = useAuth();
  const [levelData, setLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [levelingUp, setLevelingUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchLevelData();
    }
  }, [user]);

  const fetchLevelData = async () => {
    if (!user) return;

    try {
      const data = await GamificationService.getLevelProgression(user.id);

      // Check for level up
      if (previousLevel && data && data.current_level > previousLevel) {
        handleLevelUp(data.current_level);
      }

      setPreviousLevel(data?.current_level || 1);
      setLevelData(data);
    } catch (error) {
      console.error('Error fetching level data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelUp = (newLevel: number) => {
    setLevelingUp(true);

    // Trigger confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Call callback
    if (onLevelUp) {
      onLevelUp(newLevel);
    }

    setTimeout(() => setLevelingUp(false), 3000);
  };

  if (loading || !levelData) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-12 bg-white/10 rounded-xl" />
      </div>
    );
  }

  const { current_level, current_xp, level_title, xp_needed_for_next_level, progress_percentage } = levelData;

  if (variant === 'compact') {
    return (
      <div className="relative">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <motion.div
            className="relative flex-shrink-0"
            animate={levelingUp ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <span className="text-white font-bold text-lg">{current_level}</span>
            </div>
            {levelingUp && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, repeat: 3 }}
              />
            )}
          </motion.div>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white">{level_title}</span>
              <span className="text-xs text-white/60">
                {current_xp}/{xp_needed_for_next_level} XP
              </span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(progress_percentage, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        {/* Level Up Notification */}
        <AnimatePresence>
          {levelingUp && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="absolute top-full left-0 right-0 mt-2 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-2 text-black">
                <Award className="w-5 h-5" />
                <span className="font-bold">Level Up! You're now level {current_level}!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <motion.div
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={levelingUp ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <span className="text-white font-bold text-2xl">{current_level}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
            </motion.div>

            <div>
              <h3 className="text-xl font-bold text-white">{level_title}</h3>
              <p className="text-sm text-white/60">Level {current_level}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{current_xp}</div>
            <div className="text-xs text-white/60">/ {xp_needed_for_next_level} XP</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-3">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(progress_percentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow">
            {Math.floor(progress_percentage)}%
          </div>
        </div>

        {showDetails && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-cyan-400">
                {xp_needed_for_next_level - current_xp}
              </div>
              <div className="text-xs text-white/60">XP to next level</div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-400">{levelData.total_xp}</div>
              <div className="text-xs text-white/60">Total XP</div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-400">
                {current_level + 1}
              </div>
              <div className="text-xs text-white/60">Next Level</div>
            </div>
          </div>
        )}

        {/* Level Up Notification */}
        <AnimatePresence>
          {levelingUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-xl"
            >
              <div className="flex items-center gap-3 text-black">
                <Award className="w-8 h-8" />
                <div>
                  <div className="font-bold text-lg">LEVEL UP!</div>
                  <div className="text-sm">You've reached level {current_level}!</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Hero variant
  return (
    <motion.div
      className="relative bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-8 border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ backgroundSize: '200% 200%' }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative"
              animate={levelingUp ? { scale: [1, 1.3, 1], rotate: [0, 360] } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50">
                <span className="text-white font-bold text-4xl">{current_level}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{level_title}</h2>
              <p className="text-lg text-white/70">Level {current_level}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {current_xp}
            </div>
            <div className="text-sm text-white/60">/ {xp_needed_for_next_level} XP</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-6 bg-white/10 rounded-full overflow-hidden mb-6">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.min(progress_percentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-lg">
            {Math.floor(progress_percentage)}% to Level {current_level + 1}
          </div>
        </div>

        {showDetails && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-cyan-400">
                {xp_needed_for_next_level - current_xp}
              </div>
              <div className="text-xs text-white/60">XP Needed</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400">{levelData.total_xp}</div>
              <div className="text-xs text-white/60">Total XP</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-400">
                {current_level + 1}
              </div>
              <div className="text-xs text-white/60">Next Level</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-lg text-white/60 mb-2">🏆</div>
              <div className="text-2xl font-bold text-white">{level_title}</div>
              <div className="text-xs text-white/60">Your Title</div>
            </div>
          </div>
        )}
      </div>

      {/* Level Up Notification */}
      <AnimatePresence>
        {levelingUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl z-20"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Award className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              </motion.div>
              <div className="text-6xl font-bold text-white mb-2">LEVEL UP!</div>
              <div className="text-2xl text-white/80">You're now level {current_level}!</div>
              <div className="text-lg text-white/60 mt-2">Keep crushing it! 💪</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
