import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PostAvatar } from './PostAvatar';
import { toggleLike } from '../lib/likes';
import { createNotification } from '../lib/userNotifications';
import type { FeedPost } from '../lib/feed';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface PostCardProps {
  post: FeedPost;
  currentUserId: string;
  currentUsername: string;
  onLikeChange: (postId: string, liked: boolean) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PostCard({ post, currentUserId, currentUsername, onLikeChange }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [liking, setLiking] = useState(false);

  const handleLike = async () => {
    if (liking) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    setLiking(true);
    try {
      await toggleLike(post.id, currentUserId, liked);
      onLikeChange(post.id, newLiked);
      if (newLiked) {
        createNotification({
          userId: post.user_id,
          type: 'like',
          actorId: currentUserId,
          actorUsername: currentUsername,
          postId: post.id,
        }).catch(() => {});
      }
    } catch {
      setLiked(liked);
      setLikeCount((c) => c + (newLiked ? -1 : 1));
    } finally {
      setLiking(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <PostAvatar username={post.username} size={38} />
        <TouchableOpacity
          style={styles.headerText}
          activeOpacity={post.user_id !== currentUserId ? 0.7 : 1}
          onPress={() => {
            if (post.user_id !== currentUserId) {
              router.push(`/messages/${post.user_id}`);
            }
          }}
        >
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.time}>{timeAgo(post.created_at)}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#FF6B6B' : Colors.textSecondary}
          />
          <Text style={[styles.actionCount, liked && styles.likedCount]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/feed/${post.id}/comments?ownerId=${post.user_id}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={19} color={Colors.textSecondary} />
          <Text style={styles.actionCount}>{post.comment_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    marginHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  content: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  likedCount: {
    color: '#FF6B6B',
  },
});
