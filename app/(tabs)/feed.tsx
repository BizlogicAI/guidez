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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../lib/context/AuthContext';
import { fetchFeed, subscribeToPosts, type FeedPost } from '../../lib/feed';
import { PostCard } from '../../components/PostCard';
import { CreatePostModal } from '../../components/CreatePostModal';
import { ProtectedScreen } from '../../components/ProtectedScreen';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

function FeedContent() {
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!user) return;
    const data = await fetchFeed(user.id);
    setPosts(data);
    setLoading(false);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    const channel = subscribeToPosts(() => { loadFeed(); });
    return () => { channel.unsubscribe(); };
  }, [loadFeed]);

  const handleLikeChange = (postId: string, liked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: liked, like_count: p.like_count + (liked ? 1 : -1) }
          : p
      )
    );
  };

  const username = profile?.username ?? user?.user_metadata?.username ?? 'me';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Growth Feed</Text>
        <TouchableOpacity
          style={styles.messagesButton}
          onPress={() => router.push('/(tabs)/messages')}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={user!.id}
              onLikeChange={handleLikeChange}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.teal} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySub}>Be the first to share your journey</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: 24 + insets.bottom }]}
        onPress={() => setShowCreate(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.bgDark} />
      </TouchableOpacity>

      <CreatePostModal
        visible={showCreate}
        userId={user!.id}
        username={username}
        onClose={() => setShowCreate(false)}
        onPosted={loadFeed}
      />
    </View>
  );
}

export default function FeedScreen() {
  return (
    <ProtectedScreen
      title="Join the Community"
      message="Sign in to share your journey and connect with others in recovery."
    >
      <FeedContent />
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary },
  messagesButton: { padding: 4 },
  listContent: { paddingTop: 6, paddingBottom: 100 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: Fonts.bold, color: Colors.textPrimary },
  emptySub: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
