import { supabase } from './supabase';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
  sobriety_date: string | null;
  like_count: number;
  is_liked: boolean;
}

export async function fetchComments(postId: string, currentUserId: string): Promise<Comment[]> {
  const { data: rows, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !rows || rows.length === 0) return [];

  const commentIds = rows.map((r) => r.id);
  const userIds = [...new Set(rows.map((r) => r.user_id))];

  const [profilesResult, allLikesResult, myLikesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, username, avatar_url, sobriety_date')
      .in('user_id', userIds),
    supabase
      .from('comment_likes')
      .select('comment_id')
      .in('comment_id', commentIds),
    currentUserId
      ? supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', currentUserId)
          .in('comment_id', commentIds)
      : Promise.resolve({ data: [] as { comment_id: string }[] }),
  ]);

  const profiles = profilesResult.data ?? [];
  const allLikes = allLikesResult.data ?? [];
  const myLikedIds = new Set((myLikesResult.data ?? []).map((l) => l.comment_id));

  return rows.map((r) => {
    const prof = profiles.find((p) => p.user_id === r.user_id);
    const likeCount = allLikes.filter((l) => l.comment_id === r.id).length;
    return {
      id: r.id,
      user_id: r.user_id,
      post_id: r.post_id,
      content: r.content,
      created_at: r.created_at,
      username: prof?.username || `user_${r.user_id.slice(0, 6)}`,
      avatar_url: prof?.avatar_url ?? null,
      sobriety_date: prof?.sobriety_date ?? null,
      like_count: likeCount,
      is_liked: myLikedIds.has(r.id),
    };
  });
}

export async function createComment(postId: string, userId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content });
  if (error) throw new Error(error.message);
}

export async function toggleCommentLike(
  commentId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<void> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('comment_likes')
      .insert({ comment_id: commentId, user_id: userId });
    if (error) throw new Error(error.message);
  }
}

export function subscribeToComments(postId: string, callback: () => void) {
  return supabase
    .channel(`comments-${postId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
      callback
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'comment_likes' },
      callback
    )
    .subscribe();
}
