import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Heart, MessageCircle, Trophy, User } from 'lucide-react';
import { Notification } from '../../types/notification.types';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead
} from '../../lib/notifications';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationDropdownProps {
  className?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'achievement':
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'follow':
      return <User className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
        notification.read 
          ? 'border-transparent bg-white' 
          : 'border-blue-500 bg-blue-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {notification.from_user && (
          <div className="flex-shrink-0">
            <img
              src={notification.from_user.avatar_url || '/default-avatar.svg'}
              alt={notification.from_user.name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${
              notification.read ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          
          <p className={`text-sm mt-1 ${
            notification.read ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: nl 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const { notifications, unreadCount, setNotifications, setUnreadCount, reloadNotifications } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      reloadNotifications();
    }
  }, [user, isOpen, reloadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Notification state and reload now come from NotificationContext

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            />
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 60 }}
              exit={{ opacity: 0, scale: 0.95, y: -40 }}
              className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificaties</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Alles markeren als gelezen
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 py-2">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Notificaties laden...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Geen notificaties</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Alle notificaties bekijken
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};