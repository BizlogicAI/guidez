import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

type FilterType = 'All' | 'Mental Health' | 'Rehab' | 'Hospitals' | 'Detox' | 'Sober Living';

const FILTERS: FilterType[] = ['All', 'Mental Health', 'Rehab', 'Hospitals', 'Detox', 'Sober Living'];

const MOCK_FACILITIES = [
  {
    id: '1',
    name: 'Cira Center For Behavioral Health',
    address: '155 N Michigan Ave #450, Chicago',
    distance: 0.6,
    rating: 4.1,
    type: 'Mental Health',
  },
  {
    id: '2',
    name: 'Pathlight Mood & Anxiety Center Chicago',
    address: '333 Michigan Ave Suite 1900, Chicago',
    distance: 0.7,
    rating: 2.8,
    type: 'Mental Health',
  },
  {
    id: '3',
    name: 'Pathlight Mood & Anxiety Center Chicago',
    address: '1 E Erie St Suite 400, Chicago',
    distance: 1.1,
    rating: 3.2,
    type: 'Mental Health',
  },
  {
    id: '4',
    name: 'SunCloud Health Outpatient Treatment',
    address: '1840 N Clybourn Ave #520, Chicago',
    distance: 2.8,
    rating: 3.9,
    type: 'Rehab',
  },
  {
    id: '5',
    name: 'Mount Sinai Inpatient Psychiatry',
    address: '1500 S Fairfield Ave, Chicago',
    distance: 3.5,
    rating: 2.3,
    type: 'Hospitals',
  },
  {
    id: '6',
    name: 'Compass Health Center',
    address: '2500 W Bradley Pl #100, Chicago',
    distance: 5.9,
    rating: 4.2,
    type: 'Mental Health',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingRow}>
      <Ionicons name="star" size={12} color={Colors.star} />
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function FacilityCard({ item }: { item: typeof MOCK_FACILITIES[0] }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={styles.cardLeft}>
        <Ionicons name="location-outline" size={22} color={Colors.textPrimary} />
        <Text style={styles.distanceText}>{item.distance} mi.</Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardAddress} numberOfLines={1}>{item.address}</Text>
        <StarRating rating={item.rating} />
      </View>
    </TouchableOpacity>
  );
}

export default function DirectoryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filtered = activeFilter === 'All'
    ? MOCK_FACILITIES
    : MOCK_FACILITIES.filter(f => f.type === activeFilter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Find Rehab Center</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.locationText}>Your Location</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.searchIcon}>
              <Ionicons name="search-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Illustration bar */}
      <View style={styles.illustrationBar}>
        <Text style={styles.illustrationEmoji}>🔍</Text>
        <Text style={styles.illustrationText}>Search resources near you</Text>
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
            style={[
              styles.chip,
              activeFilter === filter && styles.chipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === filter && styles.chipTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Facility list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FacilityCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Map toggle button */}
      <TouchableOpacity style={styles.mapButton} activeOpacity={0.9}>
        <Ionicons name="map-outline" size={18} color={Colors.bgDark} />
        <Text style={styles.mapButtonText}>Map</Text>
      </TouchableOpacity>
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
    fontWeight: '700',
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
  illustrationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
    backgroundColor: Colors.bgPrimary,
  },
  illustrationEmoji: {
    fontSize: 32,
  },
  illustrationText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  filterScroll: {
    maxHeight: 52,
    marginBottom: 12,
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
    fontWeight: '500',
    color: Colors.chipTextInactive,
  },
  chipTextActive: {
    color: Colors.chipTextActive,
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
    alignItems: 'center',
  },
  cardLeft: {
    alignItems: 'center',
    width: 52,
    marginRight: 12,
  },
  distanceText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  cardRight: {
    flex: 1,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  cardAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mapButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.bgDark,
  },
});
