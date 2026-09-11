/** Convert Photon GeoJSON to the existing camera-framing contract. */
export function normalizePhotonPlace(feature) {
  const [lng, lat] = feature?.geometry?.coordinates || [];
  const p = feature?.properties || {};
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const kind = p.type || p.osm_value;
  const type = ({ country: 'country', state: 'administrative_area_level_1', county: 'administrative_area_level_2', city: 'locality', town: 'locality', village: 'locality', district: 'neighborhood', suburb: 'neighborhood', neighbourhood: 'neighborhood', street: 'route' })[kind]
    || (p.osm_key === 'highway' ? 'route' : p.osm_value === 'park' ? 'park' : p.osm_key === 'natural' ? 'natural_feature' : 'point_of_interest');
  const label = [...new Set([p.name, [p.housenumber, p.street].filter(Boolean).join(' '), p.city, p.state, p.country].filter(Boolean))].join(', ');
  const geometry = { location: { lat, lng } };
  const box = p.extent;
  if (Array.isArray(box) && box.length === 4 && box.every(Number.isFinite) && box[1] >= box[3] && Math.abs(box[1]) <= 90 && Math.abs(box[3]) <= 90 && Math.abs(box[0]) <= 180 && Math.abs(box[2]) <= 180) {
    geometry.viewport = { southwest: { lat: box[3], lng: box[0] }, northeast: { lat: box[1], lng: box[2] } };
  }
  return { formatted_address: label || `${lat}, ${lng}`, types: [type], geometry };
}
