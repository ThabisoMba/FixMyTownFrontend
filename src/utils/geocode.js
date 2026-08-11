/**
 * geocode.js
 * ----------
 * Turns a clicked map coordinate into a human-readable place name
 * (e.g. "Sandton, Johannesburg") using OpenStreetMap's free Nominatim
 * reverse-geocoding API - no API key required, matches the same
 * "© OpenStreetMap" data already powering the map tiles.
 *
 * NOTE: Nominatim's public endpoint is meant for light, occasional
 * use (their usage policy asks for max ~1 request/second and no
 * heavy automated traffic). That's exactly the pattern here - one
 * lookup per map click - so it's fine for this project. If you ever
 * needed heavier volume in production, you'd self-host Nominatim or
 * switch to a paid geocoding provider (Google, Mapbox, etc.) instead.
 */

export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=12&addressdetails=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const address = data.address || {};

    // Prefer the smallest well-known area name, falling back to bigger ones
    const place =
      address.suburb ||
      address.neighbourhood ||
      address.town ||
      address.city_district ||
      address.city ||
      address.county;

    if (!place) return data.display_name?.split(',')[0] || null;

    // Pair it with the city/town if that's not already what we picked
    const city = address.city || address.town;
    return city && city !== place ? `${place}, ${city}` : place;
  } catch {
    // Network hiccup or the free service being briefly unavailable -
    // fail quietly, the caller falls back to a generic label.
    return null;
  }
}
