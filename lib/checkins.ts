import { supabase } from './supabase';

export type Mood = 'struggling' | 'low' | 'okay' | 'good' | 'great';

export interface MoodOption {
  value: Mood;
  emoji: string;
  label: string;
}

export const MOODS: MoodOption[] = [
  { value: 'struggling', emoji: '😔', label: 'Struggling' },
  { value: 'low',        emoji: '😕', label: 'Low' },
  { value: 'okay',       emoji: '😐', label: 'Okay' },
  { value: 'good',       emoji: '🙂', label: 'Good' },
  { value: 'great',      emoji: '🌟', label: 'Great' },
];

export interface DailyCheckin {
  id: string;
  user_id: string;
  check_in_date: string;
  mood: Mood;
  created_at: string;
}

export async function fetchTodayCheckin(userId: string): Promise<DailyCheckin | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('check_in_date', today)
    .maybeSingle();

  if (error || !data) return null;
  return data as DailyCheckin;
}

export async function submitCheckin(userId: string, mood: Mood): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase
    .from('daily_checkins')
    .upsert({ user_id: userId, check_in_date: today, mood }, { onConflict: 'user_id,check_in_date' });

  if (error) throw new Error(error.message);
}
