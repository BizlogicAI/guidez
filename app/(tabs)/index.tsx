import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to Guidez</Text>
        <Text style={styles.subtitle}>You are not alone. Help is here.</Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Feed coming soon</Text>
        <Text style={styles.placeholderSub}>
          Posts from people you follow will appear here.
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
  header: {
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
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
