import { type Facility } from './samhsa';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // miles
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

export async function fetchHospitals(
  lat: number,
  lng: number,
  distanceMiles: number
): Promise<Facility[]> {
  const radiusMeters = Math.round(distanceMiles * 1609.34);
  const query =
    `[out:json][timeout:25];` +
    `(node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});` +
    `way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});` +
    `relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng}););` +
    `out center;`;

  const res = await fetch(OVERPASS_URL, { method: 'POST', body: query });
  if (!res.ok) return [];

  const data: { elements: OverpassElement[] } = await res.json();

  const seen = new Set<string>();
  const hospitals: Facility[] = [];

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
    const state = tags['addr:state'] || '';

    const key = `${name}|${address}|${city}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    hospitals.push({
      id: `hosp-${el.id}`,
      name,
      address,
      city,
      state,
      zip: tags['addr:postcode'] || '',
      phone: tags.phone ?? tags['contact:phone'] ?? '',
      website: tags.website ?? tags['contact:website'] ?? '',
      distance: Math.round(haversineDistance(lat, lng, elLat, elLng) * 10) / 10,
      latitude: elLat,
      longitude: elLng,
      type: 'Hospitals',
    });
  }

  return hospitals.sort((a, b) => a.distance - b.distance);
}

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}
