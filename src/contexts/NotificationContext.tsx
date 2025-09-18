import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Notification } from '../types/notification.types';
import { subscribeToNotifications, getNotifications, getUnreadNotificationCount } from '../lib/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  reloadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const subscriptionRef = useRef<any>(null);

  const reloadNotifications = async () => {
    if (!user) return;
    const fetched = await getNotifications(20);
    setNotifications(fetched);
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  useEffect(() => {
    if (!user) return;
    reloadNotifications();
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    subscriptionRef.current = subscribeToNotifications(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setNotifications, setUnreadCount, reloadNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
}
