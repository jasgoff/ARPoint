/* eslint-disable no-restricted-globals */

// AR Survey PWA - Service Worker
// Strategy:
//   * Same-origin app shell (HTML/manifest/icons) → cache-first
//   * Same-origin JS/CSS bundles → network-first (avoids stale-bundle trap)
//   * Map tile providers (ESRI / OpenStreetMap / Nominatim) → network-first
//     with cache fallback (so offline reuse works after first online visit)
//   * Any other cross-site request → BLOCKED (Response.error()) to keep the
//     package strictly self-sufficient per user requirement.

const CACHE_VERSION = 'v1.4.0';
const APP_SHELL_CACHE = `ar-survey-shell-${CACHE_VERSION}`;
const MAP_TILE_CACHE = `ar-survey-tiles-${CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Whitelisted external domains that ARE allowed to be fetched from the network
// when an internet connection is available. Everything else cross-origin is
// blocked to enforce self-sufficient operation.
const MAP_TILE_HOST_PATTERNS = [
  /(^|\.)arcgisonline\.com$/i,         // ESRI satellite/world imagery
  /(^|\.)tile\.openstreetmap\.org$/i,  // OSM standard tiles
  /(^|\.)openstreetmap\.org$/i,        // OSM (other subdomains)
  /(^|\.)nominatim\.openstreetmap\.org$/i, // Geocoding
  /(^|\.)basemaps\.cartocdn\.com$/i,   // CARTO basemaps (sometimes used by Leaflet)
  /(^|\.)tile\.opentopomap\.org$/i     // OpenTopoMap (alt tile layer)
];

const isMapTileRequest = (url) => MAP_TILE_HOST_PATTERNS.some((re) => re.test(url.hostname));

// Install: pre-cache the static app shell so the app boots offline.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch((err) => console.warn('[SW] Pre-cache failed:', err))
  );
  self.skipWaiting();
});

// Activate: evict caches from older versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names
        .filter((name) => name !== APP_SHELL_CACHE && name !== MAP_TILE_CACHE)
        .map((name) => caches.delete(name))
    ))
  );
  self.clients.claim();
});

// --- Fetch strategies ---------------------------------------------------------

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    // App shell offline fallback
    const fallback = await cache.match('/index.html');
    if (fallback) return fallback;
    throw err;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.destination === 'document') {
      const shellFallback = await cache.match('/index.html');
      if (shellFallback) return shellFallback;
    }
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET — let the browser deal with POST/PUT/etc.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1. Same-origin requests
  if (sameOrigin) {
    // API calls: bypass SW entirely (let app handle online/offline directly)
    if (url.pathname.startsWith('/api/')) return;

    // JS / CSS bundles: network-first so users always pick up the latest build
    // (this is what prevents the "stale slider with step=15" trap).
    if (url.pathname.startsWith('/static/js/') || url.pathname.startsWith('/static/css/')) {
      event.respondWith(networkFirst(request, APP_SHELL_CACHE));
      return;
    }

    // App shell / icons / manifest: cache-first for fast offline boot
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE));
    return;
  }

  // 2. Cross-origin map tile providers: network-first with offline cache fallback
  if (isMapTileRequest(url)) {
    event.respondWith(networkFirst(request, MAP_TILE_CACHE));
    return;
  }

  // 3. All other cross-origin requests: BLOCKED to enforce self-sufficiency.
  //    Returning Response.error() makes fetch() reject in the page, mimicking
  //    a network failure — this prevents accidental cross-site beacons while
  //    keeping the app functional offline.
  event.respondWith(Response.error());
});

// Background sync hook (no-op for now; placeholder for future MongoDB sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(Promise.resolve());
  }
});

// Allow the page to trigger an immediate SW upgrade after a deploy.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
