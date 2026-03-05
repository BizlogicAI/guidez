import { supabase } from './supabase';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
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

export async function updateEmail(newEmail: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw new Error(error.message);
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
