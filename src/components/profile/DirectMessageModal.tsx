import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { sendDirectMessage, fetchDirectMessages, DirectMessage } from '../../lib/direct-messages';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
  recipientAvatarUrl?: string;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
  recipientAvatarUrl,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages initially and set up real-time subscription
  // Helper to get a unique channel name for both users
  const getChannelName = (id1: string, id2: string) => {
    return `dm-realtime-${[id1, id2].sort().join('-')}`;
  };

  useEffect(() => {
    if (isOpen && user) {
      loadMessages();

      // Subscribe to new direct messages for this conversation (shared channel for both users)
      const channelName = getChannelName(user.id, recipientId);
      const channel = supabase.channel(channelName).on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))`,
        },
        (payload) => {
          // Only add if message is for this conversation
          const msg = payload.new;
          if (
            (msg.sender_id === user.id && msg.recipient_id === recipientId) ||
            (msg.sender_id === recipientId && msg.recipient_id === user.id)
          ) {
            setMessages((prev) => [
              ...prev,
              {
                id: msg.id,
                senderId: msg.sender_id,
                recipientId: msg.recipient_id,
                message: msg.message,
                sentAt: msg.sent_at,
                readAt: msg.read_at,
              },
            ]);
            scrollToBottom();
          }
        }
      );
      channel.subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
    // eslint-disable-next-line
  }, [isOpen, user, recipientId]);

  const loadMessages = async () => {
    if (!user) return;
    setLoading(true);
    const msgs = await fetchDirectMessages(user.id, recipientId);
    setMessages(msgs);
    setLoading(false);
    scrollToBottom();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    setSending(true);
    const result = await sendDirectMessage(user.id, recipientId, input.trim());
    if (result.success) {
      setInput('');
      await loadMessages();
    } else {
      alert(result.error || 'Failed to send message');
    }
    setSending(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden" style={{ minHeight: 500, maxHeight: '90vh' }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-[#1a2233]">
          <button onClick={onClose} className="p-1 mr-1 text-white hover:bg-[#26304a] rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            {recipientAvatarUrl ? (
              <img src={recipientAvatarUrl} alt={recipientName} className="w-10 h-10 rounded-full object-cover bg-white border-4 border-white shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white border-4 border-white shadow-md" />
            )}
            <span className="font-semibold text-white text-lg">{recipientName}</span>
          </div>
        </div>
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 bg-white" style={{ minHeight: 0 }}>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            messages.map((msg) => {
              const isUser = user && msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`relative px-4 py-2 rounded-2xl text-base max-w-[75%] whitespace-pre-line ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                    style={{ borderBottomRightRadius: isUser ? 8 : 24, borderBottomLeftRadius: isUser ? 24 : 8 }}
                  >
                    {msg.message}
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input area */}
        <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t bg-white">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
            placeholder="Message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition"
            disabled={sending || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
