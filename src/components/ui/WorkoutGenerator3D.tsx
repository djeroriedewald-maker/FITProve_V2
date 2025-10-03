import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Star } from 'lucide-react';

// 3D Interactive Card Component
interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: () => void;
  glowColor?: string;
  depth?: number;
}

export const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  children,
  className = '',
  selected = false,
  onClick,
  glowColor = '#00E5FF',
  depth = 15,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotY = ((e.clientX - centerX) / rect.width) * depth;
    const rotX = -((e.clientY - centerY) / rect.height) * depth;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative cursor-pointer rounded-3xl backdrop-blur-xl border transition-all duration-500',
        selected
          ? 'bg-gradient-to-br from-white/20 to-white/5 border-white/30'
          : 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-white/20',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: selected
          ? `0 20px 40px rgba(${glowColor === '#00E5FF' ? '0,229,255' : '180,0,255'},0.3), 0 0 0 1px rgba(${glowColor === '#00E5FF' ? '0,229,255' : '180,0,255'},0.5)`
          : '0 10px 30px rgba(0,0,0,0.2)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
          animate={selected ? { opacity: [0, 1, 0], x: ['-100%', '100%'] } : {}}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      </div>

      {/* 3D depth shadow */}
      <div
        className="absolute inset-0 rounded-3xl bg-black/20 blur-xl"
        style={{
          transform: `translateZ(-${depth}px) translateX(${depth / 3}px) translateY(${depth / 3}px)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>

      {/* Selection indicator */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: glowColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Star className="w-3 h-3 text-white fill-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Floating Progress Ring
interface FloatingProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const FloatingProgressRing: React.FC<FloatingProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            '0 0 20px rgba(0,229,255,0.3)',
            '0 0 40px rgba(0,229,255,0.6)',
            '0 0 20px rgba(0,229,255,0.3)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#B400FF" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          key={progress}
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
};

// Animated Step Indicator
interface AnimatedStepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const AnimatedStepIndicator: React.FC<AnimatedStepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <motion.div
            className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-all duration-300',
              index <= currentStep
                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                : 'bg-white/10 text-white/50 hover:bg-white/20'
            )}
            onClick={() => onStepClick?.(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow:
                index === currentStep
                  ? '0 0 20px rgba(0,229,255,0.5)'
                  : '0 0 0px rgba(0,229,255,0)',
            }}
          >
            <motion.span
              className="text-sm font-bold"
              animate={{ scale: index === currentStep ? 1.2 : 1 }}
            >
              {index + 1}
            </motion.span>

            {/* Ripple effect for current step */}
            {index === currentStep && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/50"
                animate={{
                  scale: [1, 1.5, 2],
                  opacity: [1, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </motion.div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-gradient-to-r from-white/20 to-white/10 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"
                initial={{ width: '0%' }}
                animate={{ width: index < currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Particle System Background
export const ParticleSystem: React.FC = () => {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; delay: number }>
  >([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/30 to-secondary/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Holographic Button
interface HolographicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
}

export const HolographicButton: React.FC<HolographicButtonProps> = ({
  children,
  onClick,
  disabled = false,

  size = 'md',
  className = '',
  glowIntensity = 'medium',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const glowClasses = {
    low: 'shadow-[0_0_20px_rgba(0,229,255,0.3)]',
    medium: 'shadow-[0_0_30px_rgba(0,229,255,0.5)]',
    high: 'shadow-[0_0_40px_rgba(0,229,255,0.7)]',
  };

  return (
    <motion.button
      className={cn(
        'relative rounded-2xl font-semibold transition-all duration-300 overflow-hidden group',
        'bg-gradient-to-r from-primary via-secondary to-accent',
        'border border-white/20 backdrop-blur-xl',
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className
      )}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={{
        boxShadow: !disabled
          ? [
              glowClasses[glowIntensity],
              'shadow-[0_0_60px_rgba(0,229,255,0.8)]',
              glowClasses[glowIntensity],
            ]
          : glowClasses[glowIntensity],
      }}
      transition={{
        boxShadow: { duration: 2, repeat: Infinity },
        scale: { type: 'spring', stiffness: 400, damping: 10 },
      }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/80 via-secondary/80 to-accent/80"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Holographic shine */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      </div>

      {/* Content */}
      <span className="relative z-10 text-white font-bold flex items-center gap-2">{children}</span>
    </motion.button>
  );
};
