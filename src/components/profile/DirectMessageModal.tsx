import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { sendDirectMessage, fetchDirectMessages, DirectMessage } from '../../lib/direct-messages';
import { useAuth } from '../../contexts/AuthContext';

interface DirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

export const DirectMessageModal: React.FC<DirectMessageModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages initially and set up real-time subscription
  useEffect(() => {
    if (isOpen && user) {
      loadMessages();

      // Subscribe to new direct messages for this conversation
      const channel = supabase.channel(`dm-realtime-${user.id}-${recipientId}`).on(
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
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Chat with {recipientName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto mb-2 max-h-80 border rounded p-2 bg-gray-50 dark:bg-gray-800">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 flex ${user && msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-xs ${user && msg.senderId === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}
                >
                  {msg.message}
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg"
            disabled={sending || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
