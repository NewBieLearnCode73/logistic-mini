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

// In-memory cache for road routes (origin-destination pairs)
const routeCache = new Map<string, [number, number][]>();

/**
 * Generates a unique string key for route cache based on start and end points.
 */
function getRouteCacheKey(start: [number, number], end: [number, number]): string {
  return `${start[0].toFixed(5)},${start[1].toFixed(5)}_${end[0].toFixed(5)},${end[1].toFixed(5)}`;
}

/**
 * Key corridor waypoints along National Route 1A in Vietnam to prevent routing through neighboring countries (Laos/Cambodia).
 */
const VIETNAM_CORRIDOR_WAYPOINTS: [number, number][] = [
  [10.93, 108.10], // Phan Thiet
  [12.25, 109.19], // Nha Trang
  [13.77, 109.22], // Quy Nhon
  [16.07, 108.22], // Da Nang
  [18.67, 105.68], // Vinh
  [19.80, 105.78]  // Thanh Hoa
];

/**
 * Evaluates and returns intermediate waypoints along Vietnam's North-South corridor
 * based on the start and end coordinates to keep the route inside Vietnam.
 */
function getVietnamCorridorWaypoints(start: [number, number], end: [number, number]): [number, number][] {
  const minLat = Math.min(start[0], end[0]);
  const maxLat = Math.max(start[0], end[0]);

  // Only insert checkpoints if the latitude span is significant (e.g. > 1.5 degrees)
  if (maxLat - minLat < 1.5) {
    return [];
  }

  // Filter checkpoints whose latitudes are strictly between start and end
  const intermediate = VIETNAM_CORRIDOR_WAYPOINTS.filter(
    (wp) => wp[0] > minLat + 0.1 && wp[0] < maxLat - 0.1
  );

  // Sort based on travel direction (South to North or North to South)
  if (start[0] < end[0]) {
    intermediate.sort((a, b) => a[0] - b[0]);
  } else {
    intermediate.sort((a, b) => b[0] - a[0]);
  }

  return intermediate;
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

  const startNode = coordinates[0];
  const endNode = coordinates[coordinates.length - 1];
  const cacheKey = getRouteCacheKey(startNode, endNode);

  // 1. Check in-memory cache
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey) || null;
  }

  // 2. Validate start and end coordinates are in Vietnam before sending API call
  if (!isCoordinateInVietnam(startNode[0], startNode[1]) || !isCoordinateInVietnam(endNode[0], endNode[1])) {
    console.warn(`[Routing Service] Origin or Destination is outside Vietnam territory. Bypassing OSRM.`);
    return null;
  }

  try {
    // Inject intermediate corridor waypoints if routing a single direct segment
    let routingPoints = coordinates;
    if (coordinates.length === 2) {
      const intermediates = getVietnamCorridorWaypoints(startNode, endNode);
      routingPoints = [startNode, ...intermediates, endNode];
    }

    const waypoints = routingPoints
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
      
      // Store in memory cache
      routeCache.set(cacheKey, coords);
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
      `- OSRM public demo server (router.project-osrm.org) is offline or rate-limited.\n` +
      `- Client has network connectivity issues.\n`
    );
    return null;
  }
}
