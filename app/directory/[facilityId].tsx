import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getFacilityById } from '../../lib/samhsa';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';

const TYPE_ICONS: Record<string, string> = {
  'Hospitals': 'medical',
  'Detox': 'fitness',
  'Rehab': 'heart',
  'Mental Health': 'brain',
  'Sober Living': 'home',
};

function ActionRow({
  icon,
  label,
  sublabel,
  onPress,
  color = Colors.teal,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon as never} size={20} color={color} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionLabel}>{label}</Text>
        {sublabel ? <Text style={styles.actionSublabel} numberOfLines={1}>{sublabel}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function FacilityDetailScreen() {
  const { facilityId } = useLocalSearchParams<{ facilityId: string }>();
  const insets = useSafeAreaInsets();
  const facility = facilityId ? getFacilityById(facilityId) : null;

  if (!facility) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Facility not found.</Text>
        </View>
      </View>
    );
  }

  const handleCall = () => {
    if (facility.phone) Linking.openURL(`tel:${facility.phone.replace(/\D/g, '')}`);
  };

  const handleWebsite = () => {
    const url = facility.website.startsWith('http') ? facility.website : `https://${facility.website}`;
    Linking.openURL(url);
  };

  const handleDirections = () => {
    const dest = encodeURIComponent(`${facility.address}, ${facility.city}, ${facility.state} ${facility.zip}`);
    Linking.openURL(`https://maps.apple.com/?daddr=${dest}`);
  };

  const handleReviews = () => {
    const q = encodeURIComponent(`${facility.name} ${facility.city} ${facility.state}`);
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Facility Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title card */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <View style={styles.typeIcon}>
              <Ionicons
                name={(TYPE_ICONS[facility.type] ?? 'medical') as never}
                size={22}
                color={Colors.teal}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.facilityName}>{facility.name}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{facility.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={15} color={Colors.textMuted} />
            <Text style={styles.addressText}>
              {facility.address}{'\n'}{facility.city}, {facility.state} {facility.zip}
            </Text>
          </View>

          <View style={styles.distancePill}>
            <Ionicons name="navigate-outline" size={13} color={Colors.teal} />
            <Text style={styles.distanceText}>{facility.distance} miles away</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          {facility.phone ? (
            <ActionRow
              icon="call-outline"
              label="Call"
              sublabel={facility.phone}
              onPress={handleCall}
            />
          ) : null}

          {facility.phone ? <View style={styles.divider} /> : null}

          <ActionRow
            icon="navigate-outline"
            label="Get Directions"
            sublabel={`${facility.address}, ${facility.city}`}
            onPress={handleDirections}
          />

          {facility.website ? (
            <>
              <View style={styles.divider} />
              <ActionRow
                icon="globe-outline"
                label="Visit Website"
                sublabel={facility.website}
                onPress={handleWebsite}
              />
            </>
          ) : null}

          <View style={styles.divider} />

          <ActionRow
            icon="star-outline"
            label="See Reviews"
            sublabel="Opens Google Maps"
            onPress={handleReviews}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtn: { width: 40, padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  content: { padding: 16, gap: 12, paddingBottom: 40 },

  titleCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  titleRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(62,207,192,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityName: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(62,207,192,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: { fontSize: 11, fontFamily: Fonts.semiBold, color: Colors.teal },
  addressRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  addressText: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textSecondary, lineHeight: 20 },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(62,207,192,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  distanceText: { fontSize: 12, fontFamily: Fonts.semiBold, color: Colors.teal },

  actionsCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontFamily: Fonts.semiBold, color: Colors.textPrimary },
  actionSublabel: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginLeft: 68 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontFamily: Fonts.medium, color: Colors.textMuted },
});
