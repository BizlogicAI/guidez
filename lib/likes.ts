import { supabase } from './supabase';

export async function toggleLike(postId: string, userId: string, isLiked: boolean): Promise<void> {
  if (isLiked) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId });
    if (error) throw new Error(error.message);
  }
}
