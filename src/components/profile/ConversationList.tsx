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
    <div className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-lg rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary to-purple-600">
        <span className="text-xl font-extrabold text-white tracking-wide">FITProve</span>
        <button className="text-white opacity-80 hover:opacity-100 focus:outline-none">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
        </button>
      </div>
      {loading ? (
        <div className="p-6 text-gray-400 text-center">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="p-6 text-gray-400 text-center">No conversations yet.</div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {conversations.map(convo => (
            <li
              key={convo.user.id}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition group ${selectedUserId === convo.user.id ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              onClick={() => onSelect(convo.user)}
            >
              <img
                src={convo.user.avatarUrl || '/images/default-avatar.png'}
                alt={convo.user.displayName || convo.user.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white text-base truncate">{convo.user.displayName || convo.user.username}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">{convo.lastMessage}</div>
              </div>
              <div className="flex flex-col items-end min-w-[60px]">
                <span className="text-xs text-gray-400 font-medium">
                  {(() => {
                    const date = new Date(convo.lastMessageTime);
                    const now = new Date();
                    if (date.toDateString() === now.toDateString()) {
                      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    } else if (date.getFullYear() === now.getFullYear()) {
                      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    } else {
                      return date.toLocaleDateString();
                    }
                  })()}
                </span>
                {convo.unreadCount > 0 && (
                  <span className="mt-1 bg-primary text-white text-xs rounded-full px-2 py-0.5 font-semibold shadow">{convo.unreadCount}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
