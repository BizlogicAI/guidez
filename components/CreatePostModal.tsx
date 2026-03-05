import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { PostAvatar } from './PostAvatar';
import { createPost } from '../lib/feed';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface CreatePostModalProps {
  visible: boolean;
  userId: string;
  username: string;
  onClose: () => void;
  onPosted: () => void;
}

export function CreatePostModal({ visible, userId, username, onClose, onPosted }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      await createPost(userId, content.trim());
      setContent('');
      onPosted();
      onClose();
    } catch {
      // silent — user can retry
    } finally {
      setPosting(false);
    }
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Post</Text>
            <TouchableOpacity
              style={[styles.postButton, (!content.trim() || posting) && styles.postButtonDisabled]}
              onPress={handlePost}
              disabled={!content.trim() || posting}
            >
              {posting
                ? <ActivityIndicator size="small" color={Colors.bgDark} />
                : <Text style={styles.postButtonText}>Share</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.compose}>
            <PostAvatar username={username} size={42} />
            <TextInput
              style={styles.input}
              placeholder="Share your journey..."
              placeholderTextColor={Colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              maxLength={500}
            />
          </View>

          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: Colors.bgDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
    minHeight: 280,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  postButton: {
    backgroundColor: Colors.teal,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
    minWidth: 72,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.bgDark,
  },
  compose: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 4,
  },
  charCount: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 8,
  },
});
