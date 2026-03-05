import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../lib/context/AuthContext';
import { ProtectedScreen } from '../../components/ProtectedScreen';
import { updateSobrietyDate } from '../../lib/profiles';
import {
  getDaysSober,
  getCurrentMilestone,
  getNextMilestone,
} from '../../lib/leaderboard';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

function ProfileContent() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayName = profile?.username ?? user?.user_metadata?.username ?? user?.email ?? 'Member';
  const sobrietyDate = profile?.sobriety_date ?? null;
  const daysSober = sobrietyDate ? getDaysSober(sobrietyDate) : null;
  const milestone = daysSober !== null ? getCurrentMilestone(daysSober) : null;
  const nextMilestone = daysSober !== null ? getNextMilestone(daysSober) : null;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  const handleDateChange = async (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (!selected || !user?.id) return;
    setSaving(true);
    try {
      const iso = selected.toISOString().split('T')[0];
      await updateSobrietyDate(user.id, iso);
      await refreshProfile();
    } catch {
      Alert.alert('Error', 'Could not save sobriety date. Please try again.');
    } finally {
      setSaving(false);
      if (Platform.OS === 'ios') setShowPicker(false);
    }
  };

  const handleClearDate = () => {
    Alert.alert(
      'Clear Sobriety Date',
      'Are you sure you want to remove your sobriety date?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            await updateSobrietyDate(user.id, null);
            await refreshProfile();
          },
        },
      ]
    );
  };

  const pickerDate = sobrietyDate ? new Date(sobrietyDate) : new Date();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar + name */}
      <View style={styles.avatarSection}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={40} color={Colors.teal} />
          </View>
        )}
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Sobriety counter */}
      <View style={styles.sobrietyCard}>
        {daysSober !== null ? (
          <>
            <View style={styles.sobrietyTop}>
              <View style={styles.daysBlock}>
                <Text style={styles.daysNumber}>{daysSober}</Text>
                <Text style={styles.daysLabel}>{daysSober === 1 ? 'day' : 'days'} sober</Text>
              </View>
              {milestone && (
                <View style={styles.milestoneBlock}>
                  <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
                  <Text style={styles.milestoneLabel}>{milestone.label}</Text>
                </View>
              )}
            </View>
            {nextMilestone && (
              <Text style={styles.nextMilestone}>
                {nextMilestone.emoji} Next: {nextMilestone.label} in{' '}
                {nextMilestone.days - daysSober} day{nextMilestone.days - daysSober !== 1 ? 's' : ''}
              </Text>
            )}
            <View style={styles.sobrietyActions}>
              <TouchableOpacity
                style={styles.changeDateBtn}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={14} color={Colors.teal} />
                <Text style={styles.changeDateText}>Change date</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClearDate} activeOpacity={0.7}>
                <Text style={styles.clearDateText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.setSobrietyBtn}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Ionicons name="calendar" size={20} color={Colors.bgDark} />
            <Text style={styles.setSobrietyText}>Set My Sobriety Date</Text>
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Menu rows */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/profile/edit')}>
          <Ionicons name="create-outline" size={20} color={Colors.textPrimary} />
          <Text style={styles.rowText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={styles.chevron} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={[styles.rowText, { color: Colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  return (
    <ProtectedScreen>
      <ProfileContent />
    </ProtectedScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: Fonts.bold, color: Colors.textPrimary },
  avatarSection: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.teal,
    marginBottom: 4,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(62,207,192,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  displayName: { fontSize: 20, fontFamily: Fonts.bold, color: Colors.textPrimary },
  email: { fontSize: 13, fontFamily: Fonts.regular, color: Colors.textSecondary },
  sobrietyCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  sobrietyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  daysBlock: { gap: 2 },
  daysNumber: { fontSize: 42, fontFamily: Fonts.extraBold, color: Colors.teal, lineHeight: 46 },
  daysLabel: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.textSecondary },
  milestoneBlock: { alignItems: 'center', gap: 4 },
  milestoneEmoji: { fontSize: 36 },
  milestoneLabel: { fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.textSecondary },
  nextMilestone: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 10,
  },
  sobrietyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  changeDateBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeDateText: { fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.teal },
  clearDateText: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textMuted },
  setSobrietyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.teal,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 8,
  },
  setSobrietyText: { fontSize: 15, fontFamily: Fonts.bold, color: Colors.bgDark },
  section: {
    marginHorizontal: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  rowText: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.textPrimary, flex: 1 },
  chevron: { marginLeft: 'auto' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 48 },
});
