class GeocodingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GeocodingError';
  }
}

async function geocodeAddress(address) {
  const key = process.env.OPENCAGE_API_KEY;
  if (!key) throw new GeocodingError('Geocoding API key not configured');
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${key}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new GeocodingError('Geocoding service unavailable');
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new GeocodingError('Address not found. Please try a more specific address.');
  }
  const { lng, lat } = data.results[0].geometry;
  return [lng, lat];
}

function buildNearSphereQuery(lng, lat, radiusKm) {
  return {
    $nearSphere: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: radiusKm * 1000
    }
  };
}

function haversineDistance(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { geocodeAddress, buildNearSphereQuery, haversineDistance, GeocodingError };
