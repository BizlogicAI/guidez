import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

const HOTLINES = [
  {
    id: '1',
    name: 'SAMHSA Helpline',
    number: '1-800-662-4357',
    description: 'Free, confidential treatment referrals 24/7',
    icon: 'medkit-outline' as const,
  },
  {
    id: '2',
    name: '988 Suicide & Crisis Lifeline',
    number: '988',
    description: 'Call or text 988 — free, confidential, 24/7',
    icon: 'heart-outline' as const,
  },
  {
    id: '3',
    name: 'Crisis Text Line',
    number: '741741',
    description: 'Text HOME to 741741 for crisis support',
    icon: 'chatbox-outline' as const,
  },
  {
    id: '4',
    name: 'AA Hotline',
    number: '1-800-839-1686',
    description: 'Alcoholics Anonymous — 24/7 support',
    icon: 'people-outline' as const,
  },
];

export default function SOSScreen() {
  const call = (number: string) => {
    Linking.openURL(`tel:${number.replace(/\D/g, '')}`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Help</Text>
          <Text style={styles.subtitle}>You are not alone. Reach out now.</Text>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        {HOTLINES.map((h) => (
          <TouchableOpacity
            key={h.id}
            style={styles.card}
            onPress={() => call(h.number)}
            activeOpacity={0.8}
          >
            <View style={styles.iconBox}>
              <Ionicons name={h.icon} size={24} color={Colors.teal} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{h.name}</Text>
              <Text style={styles.cardDesc}>{h.description}</Text>
              <Text style={styles.cardNumber}>{h.number}</Text>
            </View>
            <Ionicons name="call-outline" size={20} color={Colors.sos} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    backgroundColor: Colors.bgDark,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  body: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(62,207,192,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardNumber: { fontSize: 13, fontWeight: '600', color: Colors.teal, marginTop: 4 },
});
