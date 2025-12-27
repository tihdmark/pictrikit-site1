// Service Worker for PictriKit
// 版本号更新会触发旧缓存清理
const CACHE_NAME = 'pictrikit-v1.6.5';

// 只缓存静态资源，不缓存 HTML 页面
const STATIC_ASSETS = [
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

// HTML 页面列表 - 使用 Network-First 策略
const HTML_PAGES = ['/', '/app.html', '/features.html', '/tutorial.html', '/faq.html', '/changelog.html'];

// Install event - cache static assets only
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

// Activate event - clean up ALL old caches immediately
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

// Fetch event - Network-First for HTML, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests (CDN resources)
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  const url = new URL(event.request.url);
  const isHTML = event.request.headers.get('accept')?.includes('text/html') || 
                 HTML_PAGES.some(page => url.pathname === page || url.pathname === page.replace('.html', ''));
  
  if (isHTML) {
    // Network-First for HTML pages - always try network first
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Only fallback to cache if network fails (offline)
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-First for static assets
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, responseClone));
              }
              return response;
            });
        })
    );
  }
});
