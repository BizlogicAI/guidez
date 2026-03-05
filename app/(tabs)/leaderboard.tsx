import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../lib/context/AuthContext';
import { ProtectedScreen } from '../../components/ProtectedScreen';
import {
  fetchEngagementLeaderboard,
  getCurrentMilestone,
  getDaysSober,
  type EngagementEntry,
} from '../../lib/leaderboard';
import { PostAvatar } from '../../components/PostAvatar';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankEmoji}>🥇</Text>;
  if (rank === 2) return <Text style={styles.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={styles.rankEmoji}>🥉</Text>;
  return <Text style={styles.rankNumber}>#{rank}</Text>;
}

function EntryRow({
  entry,
  rank,
  isCurrentUser,
}: {
  entry: EngagementEntry;
  rank: number;
  isCurrentUser: boolean;
}) {
  const milestoneBadge = entry.sobriety_date
    ? (getCurrentMilestone(getDaysSober(entry.sobriety_date))?.emoji ?? null)
    : null;

  return (
    <View style={[styles.row, isCurrentUser && styles.rowHighlighted]}>
      <View style={styles.rankCol}>
        <RankBadge rank={rank} />
      </View>

      <PostAvatar
        username={entry.username}
        avatarUrl={entry.avatar_url}
        milestoneBadge={milestoneBadge}
        size={44}
      />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>{entry.username}</Text>
          {isCurrentUser && <Text style={styles.youBadge}>You</Text>}
        </View>
        <Text style={styles.statsText}>
          {entry.post_count} {entry.post_count === 1 ? 'post' : 'posts'} · {entry.comment_count} {entry.comment_count === 1 ? 'comment' : 'comments'}
        </Text>
      </View>

      <View style={styles.totalBadge}>
        <Text style={styles.totalNumber}>{entry.total}</Text>
        <Text style={styles.totalLabel}>points</Text>
      </View>
    </View>
  );
}

function LeaderboardContent() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<EngagementEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await fetchEngagementLeaderboard();
    setEntries(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Stars</Text>
        <Text style={styles.subtitle}>Most supportive members · posts + comments</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🌟</Text>
          <Text style={styles.emptyTitle}>No activity yet</Text>
          <Text style={styles.emptyText}>
            Post and comment in the Growth Feed to earn your spot here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
          }
          renderItem={({ item, index }) => (
            <EntryRow
              entry={item}
              rank={index + 1}
              isCurrentUser={item.user_id === user?.id}
            />
          )}
        />
      )}
    </View>
  );
}

export default function LeaderboardScreen() {
  return (
    <ProtectedScreen message="Sign in to see the community leaderboard and earn your place.">
      <LeaderboardContent />
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontFamily: Fonts.extraBold, color: Colors.textPrimary },
  subtitle: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textMuted, marginTop: 2 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.bold, color: Colors.textPrimary },
  emptyText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textMuted, textAlign: 'center' },
  list: { paddingHorizontal: 14, paddingBottom: 20, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  rowHighlighted: { borderWidth: 1.5, borderColor: Colors.teal },
  rankCol: { width: 36, alignItems: 'center' },
  rankEmoji: { fontSize: 24 },
  rankNumber: { fontSize: 14, fontFamily: Fonts.bold, color: Colors.textMuted },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.textPrimary, flexShrink: 1 },
  youBadge: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.bgDark,
    backgroundColor: Colors.teal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsText: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textSecondary },
  totalBadge: { alignItems: 'center', gap: 1 },
  totalNumber: { fontSize: 20, fontFamily: Fonts.extraBold, color: Colors.teal },
  totalLabel: { fontSize: 9, fontFamily: Fonts.semiBold, color: Colors.textMuted },
});
