import { normalizePhotonPlace } from '../src/data/placeSearch.js';

export function placeSearchProxy() {
  const cache = new Map();
  const pending = new Map();
  let queue = Promise.resolve();
  let lastRequest = 0;
  async function lookup(query) {
    const cached = cache.get(query);
    if (cached && Date.now() - cached.time < 86400000) return cached.data;
    if (pending.has(query)) return pending.get(query);
    if (pending.size >= 8) throw new Error('Search is busy. Please try again shortly.');
    const task = queue.then(async () => {
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 1100 - (Date.now() - lastRequest))));
      lastRequest = Date.now();
      const url = new URL(process.env.GEV_PHOTON_URL || 'https://photon.komoot.io/api/');
      url.searchParams.set('q', query);
      url.searchParams.set('limit', '1');
      url.searchParams.set('lang', 'en');
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'GodsEyeView-Local/0.1 (https://github.com/bilawalsidhu/gods-eye-view)' } });
      if (!response.ok) throw new Error('Location search service is unavailable. Try again shortly.');
      const payload = await response.json();
      if (!Array.isArray(payload.features)) throw new Error('Location search returned an invalid response.');
      const results = payload.features.map(normalizePhotonPlace).filter(Boolean);
      const data = { status: results.length ? 'OK' : 'ZERO_RESULTS', results, provider: 'Photon / OpenStreetMap' };
      if (cache.size >= 200) cache.delete(cache.keys().next().value);
      cache.set(query, { time: Date.now(), data });
      return data;
    });
    queue = task.catch(() => {});
    pending.set(query, task);
    try { return await task; } finally { pending.delete(query); }
  }
  function install(server) {
    server.middlewares.use('/api/location-search', async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      if (req.method !== 'GET') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Use GET for location search.' })); return; }
      const query = new URL(req.url, 'http://localhost').searchParams.get('q')?.trim();
      if (!query || query.length > 200) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Enter a location using 1–200 characters.' })); return; }
      try { res.end(JSON.stringify(await lookup(query))); }
      catch { res.statusCode = 503; res.end(JSON.stringify({ error: 'Location search is unavailable. Please try again shortly.' })); }
    });
  }
  return { name: 'keyless-location-search', configureServer: install, configurePreviewServer: install };
}
