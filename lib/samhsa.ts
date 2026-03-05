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
  services?: string[];
}

interface SAMHSAResponse {
  recordCount: number;
  totalPages: number;
  page: number;
  rows: SAMHSARow[];
}

function mapType(row: SAMHSARow): FacilityType {
  const services = row.services ?? [];
  const type = (row.typeFacility ?? '').toLowerCase();

  if (type.includes('hospital') || type.includes('inpatient')) return 'Hospitals';
  if (type.includes('detox') || services.includes('DT')) return 'Detox';
  if (type.includes('sober') || type.includes('halfway') || type.includes('residential')) return 'Sober Living';
  if (services.includes('MH') && !services.includes('SA')) return 'Mental Health';
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
    `&limitType=0&limitValue=${distance}&pageSize=${pageSize}&page=1`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`SAMHSA API error: ${res.status}`);
  }

  const data: SAMHSAResponse = await res.json();

  return data.rows.map((row) => ({
    id: `${row.name1}-${row.street1}-${row.city}`.replace(/\s+/g, '-').toLowerCase(),
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
