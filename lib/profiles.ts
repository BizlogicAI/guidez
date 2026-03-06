import { supabase } from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  sobriety_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function createProfile(userId: string, username: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, username });

  if (error) throw new Error(error.message);
}

export async function checkUsernameAvailability(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  let query = supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username.toLowerCase().trim());

  if (excludeUserId) {
    query = query.neq('user_id', excludeUserId);
  }

  const { data } = await query;
  return !data || data.length === 0;
}

export async function updateUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ username: username.toLowerCase().trim(), updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const rawExt = localUri.split('.').pop()?.split('?')[0]?.toLowerCase() ?? '';
  const ext = ALLOWED_IMAGE_EXTENSIONS.includes(rawExt as typeof ALLOWED_IMAGE_EXTENSIONS[number])
    ? rawExt
    : 'jpg';

  const response = await fetch(localUri);
  const blob = await response.blob();

  if (blob.size > MAX_AVATAR_BYTES) {
    throw new Error('Image must be smaller than 5 MB.');
  }

  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}` });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function updateAvatarUrl(userId: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
}

export async function updateEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function updateSobrietyDate(userId: string, date: string | null): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ sobriety_date: date, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
