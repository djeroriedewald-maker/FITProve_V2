import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  glowColor?: 'cyan' | 'purple' | 'orange' | 'green';
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  icon,
  glowColor = 'cyan',
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const glowColors = {
    cyan: 'focus:ring-primary/50 focus:border-primary/50',
    purple: 'focus:ring-secondary/50 focus:border-secondary/50',
    orange: 'focus:ring-accent/50 focus:border-accent/50',
    green: 'focus:ring-green-500/50 focus:border-green-500/50'
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div className="text-white/60">{icon}</div>
          </div>
        )}
        
        <motion.input
          {...props}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-glass-white backdrop-blur-xl',
            'border border-white/20',
            'text-white placeholder-white/50',
            'transition-all duration-300 ease-out',
            'focus:outline-none focus:ring-2',
            glowColors[glowColor],
            icon && 'pl-12',
            error && 'border-red-500/50 ring-red-500/20',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Animated border glow */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl opacity-0 pointer-events-none',
            'ring-2 ring-offset-2 ring-offset-transparent',
            glowColor === 'cyan' && 'ring-primary/30',
            glowColor === 'purple' && 'ring-secondary/30',
            glowColor === 'orange' && 'ring-accent/30',
            glowColor === 'green' && 'ring-green-500/30'
          )}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  glowColor?: 'cyan' | 'purple' | 'orange' | 'green';
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
  label,
  error,
  glowColor = 'cyan',
  className,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const glowColors = {
    cyan: 'focus:ring-primary/50 focus:border-primary/50',
    purple: 'focus:ring-secondary/50 focus:border-secondary/50',
    orange: 'focus:ring-accent/50 focus:border-accent/50',
    green: 'focus:ring-green-500/50 focus:border-green-500/50'
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      
      <div className="relative">
        <motion.textarea
          {...props}
          className={cn(
            'w-full px-4 py-3 rounded-xl min-h-[100px] resize-none',
            'bg-glass-white backdrop-blur-xl',
            'border border-white/20',
            'text-white placeholder-white/50',
            'transition-all duration-300 ease-out',
            'focus:outline-none focus:ring-2',
            glowColors[glowColor],
            error && 'border-red-500/50 ring-red-500/20',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Animated border glow */}
        <motion.div
          className={cn(
            'absolute inset-0 rounded-xl opacity-0 pointer-events-none',
            'ring-2 ring-offset-2 ring-offset-transparent',
            glowColor === 'cyan' && 'ring-primary/30',
            glowColor === 'purple' && 'ring-secondary/30',
            glowColor === 'orange' && 'ring-accent/30',
            glowColor === 'green' && 'ring-green-500/30'
          )}
          animate={{ opacity: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};