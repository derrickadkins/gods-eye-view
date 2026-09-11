# Running this fork on another computer

Use Node.js 24.14 or newer in the 24.x line, or Node.js 26.x.

```sh
git clone https://github.com/derrickadkins/gods-eye-view.git
cd gods-eye-view
npm ci
npm run doctor
node scripts/local-built-server.mjs
```

Open http://localhost:4173. The local launcher rebuilds the client and retains the app's live-data API routes while avoiding development dependency prebundling issues on Windows. It works without machine-specific paths.

For ordinary development, use `npm run dev` instead.

This fork includes keyless location search via Photon, Google Maps search when a key is configured, accurate search-provider labels, and a Windows credential-permission verification fix.

Provider keys are deliberately excluded from Git. On each computer, use **POWER UP → Provider Settings** to add your own Google Maps key and other optional credentials. The Google key needs Geocoding API, Places API (New), and Map Tiles API enabled and allowed by its API restrictions. Provider usage may incur charges.

Do not commit `.env`, build output, logs, or runtime state. The public Photon service permits reasonable usage without an availability guarantee; the keyless proxy caches results and spaces requests. Set `GEV_PHOTON_URL` to use another Photon instance.

