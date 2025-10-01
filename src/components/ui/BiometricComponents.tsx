import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils';

// Biometric-Style Progress Ring
interface BiometricRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  glowColor?: string;
  children?: React.ReactNode;
}

export const BiometricRing: React.FC<BiometricRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#06b6d4',
  glowColor = 'rgba(6, 182, 212, 0.5)',
  children,
}) => {
  const circumference = 2 * Math.PI * (size / 2 - strokeWidth);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer Glow Ring */}
      <svg
        className="absolute inset-0 transform -rotate-90 filter blur-sm"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke={glowColor}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>

      {/* Main Progress Ring */}
      <svg className="absolute inset-0 transform -rotate-90" width={size} height={size}>
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          >
            {Math.round(progress)}%
          </motion.span>
        )}
      </div>
    </div>
  );
};

// Gesture-Responsive Glass Panel
interface GesturePanelProps {
  children: React.ReactNode;
  className?: string;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const GesturePanel: React.FC<GesturePanelProps> = ({
  children,
  className = '',
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleDragEnd = (_: any, info: any) => {
    const { offset, velocity } = info;

    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y > 50 && velocity.y > 0) onSwipeDown?.();
      if (offset.y < -50 && velocity.y < 0) onSwipeUp?.();
    } else {
      if (offset.x > 50 && velocity.x > 0) onSwipeRight?.();
      if (offset.x < -50 && velocity.x < 0) onSwipeLeft?.();
    }
  };

  return (
    <motion.div
      ref={constraintsRef}
      className={cn(
        'backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 cursor-grab active:cursor-grabbing',
        className
      )}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      whileDrag={{
        scale: 1.05,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

// Advanced Workout Intensity Visualizer
interface IntensityVisualizerProps {
  heartRate?: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  animate?: boolean;
}

export const IntensityVisualizer: React.FC<IntensityVisualizerProps> = ({
  heartRate,
  intensity,
  animate = true,
}) => {
  const intensityConfig = {
    low: { color: '#22c55e', bars: 3, pulse: 1 },
    medium: { color: '#f59e0b', bars: 5, pulse: 1.5 },
    high: { color: '#ef4444', bars: 7, pulse: 2 },
    extreme: { color: '#dc2626', bars: 10, pulse: 3 },
  };

  const config = intensityConfig[intensity];

  return (
    <div className="flex flex-col items-center space-y-4 p-6 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl">
      {/* Heart Rate Display */}
      {heartRate && (
        <motion.div
          className="flex items-center space-x-2"
          animate={animate ? { scale: [1, 1.1, 1] } : {}}
          transition={{
            repeat: Infinity,
            duration: 60 / heartRate,
            ease: 'easeInOut',
          }}
        >
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-white font-bold text-lg">{heartRate} BPM</span>
        </motion.div>
      )}

      {/* Intensity Bars */}
      <div className="flex items-end space-x-1 h-16">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 rounded-full"
            style={{
              height: `${(i + 1) * 6}px`,
              backgroundColor: i < config.bars ? config.color : 'rgba(255,255,255,0.2)',
            }}
            animate={
              animate && i < config.bars
                ? {
                    scaleY: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Intensity Label */}
      <motion.div
        className="text-center"
        animate={
          animate
            ? {
                textShadow: [
                  `0 0 5px ${config.color}`,
                  `0 0 20px ${config.color}`,
                  `0 0 5px ${config.color}`,
                ],
              }
            : {}
        }
        transition={{
          repeat: Infinity,
          duration: config.pulse,
          ease: 'easeInOut',
        }}
      >
        <div className="text-white font-bold text-sm uppercase tracking-wider">
          {intensity} Intensity
        </div>
      </motion.div>
    </div>
  );
};

// Holographic Stats Display
interface HologramStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    unit?: string;
    color?: string;
    icon?: React.ReactNode;
  }>;
}

export const HologramStats: React.FC<HologramStatsProps> = ({ stats }) => {
  return (
    <div className="relative p-8 backdrop-blur-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 border border-white/30 rounded-3xl overflow-hidden">
      {/* Hologram Grid Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <motion.div
              key={i}
              className="border border-cyan-400/30"
              animate={{
                borderColor: [
                  'rgba(6, 182, 212, 0.1)',
                  'rgba(6, 182, 212, 0.3)',
                  'rgba(6, 182, 212, 0.1)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: (i * 0.1) % 2,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scanning Line Effect */}
      <motion.div
        className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ y: [0, 300, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Stats Display */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            {stat.icon && (
              <motion.div
                className="flex justify-center mb-2"
                animate={{
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className={`w-8 h-8 ${stat.color || 'text-cyan-400'}`}>{stat.icon}</div>
              </motion.div>
            )}

            <motion.div
              className="text-3xl font-bold text-white mb-1"
              animate={{
                textShadow: [
                  '0 0 5px rgba(6, 182, 212, 0.5)',
                  '0 0 20px rgba(6, 182, 212, 0.8)',
                  '0 0 5px rgba(6, 182, 212, 0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {stat.value}
              {stat.unit && <span className="text-lg text-white/60">{stat.unit}</span>}
            </motion.div>

            <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Corner Elements */}
      {[0, 1, 2, 3].map((corner) => (
        <div
          key={corner}
          className={`absolute w-8 h-8 border-2 border-cyan-400 ${
            corner === 0
              ? 'top-4 left-4 border-r-0 border-b-0'
              : corner === 1
                ? 'top-4 right-4 border-l-0 border-b-0'
                : corner === 2
                  ? 'bottom-4 left-4 border-r-0 border-t-0'
                  : 'bottom-4 right-4 border-l-0 border-t-0'
          }`}
        />
      ))}
    </div>
  );
};
