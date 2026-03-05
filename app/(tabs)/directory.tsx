import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { fetchFacilities, Facility, FacilityType } from '../../lib/samhsa';

type FilterType = 'All' | FacilityType;

const FILTERS: FilterType[] = ['All', 'Mental Health', 'Rehab', 'Hospitals', 'Detox', 'Sober Living'];

function FacilityCard({ item }: { item: Facility }) {
  const handleCall = () => {
    if (item.phone) {
      Linking.openURL(`tel:${item.phone.replace(/\D/g, '')}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={handleCall}>
      <View style={styles.cardLeft}>
        <Ionicons name="location-outline" size={22} color={Colors.textPrimary} />
        <Text style={styles.distanceText}>{item.distance} mi.</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardAddress} numberOfLines={1}>
          {item.address}, {item.city}, {item.state}
        </Text>
        {item.phone ? (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={12} color={Colors.teal} />
            <Text style={styles.phoneText}>{item.phone}</Text>
          </View>
        ) : null}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🔍</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export default function DirectoryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState('Your Location');

  const loadFacilities = useCallback(async () => {
    setLoading(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationError('Location permission denied. Please enable it in settings to find nearby resources.');
      setLoading(false);
      return;
    }

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude, longitude } = loc.coords;

    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      setLocationLabel(`${place.city ?? place.region ?? 'Your Area'}, ${place.region ?? ''}`);
    }

    try {
      const results = await fetchFacilities(latitude, longitude);
      setFacilities(results);
    } catch {
      setLocationError('Could not load facilities. Check your internet connection and try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const filtered = activeFilter === 'All'
    ? facilities
    : facilities.filter((f) => f.type === activeFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Find Resources</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.locationText}>{locationLabel}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.searchIcon} onPress={loadFacilities}>
              <Ionicons name="refresh-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, activeFilter === filter && styles.chipActive]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeFilter === filter && styles.chipTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.teal} />
          <Text style={styles.loadingText}>Finding resources near you...</Text>
        </View>
      ) : locationError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📍</Text>
          <Text style={styles.emptyText}>{locationError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFacilities}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FacilityCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState message="No facilities found in this category. Try a different filter or expand your search area." />
          }
          ListHeaderComponent={
            facilities.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} resource{filtered.length !== 1 ? 's' : ''} near you
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    backgroundColor: Colors.bgDark,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  searchIcon: {
    padding: 4,
  },
  filterScroll: {
    maxHeight: 56,
    marginVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: Colors.chipInactive,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.chipActive,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.chipTextInactive,
  },
  chipTextActive: {
    color: Colors.chipTextActive,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 4,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  cardLeft: {
    alignItems: 'center',
    width: 52,
    marginRight: 12,
    paddingTop: 2,
  },
  distanceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  cardRight: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  cardAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phoneText: {
    fontSize: 12,
    color: Colors.teal,
    fontFamily: Fonts.medium,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(62,207,192,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.teal,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: Colors.teal,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryButtonText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.bgDark,
  },
});
