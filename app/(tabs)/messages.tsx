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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/context/AuthContext';
import { fetchConversations, subscribeToMessages, type Conversation } from '../../lib/messages';
import { PostAvatar } from '../../components/PostAvatar';
import { ProtectedScreen } from '../../components/ProtectedScreen';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function MessagesContent() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await fetchConversations(user.id);
    setConversations(data);
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

  useEffect(() => {
    if (!user) return;
    const channel = subscribeToMessages(user.id, load);
    return () => { channel.unsubscribe(); };
  }, [user, load]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.userId}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.teal} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.75}
              onPress={() => router.push(`/messages/${item.userId}`)}
            >
              <PostAvatar username={item.username} size={46} />
              <View style={styles.rowText}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowName}>{item.username}</Text>
                  <Text style={styles.rowTime}>{timeAgo(item.lastMessageAt)}</Text>
                </View>
                <Text style={styles.rowPreview} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount > 9 ? '9+' : item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>Tap a member's name in the feed to start a conversation</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

export default function MessagesScreen() {
  return (
    <ProtectedScreen
      title="Your Messages"
      message="Sign in to message other members of the community."
    >
      <MessagesContent />
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary },
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
  rowText: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowName: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.textPrimary },
  rowTime: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textMuted },
  rowPreview: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontFamily: Fonts.bold, color: Colors.bgDark },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 12, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.bold, color: Colors.textPrimary },
  emptySub: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' },
});
