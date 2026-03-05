import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/context/AuthContext';
import {
  fetchNotifications,
  markAllRead,
  type AppNotification,
} from '../lib/userNotifications';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function notifIcon(type: AppNotification['type']): { name: string; color: string } {
  if (type === 'like') return { name: 'heart', color: '#FF6B6B' };
  if (type === 'comment') return { name: 'chatbubble', color: Colors.teal };
  return { name: 'mail', color: Colors.accent };
}

function notifText(n: AppNotification): string {
  if (n.type === 'like') return `${n.actor_username} liked your post`;
  if (n.type === 'comment') return `${n.actor_username} commented on your post`;
  return `${n.actor_username} sent you a message`;
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await fetchNotifications(user.id);
    setNotifications(data);
    setLoading(false);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, [load]);

  // Mark all read when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      load().then(() => markAllRead(user.id));
    }, [user, load])
  );

  const handleTap = (n: AppNotification) => {
    if (n.type === 'message') {
      router.push(`/messages/${n.actor_id}`);
    } else if (n.post_id) {
      router.push(`/feed/${n.post_id}/comments`);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.teal} />
          }
          renderItem={({ item }) => {
            const icon = notifIcon(item.type);
            return (
              <TouchableOpacity
                style={[styles.row, !item.read && styles.rowUnread]}
                activeOpacity={0.75}
                onPress={() => handleTap(item)}
              >
                <View style={[styles.iconCircle, { backgroundColor: `${icon.color}22` }]}>
                  <Ionicons name={icon.name as any} size={20} color={icon.color} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowMsg}>{notifText(item)}</Text>
                  <Text style={styles.rowTime}>{timeAgo(item.created_at)}</Text>
                </View>
                {!item.read && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>You'll see likes, comments, and messages here</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.textPrimary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { flexGrow: 1, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowUnread: { backgroundColor: 'rgba(62,207,192,0.06)' },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowMsg: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.textPrimary, lineHeight: 20 },
  rowTime: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textMuted, marginTop: 2 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.bold, color: Colors.textPrimary },
  emptySub: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' },
});
