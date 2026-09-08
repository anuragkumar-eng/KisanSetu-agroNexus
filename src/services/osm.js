/**
 * OSM Location and Routing Service
 * Uses OpenStreetMap's Nominatim API for geocoding and OSRM for routing.
 * Respects free-tier usage rules (User-Agent, rate limiting).
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const OSRM_BASE_URL = 'https://router.project-osrm.org';

const HEADERS = {
  'User-Agent': 'KisanSetu-Prototype/1.0 (Student Project)',
  'Accept': 'application/json'
};

/**
 * Search for a location using Nominatim.
 * @param {string} query Search query (e.g., 'Kanpur', 'IIT Kanpur')
 * @returns {Promise<Array>} Array of location objects { display_name, lat, lon }
 */
export async function searchLocation(query) {
  if (!query || query.trim().length < 3) return [];
  try {
    const response = await fetch(
      `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
      { headers: HEADERS }
    );
    if (!response.ok) throw new Error('Nominatim API error');
    const data = await response.json();
    return data.map(item => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('Location search failed:', error);
    throw new Error('Unable to search location right now. Please try again.');
  }
}

/**
 * Calculate driving distance between two coordinates using OSRM.
 * @param {number} lat1 Source latitude
 * @param {number} lon1 Source longitude
 * @param {number} lat2 Destination latitude
 * @param {number} lon2 Destination longitude
 * @returns {Promise<number>} Distance in kilometres
 */
export async function getDrivingDistance(lat1, lon1, lat2, lon2) {
  try {
    // OSRM format: lon,lat
    const response = await fetch(
      `${OSRM_BASE_URL}/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`,
      { headers: HEADERS }
    );
    if (!response.ok) throw new Error('OSRM API error');
    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    // Distance is returned in meters, convert to km
    return data.routes[0].distance / 1000;
  } catch (error) {
    console.error('Distance calculation failed:', error);
    throw new Error('Unable to calculate driving distance.');
  }
}
