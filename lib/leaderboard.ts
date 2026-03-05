import { supabase } from './supabase';

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  sobriety_date: string | null;
  days_sober: number;
}

export interface Milestone {
  label: string;
  days: number;
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  { label: '1 Day',    days: 1,    emoji: '🌱' },
  { label: '1 Week',   days: 7,    emoji: '🌟' },
  { label: '30 Days',  days: 30,   emoji: '💪' },
  { label: '60 Days',  days: 60,   emoji: '🔥' },
  { label: '90 Days',  days: 90,   emoji: '⭐' },
  { label: '6 Months', days: 180,  emoji: '🏅' },
  { label: '1 Year',   days: 365,  emoji: '🏆' },
  { label: '2 Years',  days: 730,  emoji: '💎' },
  { label: '5 Years',  days: 1825, emoji: '👑' },
];

export function getDaysSober(sobrietyDate: string): number {
  const start = new Date(sobrietyDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getCurrentMilestone(days: number): Milestone | null {
  const achieved = MILESTONES.filter((m) => days >= m.days);
  return achieved.length > 0 ? achieved[achieved.length - 1] : null;
}

export function getNextMilestone(days: number): Milestone | null {
  return MILESTONES.find((m) => days < m.days) ?? null;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, username, avatar_url, sobriety_date')
    .not('sobriety_date', 'is', null)
    .order('sobriety_date', { ascending: true });

  if (error || !data) return [];

  return data
    .map((row) => ({
      user_id: row.user_id,
      username: row.username || `user_${row.user_id.slice(0, 6)}`,
      avatar_url: row.avatar_url ?? null,
      sobriety_date: row.sobriety_date,
      days_sober: getDaysSober(row.sobriety_date),
    }))
    .sort((a, b) => b.days_sober - a.days_sober);
}

export interface EngagementEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  sobriety_date: string | null;
  post_count: number;
  comment_count: number;
  total: number;
}

export async function fetchEngagementLeaderboard(): Promise<EngagementEntry[]> {
  const [profilesResult, postsResult, commentsResult] = await Promise.all([
    supabase.from('profiles').select('user_id, username, avatar_url, sobriety_date'),
    supabase.from('posts').select('user_id'),
    supabase.from('comments').select('user_id'),
  ]);

  const profiles = profilesResult.data ?? [];
  const posts = postsResult.data ?? [];
  const comments = commentsResult.data ?? [];

  const postCounts: Record<string, number> = {};
  for (const p of posts) postCounts[p.user_id] = (postCounts[p.user_id] ?? 0) + 1;

  const commentCounts: Record<string, number> = {};
  for (const c of comments) commentCounts[c.user_id] = (commentCounts[c.user_id] ?? 0) + 1;

  return profiles
    .map((prof) => ({
      user_id: prof.user_id,
      username: prof.username || `user_${prof.user_id.slice(0, 6)}`,
      avatar_url: prof.avatar_url ?? null,
      sobriety_date: prof.sobriety_date ?? null,
      post_count: postCounts[prof.user_id] ?? 0,
      comment_count: commentCounts[prof.user_id] ?? 0,
      total: (postCounts[prof.user_id] ?? 0) + (commentCounts[prof.user_id] ?? 0),
    }))
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total);
}
