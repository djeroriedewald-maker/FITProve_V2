import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Heart, Zap } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'fitness' | 'minimal';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12', 
    lg: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'fitness') {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          {/* Rotating fitness icons */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Dumbbell className={`${sizeClasses[size]} text-primary`} />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 0.5 }}
          >
            <Heart className={`${sizeClasses[size]} text-secondary opacity-60`} />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
          >
            <Zap className={`${sizeClasses[size]} text-accent opacity-40`} />
          </motion.div>

          {/* Pulsing background */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20`}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <motion.p
          className={`${textSizes[size]} text-white/80 font-medium`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        {text && (
          <span className={`${textSizes[size]} text-white/70`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default spinning gradient ring
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className={`${sizeClasses[size]} rounded-full border-4 border-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-clip-border`}
          style={{
            backgroundClip: 'border-box',
            WebkitBackgroundClip: 'border-box',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full bg-gray-900" />
        </motion.div>
        
        {/* Inner pulsing dot */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-secondary"
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      
      <motion.p
        className={`${textSizes[size]} text-white/80 font-medium`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
};

// Full-screen loading overlay
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean; 
  text?: string;
  variant?: LoadingSpinnerProps['variant'];
}> = ({ isLoading, text = 'Loading...', variant = 'fitness' }) => {
  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl rounded-full scale-150" />
        
        <div className="relative bg-glass-white border border-white/10 backdrop-blur-xl rounded-3xl p-8">
          <LoadingSpinner size="lg" variant={variant} text={text} />
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;