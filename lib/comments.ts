import { supabase } from './supabase';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  username: string;
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data: rows, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !rows) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username')
    .in('user_id', userIds);

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    post_id: r.post_id,
    content: r.content,
    created_at: r.created_at,
    username: profiles?.find((p) => p.user_id === r.user_id)?.username ?? 'member',
  }));
}

export async function createComment(postId: string, userId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content });
  if (error) throw new Error(error.message);
}

export function subscribeToComments(postId: string, callback: () => void) {
  return supabase
    .channel(`comments-${postId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
      callback
    )
    .subscribe();
}
