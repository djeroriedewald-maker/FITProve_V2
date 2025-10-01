import React from 'react';
import { motion } from 'framer-motion';

// 3D Floating Elements Component
export const FloatingElements: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Geometric Shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/30 rounded-3xl blur-sm"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/30 rounded-full blur-sm"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      <motion.div
        className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/30 rounded-xl blur-sm"
        animate={{
          y: [-15, 15, -15],
          x: [-8, 8, -8],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 8,
        }}
      />

      {/* Particle System */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// Advanced Glass Morphism Card with 3D Effects
interface Glass3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  depth?: number;
}

export const Glass3DCard: React.FC<Glass3DCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
  depth = 10,
}) => {
  const intensityClasses = {
    low: 'backdrop-blur-md bg-white/5 border-white/10',
    medium: 'backdrop-blur-xl bg-white/10 border-white/20',
    high: 'backdrop-blur-2xl bg-white/15 border-white/30',
  };

  return (
    <motion.div
      className={`
        relative rounded-2xl border transition-all duration-500 
        ${intensityClasses[intensity]} 
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
      whileHover={{
        rotateX: depth / 2,
        rotateY: depth,
        scale: 1.02,
        z: 50,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* 3D Shadow Layer */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/20 to-transparent blur-xl opacity-50"
        style={{
          transform: `translateZ(-${depth}px) translateX(${depth / 2}px) translateY(${depth / 2}px)`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 p-6">{children}</div>

      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%', rotate: 25 }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};

// Parallax Glass Container
interface ParallaxGlassProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxGlass: React.FC<ParallaxGlassProps> = ({
  children,
  speed = 0.5,
  className = '',
}) => {
  const [offsetY, setOffsetY] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={className} style={{ transform: `translateY(${offsetY * speed}px)` }}>
      {children}
    </div>
  );
};

// Morphing Blob Background
export const MorphingBlob: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="blobGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="blobGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        <motion.path
          fill="url(#blobGradient1)"
          animate={{
            d: [
              'M200,300 Q300,200 400,300 T600,300 Q700,400 600,500 T400,500 Q300,400 200,300 Z',
              'M250,250 Q350,150 450,250 T650,250 Q750,350 650,450 T450,450 Q350,350 250,250 Z',
              'M200,300 Q300,200 400,300 T600,300 Q700,400 600,500 T400,500 Q300,400 200,300 Z',
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.path
          fill="url(#blobGradient2)"
          animate={{
            d: [
              'M700,200 Q800,100 900,200 T1100,200 Q1200,300 1100,400 T900,400 Q800,300 700,200 Z',
              'M650,150 Q750,50 850,150 T1050,150 Q1150,250 1050,350 T850,350 Q750,250 650,150 Z',
              'M700,200 Q800,100 900,200 T1100,200 Q1200,300 1100,400 T900,400 Q800,300 700,200 Z',
            ],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
        />
      </svg>
    </div>
  );
};

// Interactive Glow Effect
interface GlowEffectProps {
  children: React.ReactNode;
  color?: 'cyan' | 'purple' | 'orange' | 'green' | 'pink';
  intensity?: 'low' | 'medium' | 'high';
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  children,
  color = 'cyan',
  intensity = 'medium',
}) => {
  const glowColors = {
    cyan: 'shadow-[0_0_30px_rgba(6,182,212,0.6)]',
    purple: 'shadow-[0_0_30px_rgba(139,92,246,0.6)]',
    orange: 'shadow-[0_0_30px_rgba(249,115,22,0.6)]',
    green: 'shadow-[0_0_30px_rgba(34,197,94,0.6)]',
    pink: 'shadow-[0_0_30px_rgba(236,72,153,0.6)]',
  };

  const intensityMultiplier = {
    low: 0.5,
    medium: 1,
    high: 1.5,
  };

  return (
    <motion.div
      className="relative"
      whileHover={{
        filter: `drop-shadow(0 0 ${20 * intensityMultiplier[intensity]}px rgba(255,255,255,0.3))`,
      }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${glowColors[color]} transition-all duration-300`}>{children}</div>
    </motion.div>
  );
};
