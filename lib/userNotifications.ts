import { supabase } from './supabase';

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'message';
  actor_id: string;
  actor_username: string;
  post_id: string | null;
  read: boolean;
  created_at: string;
}

export async function createNotification(data: {
  userId: string;
  type: 'like' | 'comment' | 'message';
  actorId: string;
  actorUsername: string;
  postId?: string;
}): Promise<void> {
  if (data.userId === data.actorId) return;
  await supabase.from('notifications').insert({
    user_id: data.userId,
    type: data.type,
    actor_id: data.actorId,
    actor_username: data.actorUsername,
    post_id: data.postId ?? null,
  });
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data as AppNotification[];
}

export async function markAllRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);
  return count ?? 0;
}

export function subscribeToNotifications(
  userId: string,
  callback: (notification: AppNotification) => void
) {
  return supabase
    .channel(`notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new as AppNotification)
    )
    .subscribe();
}
