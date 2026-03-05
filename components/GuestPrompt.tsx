import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

interface GuestPromptProps {
  title?: string;
  message?: string;
}

export function GuestPrompt({
  title = 'Sign In to Continue',
  message = 'Create a free account to connect with the Guidez community.',
}: GuestPromptProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={32} color={Colors.teal} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/auth/login')}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={styles.signUpText}>
            New here?{' '}
            <Text style={styles.signUpLink}>Create an account</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(62,207,192,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  signInButton: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  signInText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.bgDark,
  },
  signUpText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  signUpLink: {
    color: Colors.teal,
    fontFamily: Fonts.semiBold,
  },
});
