import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Dumbbell, Users, Calendar, Target, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  path?: string;
  action?: () => void;
}

interface FloatingActionMenuProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const quickActions: QuickAction[] = [
  {
    id: 'workout',
    label: 'Start Workout',
    icon: Dumbbell,
    color: 'from-primary to-cyan-500',
    path: '/modules/workout',
  },
  {
    id: 'create',
    label: 'Create Workout',
    icon: Target,
    color: 'from-secondary to-purple-500',
    path: '/modules/workout/create',
  },
  {
    id: 'community',
    label: 'Join Challenge',
    icon: Users,
    color: 'from-accent to-orange-500',
    path: '/community',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    path: '/planner',
  },
  {
    id: 'recovery',
    label: 'Recovery Mode',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    path: '/modules/recovery',
  },
];

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({
  className,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6', 
    'top-right': 'top-24 right-6',
    'top-left': 'top-24 left-6',
  };

  const menuDirection = position.includes('bottom') ? 'up' : 'down';
  const actionPositions = position.includes('bottom') 
    ? quickActions.map((_, i) => ({ y: -(70 * (i + 1)) }))
    : quickActions.map((_, i) => ({ y: 70 * (i + 1) }));

  const handleActionClick = (action: QuickAction) => {
    setIsOpen(false);
    
    if (action.action) {
      action.action();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className={cn(
      'fixed z-50',
      positionClasses[position],
      className
    )}>
      {/* Action Items */}
      <AnimatePresence>
        {isOpen && quickActions.map((action, index) => {
          const Icon = action.icon;
          const position = actionPositions[index];
          
          return (
            <motion.div
              key={action.id}
              initial={{ 
                opacity: 0, 
                scale: 0.5, 
                y: 0,
                x: position.x || 0 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: position.y,
                x: position.x || 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5, 
                y: 0,
                x: position.x || 0 
              }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 25,
                delay: index * 0.1 
              }}
              className="absolute bottom-0 right-0"
            >
              <motion.button
                onClick={() => handleActionClick(action)}
                className={cn(
                  'relative w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg backdrop-blur-xl border border-white/20 group overflow-hidden',
                  `bg-gradient-to-br ${action.color}`
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* Glow effect */}
                <div className={cn(
                  'absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity blur-md',
                  `bg-gradient-to-br ${action.color}`
                )} />
                
                {/* Icon */}
                <Icon className="w-5 h-5 relative z-10" />
                
                {/* Ripple effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/30"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                />
              </motion.button>

              {/* Label */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className="absolute right-14 top-1/2 transform -translate-y-1/2 whitespace-nowrap"
              >
                <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-medium">{action.label}</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl group overflow-hidden',
          'bg-gradient-to-br from-primary via-secondary to-accent',
          'border border-white/30 backdrop-blur-xl'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/50 via-secondary/50 to-accent/50 rounded-full"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.3, 0.7] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
            className="relative z-10"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};