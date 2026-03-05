import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/context/AuthContext';
import { fetchComments, createComment, subscribeToComments, type Comment } from '../../../lib/comments';
import { PostAvatar } from '../../../components/PostAvatar';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentsScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = async () => {
    if (!postId) return;
    const data = await fetchComments(postId);
    setComments(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    const channel = subscribeToComments(postId, load);
    return () => { channel.unsubscribe(); };
  }, [postId]);

  const handleSubmit = async () => {
    if (!text.trim() || !user || !postId || submitting) return;
    setSubmitting(true);
    try {
      await createComment(postId, user.id, text.trim());
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // silent — comment failed
    } finally {
      setSubmitting(false);
    }
  };

  const username = profile?.username ?? user?.user_metadata?.username ?? 'me';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <PostAvatar username={item.username} size={34} />
              <View style={styles.bubble}>
                <Text style={styles.commentUser}>{item.username}</Text>
                <Text style={styles.commentText}>{item.content}</Text>
                <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No comments yet — be the first!</Text>
            </View>
          }
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <PostAvatar username={username} size={32} />
        <TextInput
          style={styles.input}
          placeholder="Add a comment…"
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          maxLength={300}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.7}
          disabled={!text.trim() || submitting}
          style={[styles.sendBtn, (!text.trim() || submitting) && styles.sendBtnDisabled]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={Colors.bgDark} />
          ) : (
            <Ionicons name="send" size={18} color={Colors.bgDark} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.textPrimary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 12, flexGrow: 1 },
  commentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bubble: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  commentUser: { fontSize: 13, fontFamily: Fonts.bold, color: Colors.textPrimary },
  commentText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 20 },
  commentTime: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textMuted },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgPrimary,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontFamily: Fonts.regular,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.45 },
});
