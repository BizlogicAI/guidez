import { type Facility, type FacilityType } from './samhsa';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// OSM tag filters per facility type
const OSM_QUERIES: Record<FacilityType, string[]> = {
  Hospitals: [
    '"amenity"="hospital"',
  ],
  'Mental Health': [
    '"amenity"="psychiatric_hospital"',
    '"healthcare"="psychiatry"',
    '"healthcare"="mental_health"',
    '"healthcare"="counselling"',
  ],
  Rehab: [
    '"healthcare"="rehabilitation"',
    '"amenity"="rehabilitation"',
    '"healthcare"="drug_rehabilitation"',
  ],
  Detox: [
    '"healthcare"="detoxification"',
    '"social_facility"="detoxification"',
  ],
  'Sober Living': [
    '"social_facility"="group_home"',
    '"social_facility"="halfway_house"',
    '"social_facility:for"="addicted"',
    '"social_facility"="shelter"',
    '"amenity"="social_facility"',
    '"healthcare"="social_care"',
  ],
};

function buildQuery(filters: string[], radiusMeters: number, lat: number, lng: number): string {
  const union = filters
    .flatMap((f) => [
      `node[${f}](around:${radiusMeters},${lat},${lng});`,
      `way[${f}](around:${radiusMeters},${lat},${lng});`,
      `relation[${f}](around:${radiusMeters},${lat},${lng});`,
    ])
    .join('');
  return `[out:json][timeout:25];(${union});out center;`;
}

async function fetchOsmType(
  lat: number,
  lng: number,
  radiusMeters: number,
  type: FacilityType
): Promise<Facility[]> {
  const filters = OSM_QUERIES[type];
  const query = buildQuery(filters, radiusMeters, lat, lng);

  try {
    const res = await fetch(OVERPASS_URL, { method: 'POST', body: query });
    if (!res.ok) return [];
    const data: { elements: OverpassElement[] } = await res.json();

    const seen = new Set<string>();
    const results: Facility[] = [];

    for (const el of data.elements) {
      const tags = el.tags ?? {};
      const name = tags.name;
      if (!name) continue;

      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (!elLat || !elLng) continue;

      const address =
        [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || '';
      const city = tags['addr:city'] || '';

      const key = `${name}|${city}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        id: `osm-${el.id}`,
        name,
        address,
        city,
        state: tags['addr:state'] || '',
        zip: tags['addr:postcode'] || '',
        phone: tags.phone ?? tags['contact:phone'] ?? '',
        website: tags.website ?? tags['contact:website'] ?? '',
        distance: Math.round(haversineDistance(lat, lng, elLat, elLng) * 10) / 10,
        latitude: elLat,
        longitude: elLng,
        type,
      });
    }

    return results;
  } catch {
    return [];
  }
}

export async function fetchAllOsmFacilities(
  lat: number,
  lng: number,
  distanceMiles: number
): Promise<Facility[]> {
  const radiusMeters = Math.round(distanceMiles * 1609.34);
  const types: FacilityType[] = ['Hospitals', 'Mental Health', 'Rehab', 'Detox', 'Sober Living'];

  const results = await Promise.all(
    types.map((type) => fetchOsmType(lat, lng, radiusMeters, type))
  );

  return results.flat();
}

// Keep old export name working
export async function fetchHospitals(
  lat: number,
  lng: number,
  distanceMiles: number
): Promise<Facility[]> {
  const radiusMeters = Math.round(distanceMiles * 1609.34);
  return fetchOsmType(lat, lng, radiusMeters, 'Hospitals');
}
