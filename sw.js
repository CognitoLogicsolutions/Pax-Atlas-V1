// CognitoVault Run Phase - Service Worker v0.1.0
const CACHE_NAME = 'cognitovault-run-v1';
const CACHE_PATHS = [
  '/',
  '/index.html',
  '/app.js',
  '/TECHNICAL_SPEC.md'
];

// Install: cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_PATHS))
      .then(() => {
        console.log('✅ SW: Cache populated');
        self.skipWaiting();
      })
  );
});

// Fetch: serve from cache (offline-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        console.log('✅ SW: Offline handling active');
        return caches.match('/index.html'); // SPA fallback
      })
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ SW: Activated + old caches cleaned');
      self.clients.claim();
    })
  );
});
