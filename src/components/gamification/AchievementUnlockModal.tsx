import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Zap, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AchievementProgress } from '../../types/gamification.types';

interface AchievementUnlockModalProps {
  achievement: AchievementProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIER_COLORS = {
  bronze: 'from-orange-700 to-orange-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-blue-600',
  legend: 'from-purple-500 to-pink-600',
};

const TIER_EMOJIS = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  legend: '👑',
};

export function AchievementUnlockModal({
  achievement,
  isOpen,
  onClose,
}: AchievementUnlockModalProps) {
  useEffect(() => {
    if (isOpen && achievement) {
      // Trigger confetti based on tier
      triggerConfetti(achievement.achievement.tier);
    }
  }, [isOpen, achievement]);

  const triggerConfetti = (tier: string) => {
    const duration = tier === 'legend' ? 5000 : tier === 'platinum' ? 3000 : 2000;
    const particleCount = tier === 'legend' ? 300 : tier === 'platinum' ? 200 : 150;

    const end = Date.now() + duration;

    const colors =
      tier === 'legend'
        ? ['#9333ea', '#ec4899', '#f59e0b']
        : tier === 'platinum'
        ? ['#06b6d4', '#3b82f6']
        : tier === 'gold'
        ? ['#fbbf24', '#f59e0b']
        : tier === 'silver'
        ? ['#d1d5db', '#9ca3af']
        : ['#ea580c', '#dc2626'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        zIndex: 9999,
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Big burst in the center
    confetti({
      particleCount: particleCount,
      spread: 180,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 9999,
      shapes: ['circle', 'square'],
      gravity: 0.8,
      drift: 0,
      ticks: 300,
    });

    // Special effects for legend tier
    if (tier === 'legend') {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 360,
          origin: { y: 0.5 },
          colors: colors,
          shapes: ['star'],
          gravity: 0.3,
          scalar: 2,
          zIndex: 9999,
        });
      }, 500);
    }
  };

  if (!achievement) return null;

  const { achievement: def } = achievement;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{ type: 'spring', duration: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg"
            >
              {/* Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 rounded-3xl blur-3xl bg-gradient-to-br ${
                  TIER_COLORS[def.tier]
                } -z-10`}
              />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl border-2 border-white/20 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20px 20px, white 1px, transparent 0)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                {/* Content */}
                <div className="relative z-10 p-8 text-center">
                  {/* Header */}
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-semibold text-white uppercase tracking-wider">
                        Achievement Unlocked!
                      </span>
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </div>
                  </motion.div>

                  {/* Achievement Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                    className="relative mx-auto w-32 h-32 mb-6"
                  >
                    {/* Rotating Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${
                        TIER_COLORS[def.tier]
                      } opacity-50 blur-xl`}
                    />

                    {/* Main Icon */}
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className={`relative w-full h-full rounded-full bg-gradient-to-br ${
                        TIER_COLORS[def.tier]
                      } flex items-center justify-center shadow-2xl`}
                    >
                      <div className="text-6xl">{TIER_EMOJIS[def.tier]}</div>

                      {/* Shine Effect */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full"
                        style={{
                          background:
                            'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                        }}
                      />
                    </motion.div>

                    {/* Orbiting Stars */}
                    {[0, 120, 240].map((angle, index) => (
                      <motion.div
                        key={angle}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: index * 0.3,
                        }}
                        className="absolute inset-0"
                      >
                        <Star
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-400 fill-yellow-400"
                          style={{ transform: `rotate(${angle}deg) translateY(-80px)` }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Tier Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mb-4"
                  >
                    <div
                      className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${
                        TIER_COLORS[def.tier]
                      } shadow-lg`}
                    >
                      {def.tier} Tier
                    </div>
                  </motion.div>

                  {/* Achievement Name */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-3xl font-bold text-white mb-3"
                  >
                    {def.name}
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg text-white/70 mb-6"
                  >
                    {def.description}
                  </motion.p>

                  {/* Divider */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8 }}
                    className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-6"
                  />

                  {/* Rewards */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="text-sm text-white/60 mb-3 uppercase tracking-wider">
                      Rewards Earned
                    </div>
                    <div className="flex items-center justify-center gap-6">
                      {def.xp_reward > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-xl"
                        >
                          <Zap className="w-6 h-6 text-yellow-400" />
                          <div className="text-2xl font-bold text-white">+{def.xp_reward}</div>
                          <div className="text-xs text-white/60">XP</div>
                        </motion.div>
                      )}

                      {def.coin_reward > 0 && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-xl"
                        >
                          <div className="text-3xl">🪙</div>
                          <div className="text-2xl font-bold text-white">+{def.coin_reward}</div>
                          <div className="text-xs text-white/60">Coins</div>
                        </motion.div>
                      )}

                      {def.xp_reward === 0 && def.coin_reward === 0 && (
                        <div className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-xl">
                          <Trophy className="w-6 h-6 text-cyan-400" />
                          <div className="text-sm text-white/70">Badge Unlocked</div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Action Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className={`mt-8 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${
                      TIER_COLORS[def.tier]
                    } shadow-lg hover:shadow-2xl transition-all`}
                  >
                    Awesome! 🎉
                  </motion.button>

                  {/* Share Hint */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-4 text-xs text-white/40"
                  >
                    Keep crushing it to unlock more achievements!
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
