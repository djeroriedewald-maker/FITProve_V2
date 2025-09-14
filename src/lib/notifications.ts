import { supabase } from './supabase';
import { Notification, CreateNotificationData, NotificationType } from '../types/notification.types';

export async function getNotifications(limit: number = 20): Promise<Notification[]> {
  try {
    // Get notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (notificationsError) throw notificationsError;
    if (!notifications || notifications.length === 0) return [];

    // Get unique from_user_ids
    const fromUserIds = [...new Set(notifications.map(n => n.from_user_id).filter(Boolean))] as string[];
    
    // Get user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', fromUserIds);

    if (profilesError) throw profilesError;

    // Create profile lookup map
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Map notifications with user data
    const mappedNotifications: Notification[] = notifications.map(notification => {
      const fromUser = notification.from_user_id ? profileMap.get(notification.from_user_id) : undefined;
      
      return {
        ...notification,
        data: notification.data as Record<string, any>,
        type: notification.type as NotificationType,
        from_user: fromUser ? {
          id: fromUser.id,
          name: fromUser.name,
          avatar_url: fromUser.avatar_url
        } : undefined
      };
    });

    return mappedNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count');
    
    if (error) throw error;
    
    return data || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('mark_notification_read', {
      notification_id: notificationId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    const { error } = await supabase.rpc('mark_all_notifications_read');

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

export async function createNotification(data: CreateNotificationData): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_notification', {
      p_user_id: data.user_id,
      p_type: data.type,
      p_title: data.title,
      p_message: data.message,
      p_data: data.data || {},
      p_post_id: data.post_id || undefined,
      p_comment_id: data.comment_id || undefined,
      p_from_user_id: data.from_user_id || undefined
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

// Subscribe to real-time notifications
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return subscription;
}