import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProtectedScreen } from '../../components/ProtectedScreen';
import { Colors } from '../../constants/colors';

function LeaderboardContent() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.label}>Community Leaderboard</Text>
        <Text style={styles.sub}>Top contributors will appear here</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  return (
    <ProtectedScreen message="Sign in to see the community leaderboard and earn your place.">
      <LeaderboardContent />
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emoji: { fontSize: 56 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary },
});
