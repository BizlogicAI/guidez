import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/context/AuthContext';
import {
  checkUsernameAvailability,
  updateUsername,
  updateEmail,
  updatePassword,
} from '../../lib/profiles';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'unchanged';

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const currentUsername = profile?.username ?? user?.user_metadata?.username ?? '';
  const currentEmail = user?.email ?? '';

  const [username, setUsername] = useState(currentUsername);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('unchanged');

  const [email, setEmail] = useState(currentEmail);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);

  // Debounced username check
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (trimmed === currentUsername.toLowerCase()) {
      setUsernameStatus('unchanged');
      return;
    }
    if (trimmed.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailability(trimmed, user?.id);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timer);
  }, [username, currentUsername, user?.id]);

  const handleSave = useCallback(async () => {
    const trimmedUsername = username.trim().toLowerCase();
    const usernameChanged = trimmedUsername !== currentUsername.toLowerCase();
    const emailChanged = email.trim() !== currentEmail;
    const passwordChanged = newPassword.length > 0;

    if (!usernameChanged && !emailChanged && !passwordChanged) {
      router.back();
      return;
    }

    if (usernameChanged && usernameStatus === 'taken') {
      Alert.alert('Username Taken', 'Choose a different username.');
      return;
    }

    if (usernameChanged && usernameStatus === 'checking') {
      Alert.alert('Please wait', 'Still checking username availability.');
      return;
    }

    if (passwordChanged) {
      if (newPassword.length < 8) {
        Alert.alert('Password Too Short', 'Password must be at least 8 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Passwords Do Not Match', 'Please confirm your new password.');
        return;
      }
    }

    setSaving(true);
    try {
      if (usernameChanged && user?.id) {
        await updateUsername(user.id, trimmedUsername);
      }
      if (emailChanged) {
        await updateEmail(email.trim());
        Alert.alert('Confirm Email', 'A confirmation link has been sent to your new email address.');
      }
      if (passwordChanged) {
        await updatePassword(newPassword);
      }

      await refreshProfile();
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      Alert.alert('Update Failed', message);
    } finally {
      setSaving(false);
    }
  }, [
    username, currentUsername, email, currentEmail,
    newPassword, confirmPassword, usernameStatus,
    user?.id, refreshProfile,
  ]);

  const usernameStatusIcon = () => {
    if (usernameStatus === 'checking') return <ActivityIndicator size="small" color={Colors.teal} />;
    if (usernameStatus === 'available') return <Ionicons name="checkmark-circle" size={20} color={Colors.teal} />;
    if (usernameStatus === 'taken') return <Ionicons name="close-circle" size={20} color={Colors.danger} />;
    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator size="small" color={Colors.bgDark} />
            : <Text style={styles.saveButtonText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Username */}
        <Text style={styles.sectionLabel}>USERNAME</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Username"
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.statusIcon}>{usernameStatusIcon()}</View>
        </View>
        {usernameStatus === 'taken' && (
          <Text style={styles.errorText}>Username is already taken</Text>
        )}
        {usernameStatus === 'available' && (
          <Text style={styles.successText}>Username is available</Text>
        )}

        {/* Email */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>EMAIL</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email address"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <Text style={styles.hintText}>Email changes require confirmation via link.</Text>

        {/* Password */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>CHANGE PASSWORD</Text>
        <TextInput
          style={[styles.input, { marginBottom: 10 }]}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="New password (min. 8 characters)"
          placeholderTextColor={Colors.textMuted}
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm new password"
          placeholderTextColor={Colors.textMuted}
        />
        {newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: Colors.teal,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.bgDark,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },
  statusIcon: {
    position: 'absolute',
    right: 14,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.danger,
    marginTop: 5,
  },
  successText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.teal,
    marginTop: 5,
  },
  hintText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 5,
  },
});
