const CACHE_NAME = 'mapcraft-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de cache: network first, fallback to cache
self.addEventListener('fetch', event => {
  // Ne pas mettre en cache les appels API externes
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('mapbox.com') ||
      event.request.url.includes('maptiler.com') ||
      event.request.url.includes('cartocdn.com')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});