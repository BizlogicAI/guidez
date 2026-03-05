import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

export default function TrendingScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Trending</Text>
        <Text style={styles.placeholderSub}>
          The most popular posts from the community will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  placeholder: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  placeholderSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
});
