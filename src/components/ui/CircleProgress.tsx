import { motion } from 'framer-motion';

interface CircleProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
}

export function CircleProgress({ 
  progress, 
  size = 160, 
  strokeWidth = 8,
  className = "",
  showValue = true
}: CircleProgressProps) {
  const center = size / 2;
  const radius = center - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference * (1 - progress / 100);

  return (
    <div className={`relative aspect-square ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse-slow" />
        
        {/* Progress circle */}
        <svg 
          className="w-full h-full transform -rotate-90 relative z-10" 
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            className="text-gray-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
          />
          
          {/* Progress circle */}
          <motion.circle
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full" />
            <motion.span 
              className="relative z-10 text-2xl sm:text-3xl font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              {progress}%
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}