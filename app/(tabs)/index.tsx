import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const QUOTES = [
  '✨ Even on tough days, remember: You\'ve got this.',
  '✨ Recovery is not a race. You don\'t have to feel guilty about how long the journey takes.',
  '✨ You are stronger than you know. Keep going.',
  '✨ Every day is a fresh start. Today counts.',
];

export default function HomeScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const quote = QUOTES[0];

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
              <TouchableOpacity
                style={styles.popupItem}
                onPress={() => { setShowPopup(false); }}
              >
                <Ionicons name="person-circle-outline" size={22} color={Colors.bgDark} />
                <Text style={styles.popupText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupItem}
                onPress={() => { setShowPopup(false); }}
              >
                <Ionicons name="share-social-outline" size={22} color={Colors.bgDark} />
                <Text style={styles.popupText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupItem}
                onPress={() => { setShowPopup(false); router.push('/directory'); }}
              >
                <Ionicons name="list-outline" size={22} color={Colors.bgDark} />
                <Text style={styles.popupText}>Directory</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        )}

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>G</Text>
          </View>
        </View>

        {/* Illustration Placeholder */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>🧠</Text>
          </View>
        </View>

        {/* Quote */}
        <View style={styles.quoteContainer}>
          <Text style={styles.quote}>{quote}</Text>
        </View>
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
    backgroundColor: Colors.surface,
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
    fontWeight: '500',
    color: Colors.bgDark,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.bgDark,
  },
  illustrationContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(62, 207, 192, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  quoteContainer: {
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  quote: {
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },
});
