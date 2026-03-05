import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  { emoji: '🌈', label: 'Hope' },
];

const MESSAGES = [
  '✨ Even on tough days, remember: You\'ve got this.',
  '🌱 Every small step forward is progress worth celebrating.',
  '💙 Asking for help is one of the bravest things you can do.',
  '🌟 You are worthy of recovery, love, and happiness.',
  '🦋 Healing is not linear — be patient with yourself.',
  '☀️ Today is a new opportunity to grow and begin again.',
  '🌊 It\'s okay to rest. You don\'t have to earn your peace.',
  '🌈 The strength you need is already inside you.',
];

function AnimatedIllustration() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Gentle floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Cycle through illustrations every 3 seconds
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
    <Animated.View
      style={[
        styles.illustrationContainer,
        { transform: [{ translateY: floatAnim }] },
      ]}
    >
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.illustrationLabel}>{item.label}</Text>
      </Animated.View>
    </Animated.View>
  );
}

function CyclingMessage() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        setIndex((prev) => (prev + 1) % MESSAGES.length);
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View style={[styles.quoteContainer, { opacity }]}>
      <Text style={styles.quote}>{MESSAGES[index]}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setShowPopup(!showPopup)}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={30} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Profile Popup */}
        {showPopup && (
          <Pressable style={styles.popupOverlay} onPress={() => setShowPopup(false)}>
            <View style={styles.popup}>
              <TouchableOpacity style={styles.popupItem} onPress={() => setShowPopup(false)}>
                <Ionicons name="person-circle-outline" size={22} color={Colors.textDark} />
                <Text style={styles.popupText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupItem} onPress={() => setShowPopup(false)}>
                <Ionicons name="share-social-outline" size={22} color={Colors.textDark} />
                <Text style={styles.popupText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupItem}
                onPress={() => { setShowPopup(false); router.push('/(tabs)/directory'); }}
              >
                <Ionicons name="list-outline" size={22} color={Colors.textDark} />
                <Text style={styles.popupText}>Directory</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        )}

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Animated Illustration */}
        <AnimatedIllustration />

        {/* Cycling Quote */}
        <CyclingMessage />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerIcon: {
    padding: 4,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  popup: {
    position: 'absolute',
    right: 16,
    top: 64,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 11,
  },
  popupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  popupText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.textDark,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 22,
    overflow: 'hidden',
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(62, 207, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(62, 207, 192, 0.3)',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  illustrationLabel: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.teal,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quoteContainer: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    minHeight: 70,
    justifyContent: 'center',
  },
  quote: {
    fontSize: 17,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
