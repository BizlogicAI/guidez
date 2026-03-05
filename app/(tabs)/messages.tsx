import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/colors';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.title}>Messages</Text>
        </View>
      </SafeAreaView>
      <View style={styles.body}>
        <Text style={styles.emoji}>💬</Text>
        <Text style={styles.label}>Your messages will appear here</Text>
        <Text style={styles.sub}>Connect with others in the community</Text>
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
