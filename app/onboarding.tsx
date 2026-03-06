import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';

const { width } = Dimensions.get('window');

const SCREENS = [
  { id: 'welcome' },
  { id: 'features' },
  { id: 'start' },
];

const FEATURES = [
  {
    icon: 'location' as const,
    title: 'Find Resources',
    desc: 'Hospitals, rehab centers, detox facilities, and sober living homes near you.',
  },
  {
    icon: 'people' as const,
    title: 'Community',
    desc: 'Share your journey with people who truly understand what you\'re going through.',
  },
  {
    icon: 'leaf' as const,
    title: 'Track Your Growth',
    desc: 'Celebrate sobriety milestones and check in daily with how you\'re feeling.',
  },
];

async function completeOnboarding(dest: '/auth/signup' | '/auth/login') {
  try {
    await AsyncStorage.setItem('onboarding_seen', 'true');
  } catch {
    // Non-blocking — if storage fails, user will see onboarding again next launch
  }
  router.replace(dest);
}

function WelcomeScreen() {
  return (
    <View style={[slide.container]}>
      <View style={slide.logoWrap}>
        <Image
          source={require('../assets/logo.png')}
          style={slide.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={slide.title}>Welcome to Guidez</Text>
      <Text style={slide.subtitle}>
        Your recovery journey,{'\n'}guided and supported.
      </Text>
    </View>
  );
}

function FeaturesScreen() {
  return (
    <View style={[slide.container, { justifyContent: 'center' }]}>
      <Text style={slide.title}>Everything You Need</Text>
      <Text style={slide.subtitle}>Built for your recovery, every step of the way.</Text>
      <View style={slide.featureList}>
        {FEATURES.map((f) => (
          <View key={f.title} style={slide.featureRow}>
            <View style={slide.featureIcon}>
              <Ionicons name={f.icon} size={22} color={Colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={slide.featureTitle}>{f.title}</Text>
              <Text style={slide.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function GetStartedScreen() {
  return (
    <View style={[slide.container, { justifyContent: 'center' }]}>
      <Text style={slide.bigEmoji}>🌱</Text>
      <Text style={slide.title}>Ready to Begin?</Text>
      <Text style={slide.subtitle}>
        You don't have to do this alone.{'\n'}Join the Guidez community today.
      </Text>
      <TouchableOpacity
        style={slide.primaryButton}
        onPress={() => completeOnboarding('/auth/signup')}
        activeOpacity={0.85}
      >
        <Text style={slide.primaryButtonText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => completeOnboarding('/auth/login')} activeOpacity={0.7}>
        <Text style={slide.signInText}>
          Already have an account?{' '}
          <Text style={slide.signInLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goNext = () => {
    if (activeIndex < SCREENS.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    }
  };

  const renderItem = ({ item }: { item: { id: string } }) => {
    if (item.id === 'welcome') return <WelcomeScreen />;
    if (item.id === 'features') return <FeaturesScreen />;
    return <GetStartedScreen />;
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FlatList
        ref={flatRef}
        data={SCREENS}
        horizontal
        pagingEnabled
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      {/* Dots */}
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SCREENS.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {activeIndex < SCREENS.length - 1 && (
          <View style={styles.nav}>
            <TouchableOpacity onPress={() => completeOnboarding('/auth/login')} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.85}>
              <Text style={styles.nextText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.bgDark} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { width: 24, backgroundColor: Colors.teal },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skipText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.textMuted },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.teal, borderRadius: 24,
    paddingVertical: 10, paddingHorizontal: 20,
  },
  nextText: { fontSize: 14, fontFamily: Fonts.bold, color: Colors.bgDark },
});

const slide = StyleSheet.create({
  container: {
    width,
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoWrap: { marginBottom: 32 },
  logo: { width: 140, height: 140, borderRadius: 28 },
  bigEmoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 30, fontFamily: Fonts.extraBold,
    color: Colors.textPrimary, textAlign: 'center', marginBottom: 12,
  },
  subtitle: {
    fontSize: 16, fontFamily: Fonts.regular,
    color: Colors.textSecondary, textAlign: 'center', lineHeight: 24,
    marginBottom: 40,
  },
  featureList: { width: '100%', gap: 20 },
  featureRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.bgCard, borderRadius: 14, padding: 16,
  },
  featureIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(62,207,192,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.textPrimary, marginBottom: 4 },
  featureDesc: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 18 },
  primaryButton: {
    width: '100%', backgroundColor: Colors.teal,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 16,
  },
  primaryButtonText: { fontSize: 16, fontFamily: Fonts.bold, color: Colors.bgDark },
  signInText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, textAlign: 'center' },
  signInLink: { color: Colors.teal, fontFamily: Fonts.semiBold },
});
