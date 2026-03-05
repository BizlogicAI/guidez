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
import {
  fetchComments,
  createComment,
  toggleCommentLike,
  subscribeToComments,
  type Comment,
} from '../../../lib/comments';
import { fetchPost, type FeedPost } from '../../../lib/feed';
import { createNotification } from '../../../lib/userNotifications';
import { getDaysSober, getCurrentMilestone } from '../../../lib/leaderboard';
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

function CommentRow({
  item,
  currentUserId,
  currentUsername,
}: {
  item: Comment;
  currentUserId: string;
  currentUsername: string;
}) {
  const [liked, setLiked] = useState(item.is_liked);
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    setLiking(true);
    try {
      await toggleCommentLike(item.id, currentUserId, liked);
      if (newLiked && item.user_id !== currentUserId) {
        createNotification({
          userId: item.user_id,
          type: 'like',
          actorId: currentUserId,
          actorUsername: currentUsername,
          postId: item.post_id,
        }).catch(() => {});
      }
    } catch {
      setLiked(liked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    } finally {
      setLiking(false);
    }
  };

  const milestoneBadge = item.sobriety_date
    ? (getCurrentMilestone(getDaysSober(item.sobriety_date))?.emoji ?? null)
    : null;

  return (
    <View style={styles.commentRow}>
      <PostAvatar username={item.username} avatarUrl={item.avatar_url} milestoneBadge={milestoneBadge} size={34} />
      <View style={styles.bubble}>
        <View style={styles.bubbleTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.commentUser}>{item.username}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
            <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
          </View>
          <TouchableOpacity style={styles.commentLikeBtn} onPress={handleLike} activeOpacity={0.7}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={16}
              color={liked ? '#FF6B6B' : Colors.textMuted}
            />
            {likeCount > 0 && (
              <Text style={[styles.commentLikeCount, liked && { color: '#FF6B6B' }]}>
                {likeCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CommentsScreen() {
  const { postId, ownerId } = useLocalSearchParams<{ postId: string; ownerId: string }>();
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<FlatList>(null);

  const currentUserId = user?.id ?? '';
  const username = profile?.username ?? user?.user_metadata?.username ?? 'me';

  const loadAll = async () => {
    if (!postId || !currentUserId) return;
    const [postData, commentData] = await Promise.all([
      fetchPost(postId, currentUserId),
      fetchComments(postId, currentUserId),
    ]);
    if (postData) setPost(postData);
    setComments(commentData);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [postId, currentUserId]);

  useEffect(() => {
    if (!postId) return;
    const channel = subscribeToComments(postId, () => {
      if (currentUserId) fetchComments(postId, currentUserId).then(setComments);
    });
    return () => { channel.unsubscribe(); };
  }, [postId, currentUserId]);

  const handleSubmit = async () => {
    if (!text.trim() || !user || !postId || submitting) return;
    setSubmitting(true);
    try {
      await createComment(postId, user.id, text.trim());
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      if (ownerId && ownerId !== user.id) {
        createNotification({
          userId: ownerId,
          type: 'comment',
          actorId: user.id,
          actorUsername: username,
          postId,
        }).catch(() => {});
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const PostHeader = () => {
    if (!post) return null;
    const postMilestoneBadge = post.sobriety_date
      ? (getCurrentMilestone(getDaysSober(post.sobriety_date))?.emoji ?? null)
      : null;
    return (
      <View style={styles.postHeader}>
        <View style={styles.postAuthorRow}>
          <PostAvatar username={post.username} avatarUrl={post.avatar_url} milestoneBadge={postMilestoneBadge} size={42} />
          <View style={{ flex: 1 }}>
            <Text style={styles.postUsername}>{post.username}</Text>
            <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
          </View>
        </View>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.divider} />
        <Text style={styles.commentsLabel}>Comments</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bgPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
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
          ListHeaderComponent={<PostHeader />}
          renderItem={({ item }) => (
            <CommentRow
              item={item}
              currentUserId={currentUserId}
              currentUsername={username}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-outline" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No comments yet — be the first!</Text>
            </View>
          }
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <PostAvatar username={username} avatarUrl={profile?.avatar_url} size={32} />
        <TextInput
          style={styles.input}
          placeholder="Add a comment…"
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          maxLength={300}
          multiline
          autoCorrect
          autoCapitalize="sentences"
          spellCheck
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
  listContent: { paddingBottom: 20, flexGrow: 1 },
  postHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  postUsername: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  postTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  postContent: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  commentsLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
  },
  bubbleTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentUser: { fontSize: 13, fontFamily: Fonts.bold, color: Colors.textPrimary, marginBottom: 3 },
  commentText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textPrimary, lineHeight: 20 },
  commentTime: { fontSize: 11, fontFamily: Fonts.regular, color: Colors.textMuted, marginTop: 4 },
  commentLikeBtn: {
    alignItems: 'center',
    gap: 2,
    paddingTop: 2,
  },
  commentLikeCount: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
    paddingHorizontal: 16,
  },
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
