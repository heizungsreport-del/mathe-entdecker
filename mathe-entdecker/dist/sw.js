// The production build derives this version from every shipped file.
const VERSION = '__BUILD_VERSION__';
const BASE = new URL('./', self.location.href);
const PREFIX = `mathe-entdecker:${BASE.pathname}:`;
const CACHE = PREFIX + VERSION;
const FILES = ['./', 'index.html', 'app.js', 'style.css', 'pwa.js', 'manifest.webmanifest',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
const URLS = FILES.map(path => new URL(path, BASE).href);

self.addEventListener('install', event => {
  // Atomic install: one missing file leaves the old worker usable.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    URLS.map(url => new Request(url, { cache: 'reload' }))
  )));
  // Do not force a new version into an unfinished exercise.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  const normalized = new URL(url.pathname, BASE).href;
  // Only intercept known assets and the two app entry URLs, never sibling sites.
  if (!URLS.includes(normalized)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(normalized);
    // Serve a consistent version of HTML and assets, also when the network fails.
    if (cached) return cached;
    return fetch(request);
  })());
});
