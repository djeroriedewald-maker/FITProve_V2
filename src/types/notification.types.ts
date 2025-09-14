export type NotificationType = 'like' | 'comment' | 'mention' | 'follow' | 'achievement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
  post_id?: string | null;
  comment_id?: string | null;
  from_user_id?: string | null;
  // Joined data
  from_user?: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  };
}

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  post_id?: string;
  comment_id?: string;
  from_user_id?: string;
}