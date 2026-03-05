import { supabase } from './supabase';

export interface FeedPost {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
  sobriety_date: string | null;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export async function fetchFeed(currentUserId: string, limit = 20, offset = 0): Promise<FeedPost[]> {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, likes(id, user_id), comments(id)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !posts) return [];

  const userIds = [...new Set(posts.map((p) => p.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username, avatar_url, sobriety_date')
    .in('user_id', userIds);

  return posts.map((p) => {
    const prof = profiles?.find((pr) => pr.user_id === p.user_id);
    return {
      id: p.id,
      user_id: p.user_id,
      content: p.content,
      created_at: p.created_at,
      username: prof?.username ?? `user_${p.user_id.slice(0, 6)}`,
      avatar_url: prof?.avatar_url ?? null,
      sobriety_date: prof?.sobriety_date ?? null,
      like_count: p.likes?.length ?? 0,
      comment_count: p.comments?.length ?? 0,
      is_liked: p.likes?.some((l: { user_id: string }) => l.user_id === currentUserId) ?? false,
    };
  });
}

export async function fetchPost(postId: string, currentUserId: string): Promise<FeedPost | null> {
  const { data: p, error } = await supabase
    .from('posts')
    .select('*, likes(id, user_id), comments(id)')
    .eq('id', postId)
    .single();

  if (error || !p) return null;

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username, avatar_url, sobriety_date')
    .eq('user_id', p.user_id);

  const prof = profiles?.[0];
  return {
    id: p.id,
    user_id: p.user_id,
    content: p.content,
    created_at: p.created_at,
    username: prof?.username ?? `user_${p.user_id.slice(0, 6)}`,
    avatar_url: prof?.avatar_url ?? null,
    sobriety_date: prof?.sobriety_date ?? null,
    like_count: p.likes?.length ?? 0,
    comment_count: p.comments?.length ?? 0,
    is_liked: p.likes?.some((l: { user_id: string }) => l.user_id === currentUserId) ?? false,
  };
}

export async function createPost(userId: string, content: string): Promise<void> {
  const { error } = await supabase.from('posts').insert({ user_id: userId, content });
  if (error) throw new Error(error.message);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw new Error(error.message);
}

export function subscribeToPosts(callback: () => void) {
  return supabase
    .channel('posts-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, callback)
    .subscribe();
}
