const BASE_URL = 'https://findtreatment.gov/locator/exportsAsJson/v2';

export type FacilityType = 'Mental Health' | 'Rehab' | 'Hospitals' | 'Detox' | 'Sober Living';

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  distance: number;
  latitude: number;
  longitude: number;
  type: FacilityType;
}

interface ServiceItem {
  f1: string;
  f2: string;
  f3: string;
}

interface SAMHSARow {
  name1: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  latitude: number;
  longitude: number;
  miles: number;
  typeFacility?: string;
  services?: ServiceItem[];
}

interface SAMHSAResponse {
  recordCount: number;
  totalPages: number;
  page: number;
  rows: SAMHSARow[];
}

function mapType(row: SAMHSARow): FacilityType {
  const code = row.typeFacility ?? '';

  // Map typeFacility codes directly
  if (code === 'MH') return 'Mental Health';
  if (code === 'DT') return 'Detox';
  if (code === 'HO') return 'Hospitals';

  // Use service descriptions as fallback for SA/BUPREN/HRSA facilities
  const desc = (row.services ?? [])
    .map((s) => s.f3 ?? '')
    .join(' ')
    .toLowerCase();

  if (desc.includes('detox')) return 'Detox';
  if (desc.includes('hospital') || desc.includes('inpatient medical')) return 'Hospitals';
  if (desc.includes('sober living') || desc.includes('halfway house')) return 'Sober Living';
  if (desc.includes('residential') && (code === 'SA' || code === 'HRSA')) return 'Sober Living';

  return 'Rehab';
}

export async function fetchFacilities(
  latitude: number,
  longitude: number,
  distance = 25,
  pageSize = 30
): Promise<Facility[]> {
  // sAddr format is lat,lng — comma must not be URL-encoded, build manually
  const url =
    `${BASE_URL}?sAddr=${latitude},${longitude}` +
    `&sType=SA,MH&distance=${distance}&pageSize=${pageSize}&page=1`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`SAMHSA API error: ${res.status}`);
  }

  const data: SAMHSAResponse = await res.json();

  return data.rows.map((row, i) => ({
    id: `${i}-${row.name1}-${row.street1}-${row.city}`.replace(/\s+/g, '-').toLowerCase(),
    name: row.name1,
    address: row.street1,
    city: row.city,
    state: row.state,
    zip: row.zip,
    phone: row.phone ?? '',
    distance: Math.round(row.miles * 10) / 10,
    latitude: row.latitude,
    longitude: row.longitude,
    type: mapType(row),
  }));
}
