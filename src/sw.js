// sw.js — Cache Only für GETs, niemals Netz
const CACHE = 'Kewbo-v1.0.0';  // bei jeder Änderung hochzählen

// Passe die Liste exakt an deine Dateien an:
const ASSETS = [
  './',                      // App-Shell (dein Start unter ./)
  './index.html',
  './manifest.json',
  './assets/background.gif',
  './assets/favicon.ico',
  './assets/favicon-32x32.png',
  './assets/favicon-16x16.png',
  './assets/apple-touch-icon.png',
  './assets/android-chrome-192x192.png',
  './assets/android-chrome-512x512.png',
  './assets/kofi.png',
  './assets/app.css', 
  './assets/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      // mit cache:'reload', um wirklich frisch zu cachen
      Promise.all(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' }))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Webhook-POSTs etc. laufen weiterhin übers Netz (und sollen offline scheitern)
  if (e.request.method !== 'GET') return;

  // Navigationsanfragen IMMER auf die gecachte Shell (index.html) mappen
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('./index.html'));
    return;
  }

  // Für andere GETs: Cache Only (optional: ignoreSearch, falls ?v=...-Parameter dran sind)
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      // Nichts im Cache -> bewusst KEIN Netzversuch
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
