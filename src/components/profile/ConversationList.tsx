import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { UserProfile } from '../../types/profile.types';

interface Conversation {
  user: UserProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const ConversationList: React.FC<{ onSelect: (user: UserProfile) => void; selectedUserId?: string }> = ({ onSelect, selectedUserId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadConversations();
    // eslint-disable-next-line
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    // Get all users the current user has messaged or received messages from
    const { data: messages } = await supabase
      .from('direct_messages')
      .select('sender_id, recipient_id, message, sent_at, read_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id})`)
      .order('sent_at', { ascending: false });
    if (!messages) return setLoading(false);

    // Build a map of userId -> last message
    const convoMap = new Map<string, Conversation>();
    for (const msg of messages) {
      const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      if (!convoMap.has(otherUserId)) {
        convoMap.set(otherUserId, {
          user: { id: otherUserId } as UserProfile, // Will fetch details below
          lastMessage: msg.message,
          lastMessageTime: msg.sent_at,
          unreadCount: !msg.read_at && msg.recipient_id === user.id ? 1 : 0,
        });
      } else if (!msg.read_at && msg.recipient_id === user.id) {
        convoMap.get(otherUserId)!.unreadCount += 1;
      }
    }
    // Fetch user profiles for all conversation partners
    const userIds = Array.from(convoMap.keys());
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .in('id', userIds);
      profiles?.forEach((profile: any) => {
        if (convoMap.has(profile.id)) {
          convoMap.get(profile.id)!.user = {
            id: profile.id,
            displayName: profile.display_name,
            username: profile.username,
            avatarUrl: profile.avatar_url,
          } as UserProfile;
        }
      });
    }
    setConversations(Array.from(convoMap.values()));
    setLoading(false);
  };

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <h3 className="p-4 text-lg font-bold border-b border-gray-200 dark:border-gray-800">Inbox</h3>
      {loading ? (
        <div className="p-4 text-gray-400">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-gray-400">No conversations yet.</div>
      ) : (
        <ul>
          {conversations.map(convo => (
            <li
              key={convo.user.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition ${selectedUserId === convo.user.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              onClick={() => onSelect(convo.user)}
            >
              <img
                src={convo.user.avatarUrl || '/images/default-avatar.png'}
                alt={convo.user.displayName || convo.user.username}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{convo.user.displayName || convo.user.username}</div>
                <div className="text-xs text-gray-500 truncate">{convo.lastMessage}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400">{new Date(convo.lastMessageTime).toLocaleTimeString()}</span>
                {convo.unreadCount > 0 && (
                  <span className="mt-1 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">{convo.unreadCount}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
