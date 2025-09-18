import { supabase } from './supabase';

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  sentAt: string;
  readAt?: string | null;
}

// Check if two users mutually follow each other and both allow DMs
export async function canSendDirectMessage(senderId: string, recipientId: string): Promise<boolean> {
  // Check mutual follow
  const { data: follows1 } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', senderId)
    .eq('followed_id', recipientId)
    .maybeSingle();
  const { data: follows2 } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', recipientId)
    .eq('followed_id', senderId)
    .maybeSingle();
  if (!follows1 || !follows2) return false;

  // Check both allow DMs
  const { data: senderProfile } = await supabase
    .from('profiles')
    .select('allow_direct_messages')
    .eq('id', senderId)
    .maybeSingle();
  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('allow_direct_messages')
    .eq('id', recipientId)
    .maybeSingle();
  return !!(senderProfile?.allow_direct_messages && recipientProfile?.allow_direct_messages);
}

// Send a direct message
export async function sendDirectMessage(senderId: string, recipientId: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!(await canSendDirectMessage(senderId, recipientId))) {
    return { success: false, error: 'You cannot send a message to this user.' };
  }
  const { error } = await supabase
    .from('direct_messages')
    .insert({ sender_id: senderId, recipient_id: recipientId, message });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Fetch direct messages between two users
export async function fetchDirectMessages(userId: string, otherUserId: string): Promise<DirectMessage[]> {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('sent_at', { ascending: true });
  if (error) return [];
  return (data || []).map((msg: any) => ({
    id: msg.id,
    senderId: msg.sender_id,
    recipientId: msg.recipient_id,
    message: msg.message,
    sentAt: msg.sent_at,
    readAt: msg.read_at,
  }));
}
