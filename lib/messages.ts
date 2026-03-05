import { supabase } from './supabase';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  userId: string;
  username: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export async function fetchConversations(currentUserId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // Group by the other user
  const convMap = new Map<string, { lastMessage: string; lastMessageAt: string; unreadCount: number }>();
  for (const msg of data) {
    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        lastMessage: msg.content,
        lastMessageAt: msg.created_at,
        unreadCount: (!msg.read && msg.receiver_id === currentUserId) ? 1 : 0,
      });
    } else if (!msg.read && msg.receiver_id === currentUserId) {
      convMap.get(otherId)!.unreadCount++;
    }
  }

  const otherIds = [...convMap.keys()];
  if (!otherIds.length) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username')
    .in('user_id', otherIds);

  return otherIds.map((uid) => {
    const conv = convMap.get(uid)!;
    return {
      userId: uid,
      username: profiles?.find((p) => p.user_id === uid)?.username ?? 'member',
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      unreadCount: conv.unreadCount,
    };
  });
}

export async function fetchThread(currentUserId: string, otherUserId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
    )
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data as Message[];
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .insert({ sender_id: senderId, receiver_id: receiverId, content });
  if (error) throw new Error(error.message);
}

export async function markThreadAsRead(currentUserId: string, otherUserId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', currentUserId)
    .eq('read', false);
}

export function subscribeToMessages(currentUserId: string, callback: () => void) {
  return supabase
    .channel(`messages-${currentUserId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUserId}` },
      callback
    )
    .subscribe();
}
