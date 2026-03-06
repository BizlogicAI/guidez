import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/context/AuthContext';
import {
  getUnreadCount,
  subscribeToNotifications,
} from '../../lib/userNotifications';
import {
  requestNotificationPermissions,
  scheduleLocalNotification,
} from '../../lib/localNotifications';
import {
  fetchTodayCheckin,
  submitCheckin,
  MOODS,
  type Mood,
  type MoodOption,
} from '../../lib/checkins';
import { getDailyQuote } from '../../lib/quotes';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const ILLUSTRATIONS = [
  { emoji: '🧠', label: 'Mental Wellness' },
  { emoji: '🌱', label: 'Growth' },
  { emoji: '🦋', label: 'Transformation' },
  { emoji: '🌊', label: 'Find Your Flow' },
  { emoji: '☀️', label: 'New Beginnings' },
  { emoji: '🌸', label: 'Blooming' },
  { emoji: '💙', label: 'You Are Loved' },
  { emoji: '🕊️', label: 'Hope' },
];

function AnimatedIllustration() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.7, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % ILLUSTRATIONS.length);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const item = ILLUSTRATIONS[index];

  return (
    <Animated.View style={[styles.illustrationContainer, { transform: [{ translateY: floatAnim }] }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.illustrationLabel}>{item.label}</Text>
      </Animated.View>
    </Animated.View>
  );
}

function DailyQuoteCard() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getDailyQuote()
      .then((q) => {
        setQuote(q);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      })
      .catch(() => {});
  }, []);

  if (!quote) return null;

  return (
    <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
      <Ionicons name="sunny-outline" size={20} color={Colors.accent} style={styles.quoteIcon} />
      <Text style={styles.quoteLabel}>Quote of the Day</Text>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <Text style={styles.quoteAuthor}>— {quote.author}</Text>
    </Animated.View>
  );
}

function DailyCheckinCard({ userId }: { userId: string }) {
  const [checkedInMood, setCheckedInMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchTodayCheckin(userId).then((c) => {
        setCheckedInMood(c?.mood ?? null);
        setLoading(false);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, [userId])
  );

  const handleMood = async (mood: Mood) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitCheckin(userId, mood);
      setCheckedInMood(mood);
    } catch {
      // silently fail — user can try again
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const selectedOption = MOODS.find((m) => m.value === checkedInMood);

  return (
    <Animated.View style={[styles.checkinCard, { opacity: fadeAnim }]}>
      {checkedInMood ? (
        <View style={styles.checkinDone}>
          <Text style={styles.checkinDoneEmoji}>{selectedOption?.emoji}</Text>
          <View>
            <Text style={styles.checkinDoneTitle}>Checked in today</Text>
            <Text style={styles.checkinDoneSub}>Feeling {selectedOption?.label.toLowerCase()} · See you tomorrow</Text>
          </View>
          <Ionicons name="checkmark-circle" size={22} color={Colors.teal} />
        </View>
      ) : (
        <>
          <Text style={styles.checkinTitle}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m: MoodOption) => (
              <TouchableOpacity
                key={m.value}
                style={styles.moodButton}
                onPress={() => handleMood(m.value)}
                activeOpacity={0.7}
                disabled={submitting}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    requestNotificationPermissions().catch(() => {});
    if (!user) return;
    getUnreadCount(user.id).then(setUnreadCount).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = subscribeToNotifications(user.id, (notification) => {
      setUnreadCount((c) => c + 1);
      let title = 'Guidez';
      let body = '';
      if (notification.type === 'like') {
        title = '❤️ New Like';
        body = `${notification.actor_username} liked your post`;
      } else if (notification.type === 'comment') {
        title = '💬 New Comment';
        body = `${notification.actor_username} commented on your post`;
      } else {
        title = '✉️ New Message';
        body = `${notification.actor_username} sent you a message`;
      }
      scheduleLocalNotification(title, body).catch(() => {});
    });
    return () => { channel.unsubscribe(); };
  }, [user]);

  const handleBellPress = () => {
    setUnreadCount(0);
    router.push('/notifications');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity style={styles.notifButton} activeOpacity={0.7} onPress={handleBellPress}>
            <Ionicons name="notifications-outline" size={26} color={Colors.textPrimary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {user && <DailyCheckinCard userId={user.id} />}

        <AnimatedIllustration />
        <DailyQuoteCard />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerSpacer: { flex: 1 },
  notifButton: { padding: 4 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontFamily: Fonts.bold, color: Colors.bgDark },
  logoContainer: { alignItems: 'center', marginTop: 4, marginBottom: 8 },
  logo: { width: 140, height: 140, borderRadius: 28, overflow: 'hidden' },

  // Check-in card
  checkinCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  checkinTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 10, fontFamily: Fonts.medium, color: Colors.textMuted },
  checkinDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkinDoneEmoji: { fontSize: 32 },
  checkinDoneTitle: { fontSize: 14, fontFamily: Fonts.bold, color: Colors.textPrimary },
  checkinDoneSub: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textMuted, marginTop: 2 },

  // Illustration
  illustrationContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illustrationCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(62, 207, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(62, 207, 192, 0.3)',
  },
  illustrationEmoji: { fontSize: 68 },
  illustrationLabel: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.teal,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quoteCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  quoteIcon: { marginBottom: 4 },
  quoteLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
});
