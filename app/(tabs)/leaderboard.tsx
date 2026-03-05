import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/colors';

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
      </SafeAreaView>
      <View style={styles.body}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.label}>Community Leaderboard</Text>
        <Text style={styles.sub}>Top contributors will appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emoji: { fontSize: 56 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  sub: { fontSize: 13, color: Colors.textSecondary },
});
