/**
 * Simplified polygon representing Vietnam territory (with a safe margin).
 * The latitude is first, longitude is second.
 */
const VIETNAM_POLYGON: [number, number][] = [
  [22.8, 102.0],
  [23.4, 105.3],
  [22.8, 106.7],
  [21.8, 108.0],
  [21.5, 109.0],
  [16.5, 110.0],
  [12.5, 111.0],
  [9.5, 109.5],
  [8.2, 105.0],
  [10.2, 104.0],
  [10.4, 104.3],
  [10.8, 105.4],
  [11.2, 105.8],
  [12.0, 107.2],
  [13.0, 107.4],
  [14.5, 107.3],
  [16.2, 107.0],
  [17.5, 105.8],
  [18.5, 104.8],
  [19.5, 104.0],
  [20.8, 103.8],
  [21.2, 102.8]
];

/**
 * Checks if a coordinate is within the simplified boundary of Vietnam.
 * 
 * @param lat Latitude
 * @param lng Longitude
 * @returns true if inside Vietnam, false otherwise
 */
export function isCoordinateInVietnam(lat: number, lng: number): boolean {
  let inside = false;
  for (let i = 0, j = VIETNAM_POLYGON.length - 1; i < VIETNAM_POLYGON.length; j = i++) {
    const xi = VIETNAM_POLYGON[i][0], yi = VIETNAM_POLYGON[i][1];
    const xj = VIETNAM_POLYGON[j][0], yj = VIETNAM_POLYGON[j][1];
    
    const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Fetches routing path between coordinates using OSRM.
 * 
 * @param coordinates Array of [latitude, longitude] pairs (typically exactly 2 points for a segment)
 * @param signal AbortSignal for aborting the request
 * @returns Array of [latitude, longitude] representing the route, or null if failed
 */
export async function fetchOSRMRoute(
  coordinates: [number, number][],
  signal?: AbortSignal
): Promise<[number, number][] | null> {
  if (coordinates.length < 2) return null;

  try {
    const waypoints = coordinates
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;

    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM engine returned code: ${data.code}`);
    }

    const geom = data.routes[0].geometry;
    if (geom && geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
      // OSRM returns [lon, lat], Leaflet wants [lat, lon]
      const coords: [number, number][] = geom.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
      
      // Ensure all coordinates are inside Vietnam territory
      const allInVietnam = coords.every(([lat, lng]) => isCoordinateInVietnam(lat, lng));
      if (!allInVietnam) {
        throw new Error('OSRM route path contains coordinates outside Vietnam territory.');
      }
      
      return coords;
    }

    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    
    console.warn(
      `[Routing Service] Failed to fetch route from OSRM:`, error,
      `\nPossible causes:\n` +
      `- OSRM route crossed borders outside Vietnam.\n` +
      `- OSRM public demo server (router.project-osrm.org) is offline, rate-limited, or blocked by network policies.\n` +
      `- Client is offline or has network issues.\n\n` +
      `Alternative solutions for this project:\n` +
      `1. Use Mapbox Directions API (requires a Mapbox account and public access token).\n` +
      `2. Use GraphHopper API (requires a GraphHopper API key).\n` +
      `3. Deploy a local/private OSRM backend server using Docker:\n` +
      `   docker run -t -v "\$(pwd):/data" osrm/osrm-backend osrm-extract -p /usr/local/share/osrm/profiles/car.lua /data/vietnam-latest.osm.pbf`
    );
    return null;
  }
}
