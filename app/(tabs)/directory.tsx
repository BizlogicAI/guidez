import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';

export default function DirectoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Resource Directory</Text>
        <Text style={styles.placeholderSub}>
          Search for rehab centers, mental health clinics, detox facilities,
          and sober living houses near you.
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
