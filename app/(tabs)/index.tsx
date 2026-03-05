import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
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
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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
  logoContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 28,
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
