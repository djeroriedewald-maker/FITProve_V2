import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'workout' | 'stats' | 'nav' | 'hero';
  glowColor?: 'cyan' | 'purple' | 'orange' | 'green' | 'pink';
  hover?: boolean;
  onClick?: () => void;
  animation?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  glowColor,
  hover = true,
  onClick,
  animation = true,
}) => {
  const baseClasses = 'backdrop-blur-xl border transition-all duration-300 ease-out';

  const variantClasses = {
    default: 'bg-glass-white border-white/10 rounded-2xl p-6',
    workout:
      'bg-gradient-to-br from-glass-white to-transparent border-white/20 rounded-xl p-4 relative overflow-hidden',
    stats:
      'bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-white/20 rounded-xl p-4',
    nav: 'bg-black/30 border-white/10 border-t',
    hero: 'bg-gradient-to-br from-glass-white-heavy via-glass-white to-transparent border-white/30 rounded-3xl p-8',
  };

  const glowClasses = glowColor
    ? {
        cyan: 'shadow-neon-cyan',
        purple: 'shadow-neon-purple',
        orange: 'shadow-neon-orange',
        green: 'shadow-[0_0_20px_rgba(0,255,135,0.5)]',
        pink: 'shadow-[0_0_20px_rgba(255,20,147,0.5)]',
      }[glowColor]
    : '';

  const hoverClasses = hover
    ? 'hover:bg-glass-white-light hover:shadow-glass-lg hover:-translate-y-1 hover:scale-[1.02]'
    : '';

  const Component = animation ? motion.div : 'div';
  const animationProps = animation
    ? {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
        whileHover: hover ? { y: -4, scale: 1.02 } : undefined,
        whileTap: onClick ? { scale: 0.98 } : undefined,
      }
    : {};

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        glowClasses,
        hoverClasses,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...animationProps}
    >
      {variant === 'workout' && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-secondary to-accent animate-pulse" />
        </div>
      )}
      {children}
    </Component>
  );
};

export const GlassButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}> = ({ children, variant = 'primary', size = 'md', className, onClick, disabled, fullWidth }) => {
  const baseClasses =
    'font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-neon-cyan',
    secondary: 'bg-glass-white border border-white/20 text-white hover:bg-glass-white-heavy',
    ghost: 'text-white hover:bg-glass-white-light',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
};
