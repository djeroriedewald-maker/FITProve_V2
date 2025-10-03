import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Trophy, Users, Dumbbell, Star, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface NotificationData {
  id: string;
  type: 'achievement' | 'social' | 'workout' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  isRead?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCardProps {
  notification: NotificationData;
  onRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onAction?: (notification: NotificationData) => void;
  className?: string;
}

const notificationIcons = {
  achievement: Trophy,
  social: Users,
  workout: Dumbbell,
  general: Bell,
};

const notificationColors = {
  achievement: {
    bg: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-400/20',
  },
  social: {
    bg: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-400/20',
  },
  workout: {
    bg: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    glow: 'shadow-green-400/20',
  },
  general: {
    bg: 'from-gray-500/20 to-gray-600/20',
    border: 'border-gray-500/30',
    icon: 'text-gray-400',
    glow: 'shadow-gray-400/20',
  },
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onRead,
  onDismiss,
  onAction,
  className,
}) => {
  const Icon = notificationIcons[notification.type];
  const colors = notificationColors[notification.type];
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleClick = () => {
    if (!notification.isRead && onRead) {
      onRead(notification.id);
    }
    if (onAction) {
      onAction(notification);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl cursor-pointer group transition-all duration-300',
        `bg-gradient-to-br ${colors.bg}`,
        colors.border,
        !notification.isRead && 'ring-2 ring-white/20',
        colors.glow,
        className
      )}
      onClick={handleClick}
    >
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <motion.div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center',
              colors.icon
            )}
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm truncate">
                  {notification.title}
                </h4>
                <p className="text-white/70 text-sm mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-white/50 text-xs">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                  {!notification.isRead && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-primary text-xs font-medium">New</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              {onDismiss && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notification.id);
                  }}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3 text-white/70" />
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Action indicator */}
        {notification.actionUrl && (
          <motion.div
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ x: 2 }}
          >
            <div className="flex items-center space-x-1 text-xs text-primary">
              <span>Tap to view</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Notification Badge for navigation
export const NotificationBadge: React.FC<{
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ count, size = 'md', className }) => {
  if (count === 0) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg',
        sizeClasses[size],
        className
      )}
    >
      <motion.span
        key={count}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    </motion.div>
  );
};