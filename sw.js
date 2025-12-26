// Service Worker for PictriKit
const CACHE_NAME = 'pictrikit-v1.4.0';
const STATIC_ASSETS = [
  '/',
  '/app.html',
  '/index.html',
  '/features.html',
  '/tutorial.html',
  '/faq.html',
  '/assets/css/main.css',
  '/assets/css/pages.css',
  '/assets/js/app.js',
  '/assets/js/i18n.js',
  '/assets/js/components.js',
  '/src/state/state.js',
  '/src/canvas/initCanvas.js',
  '/src/canvas/selection.js',
  '/src/canvas/group.js',
  '/src/canvas/transform.js',
  '/src/upload/imageUpload.js',
  '/src/layout/containers.js',
  '/src/layout/templates.js',
  '/lang/en.json',
  '/lang/zh-CN.json',
  '/lang/ja.json',
  '/lang/ko.json',
  '/favicon.svg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests (CDN resources)
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          event.waitUntil(
            fetch(event.request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => cache.put(event.request, response));
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Offline fallback for HTML pages
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
          });
      })
  );
});
