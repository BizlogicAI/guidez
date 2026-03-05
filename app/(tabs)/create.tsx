import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProtectedScreen } from '../../components/ProtectedScreen';
import { Colors } from '../../constants/colors';

function CreateContent() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Create Post</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.emoji}>✏️</Text>
        <Text style={styles.label}>Share with the community</Text>
        <Text style={styles.sub}>Post creation coming soon</Text>
      </View>
    </View>
  );
}

export default function CreateScreen() {
  return (
    <ProtectedScreen message="Sign in to share your story with the Guidez community.">
      <CreateContent />
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
