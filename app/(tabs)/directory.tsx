import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { fetchFacilities, storeFacilities, Facility, FacilityType } from '../../lib/samhsa';
import { fetchHospitals } from '../../lib/hospitals';

type FilterType = 'All' | FacilityType;

const FILTERS: FilterType[] = ['All', 'Hospitals', 'Detox', 'Rehab', 'Mental Health', 'Sober Living'];
const DISTANCES = [10, 25, 50, 100];

function FacilityCard({ item }: { item: Facility }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => router.push({ pathname: '/directory/[facilityId]', params: { facilityId: item.id } })}
    >
      <View style={styles.cardLeft}>
        <Ionicons name="location-outline" size={22} color={Colors.textPrimary} />
        <Text style={styles.distanceText}>{item.distance} mi.</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardAddress} numberOfLines={1}>
          {item.address}, {item.city}, {item.state}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.type}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
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
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchDistance, setSearchDistance] = useState(25);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState('Your Location');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const loadFacilities = useCallback(async (distance: number, cachedCoords?: { lat: number; lng: number }) => {
    setLoading(true);
    setLocationError(null);

    try {
      let lat: number;
      let lng: number;

      if (cachedCoords) {
        lat = cachedCoords.lat;
        lng = cachedCoords.lng;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied. Please enable it in settings to find nearby resources.');
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
        setCoords({ lat, lng });

        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (place) {
          setLocationLabel(`${place.city ?? place.region ?? 'Your Area'}, ${place.region ?? ''}`);
        }
      }

      const [samhsaResults, hospitalResults] = await Promise.all([
        fetchFacilities(lat, lng, distance),
        fetchHospitals(lat, lng, distance),
      ]);

      // Merge and deduplicate by name+city (hospital may appear in both sources)
      const seen = new Set<string>();
      const merged: Facility[] = [];
      for (const f of [...samhsaResults, ...hospitalResults]) {
        const key = `${f.name}|${f.city}`.toLowerCase();
        if (!seen.has(key)) { seen.add(key); merged.push(f); }
      }
      merged.sort((a, b) => a.distance - b.distance);

      storeFacilities(merged);
      setFacilities(merged);
    } catch {
      setLocationError('Could not load facilities. Check your internet connection and try again.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFacilities(searchDistance);
  }, [loadFacilities, searchDistance]);

  const handleDistanceChange = (distance: number) => {
    setSearchDistance(distance);
    setFacilities([]);
    // Re-use cached coords if available
    loadFacilities(distance, coords ?? undefined);
  };

  const handleManualSearch = async () => {
    const query = locationInput.trim();
    if (!query) return;
    setGeocodeError(null);
    setLoading(true);
    setFacilities([]);
    try {
      const results = await Location.geocodeAsync(query);
      if (!results.length) {
        setGeocodeError('Location not found. Try a city name or zip code.');
        setLoading(false);
        return;
      }
      const { latitude: lat, longitude: lng } = results[0];
      const newCoords = { lat, lng };
      setCoords(newCoords);
      setLocationLabel(query);
      setShowLocationInput(false);
      setLocationInput('');
      await loadFacilities(searchDistance, newCoords);
    } catch {
      setGeocodeError('Could not find that location. Please try again.');
      setLoading(false);
    }
  };

  const toggleLocationInput = () => {
    setShowLocationInput((v) => {
      if (!v) setTimeout(() => inputRef.current?.focus(), 50);
      return !v;
    });
    setGeocodeError(null);
  };

  const filtered = activeFilter === 'All'
    ? facilities
    : facilities.filter((f) => f.type === activeFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Find Resources</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.locationText}>{locationLabel}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.searchIcon} onPress={toggleLocationInput}>
              <Ionicons
                name={showLocationInput ? 'close-outline' : 'search-outline'}
                size={24}
                color={showLocationInput ? Colors.teal : Colors.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchIcon} onPress={() => loadFacilities(searchDistance)}>
              <Ionicons name="refresh-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {showLocationInput && (
          <View style={styles.locationInputRow}>
            <TextInput
              ref={inputRef}
              style={styles.locationInput}
              placeholder="City, state or zip code..."
              placeholderTextColor={Colors.textSecondary}
              value={locationInput}
              onChangeText={setLocationInput}
              onSubmitEditing={handleManualSearch}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.goButton} onPress={handleManualSearch}>
              <Text style={styles.goButtonText}>Go</Text>
            </TouchableOpacity>
          </View>
        )}
        {geocodeError ? (
          <Text style={styles.geocodeError}>{geocodeError}</Text>
        ) : null}

        {/* Distance selector */}
        <View style={styles.distanceRow}>
          {DISTANCES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.distanceChip, searchDistance === d && styles.distanceChipActive]}
              onPress={() => handleDistanceChange(d)}
              activeOpacity={0.8}
            >
              <Text style={[styles.distanceChipText, searchDistance === d && styles.distanceChipTextActive]}>
                {d} mi
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
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
      </View>

      {/* Content */}
      <View style={styles.contentArea}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.teal} />
            <Text style={styles.loadingText}>Finding resources within {searchDistance} miles...</Text>
          </View>
        ) : locationError ? (
          <View style={styles.errorState}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadFacilities(searchDistance)}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {facilities.length > 0 && (
              <Text style={styles.resultCount}>
                {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
                {activeFilter === 'All' ? ` within ${searchDistance} mi` : ` in ${activeFilter}`}
              </Text>
            )}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FacilityCard item={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <EmptyState message="No facilities found in this category. Try a different filter or increase the distance." />
              }
            />
          </>
        )}
      </View>
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
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  distanceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  distanceChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  distanceChipActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  distanceChipText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  distanceChipTextActive: {
    color: Colors.bgDark,
  },
  filterRow: {
    height: 52,
    marginTop: 10,
    marginBottom: 4,
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
  contentArea: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.teal,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyState: {
    paddingTop: 40,
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  locationInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  goButton: {
    backgroundColor: Colors.teal,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  goButtonText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.bgDark,
  },
  geocodeError: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
  },
});
