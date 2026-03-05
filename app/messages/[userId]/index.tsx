import { useState, useEffect, useRef, useCallback } from 'react';
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
  fetchThread,
  sendMessage,
  markThreadAsRead,
  subscribeToMessages,
  type Message,
} from '../../../lib/messages';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const { userId: otherUserId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUsername, setOtherUsername] = useState('Member');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!user || !otherUserId) return;
    const data = await fetchThread(user.id, otherUserId);
    setMessages(data);
    setLoading(false);
    await markThreadAsRead(user.id, otherUserId);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
  }, [user, otherUserId]);

  useEffect(() => {
    // Fetch the other user's username
    if (!otherUserId) return;
    supabase
      .from('profiles')
      .select('username')
      .eq('user_id', otherUserId)
      .single()
      .then(({ data }) => {
        if (data?.username) setOtherUsername(data.username);
      });
  }, [otherUserId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = subscribeToMessages(user.id, load);
    return () => { channel.unsubscribe(); };
  }, [user, load]);

  const handleSend = async () => {
    if (!text.trim() || !user || !otherUserId || sending) return;
    const content = text.trim();
    setText('');
    setSending(true);
    // Optimistic add
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      sender_id: user.id,
      receiver_id: otherUserId,
      content,
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      await sendMessage(user.id, otherUserId, content);
    } catch {
      // revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setText(content);
    } finally {
      setSending(false);
    }
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
        <Text style={styles.headerTitle}>{otherUsername}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.teal} size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMe = item.sender_id === user?.id;
            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
                  <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Say hello to {otherUsername}!</Text>
            </View>
          }
        />
      )}

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${otherUsername}…`}
          placeholderTextColor={Colors.textMuted}
          value={text}
          onChangeText={setText}
          maxLength={500}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={!text.trim() || sending}
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
        >
          {sending ? (
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: Fonts.bold, color: Colors.textPrimary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 14, gap: 8, flexGrow: 1 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  msgRowMe: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleThem: { backgroundColor: Colors.bgCard },
  bubbleMe: { backgroundColor: Colors.teal },
  bubbleText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bubbleTextMe: { color: Colors.bgDark },
  bubbleTime: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
  },
  bubbleTimeMe: { color: 'rgba(15,66,96,0.65)' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: Fonts.regular, color: Colors.textMuted },
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
