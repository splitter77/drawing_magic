// Aggressive Cachebuster Service Worker for Notes PWA
const BUILD_TIMESTAMP = '20261014_174000';
const CACHE_NAME = 'notes-cb-' + BUILD_TIMESTAMP;
const BASE_PATH = '/apps/drawing/';

// Clean and install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Purge all old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first strategy for everything (always fetch fresh, fallback to cache only if offline)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Never cache requests with ?nocache or service worker requests
  const url = new URL(event.request.url);
  if (url.searchParams.has('nocache') || url.pathname.endsWith('sw.js')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Offline fallback
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_PATH}index.html`);
          }
        });
      })
  );
});

// Allow manual trigger to skip waiting or purge
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'PURGE_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});
